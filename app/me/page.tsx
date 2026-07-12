import Link from "next/link";
import { Star, BookOpen, MessageSquare } from "lucide-react";
import { getAllArticles } from "@/lib/articles";
import { sql, hasDb } from "@/lib/db";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

type Row = {
  slug: string;
  title: string;
  reads: number;
  last: string | null;
  rating: number | null;
  answered: number;
};

function formatLast(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

async function loadRows(): Promise<Row[]> {
  const articles = getAllArticles();
  if (!hasDb()) {
    return articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      reads: 0,
      last: null,
      rating: null,
      answered: 0,
    }));
  }
  const db = sql();
  const [reads, feedback, answers] = await Promise.all([
    db`select slug, count(*)::int as reads, max(read_at) as last from reads group by slug`,
    db`select slug, rating from feedback`,
    db`select slug, count(*)::int as answered from answers where answer is not null and answer <> '' group by slug`,
  ]);
  const rmap = new Map((reads as { slug: string; reads: number; last: string }[]).map((r) => [r.slug, r]));
  const fmap = new Map((feedback as { slug: string; rating: number }[]).map((r) => [r.slug, r.rating]));
  const amap = new Map((answers as { slug: string; answered: number }[]).map((r) => [r.slug, r.answered]));

  return articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    reads: rmap.get(a.slug)?.reads ?? 0,
    last: rmap.get(a.slug)?.last ?? null,
    rating: fmap.get(a.slug) ?? null,
    answered: amap.get(a.slug) ?? 0,
  }));
}

export default async function MePage() {
  const rows = await loadRows();
  const total = rows.reduce((s, r) => s + r.reads, 0);

  return (
    <main className="wrap dash">
      <header className="dash__head">
        <div>
          <h1 className="dash__title">Мой прогресс</h1>
          <p className="dash__sub">
            {rows.length} статей · {total} прочтений
          </p>
        </div>
        <LogoutButton />
      </header>

      {!hasDb() && (
        <p className="dash__note">
          База ещё не подключена — подключи Neon на Vercel, и здесь появятся
          цифры чтения и оценки.
        </p>
      )}

      <ul className="dash-list">
        {rows.map((r) => (
          <li key={r.slug} className="dash-list__item">
            <Link href={`/${r.slug}`} className="dash-list__title">
              {r.title}
            </Link>
            <div className="dash-list__stats">
              <span title="прочтений">
                <BookOpen size={14} /> {r.reads}
                {r.last ? ` · ${formatLast(r.last)}` : ""}
              </span>
              <span title="оценка">
                <Star size={14} /> {r.rating ?? "—"}
              </span>
              <span title="ответов на вопросы">
                <MessageSquare size={14} /> {r.answered}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
