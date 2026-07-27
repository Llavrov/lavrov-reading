import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/lib/chapters";
import { site } from "@/lib/site";

const title = "Сырой слой - читать";
const description = "Главы манги «Сырой слой». Рациональный герой ломает божественную Систему как машину.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${site.url}/manga/read` },
  openGraph: { type: "website", url: `${site.url}/manga/read`, title, description },
};

export default function ChaptersIndex() {
  return (
    <main className="wrap home">
      <Link href="/manga" className="article__back">
        ← к проекту «Манга»
      </Link>

      <h1 className="project__title">Сырой слой</h1>
      <p className="home__lead">
        Главы манги. Чёрный список - это то, что уже отрисовано; арт-пассы -
        черновые (без бабблов, консистентность допиливается).
      </p>

      <ul className="chapter-list">
        {chapters.map((c) => (
          <li key={c.slug} className="chapter-list__item">
            <Link href={`/manga/read/${c.slug}`} className="chapter-card">
              <span
                className="chapter-card__cover"
                style={{ backgroundImage: `url(${c.cover})` }}
              />
              <span className="chapter-card__body">
                <span className="chapter-card__num">Глава {c.num}</span>
                <span className="chapter-card__title">{c.title}</span>
                {c.status ? (
                  <span className="chapter-card__badge">{c.status}</span>
                ) : null}
              </span>
              <span className="chapter-card__go">Читать →</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
