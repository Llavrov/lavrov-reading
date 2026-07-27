import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllChapterSlugs, getChapter, chapters } from "@/lib/chapters";
import { site } from "@/lib/site";

type Params = { chapter: string };

export function generateStaticParams(): Params[] {
  return getAllChapterSlugs().map((chapter) => ({ chapter }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const c = getChapter(chapter);
  if (!c) return {};
  const t = `Глава ${c.num}. ${c.title} - Сырой слой`;
  return {
    title: t,
    description: `Читать главу ${c.num} «${c.title}» манги «Сырой слой».`,
    alternates: { canonical: `${site.url}/manga/read/${chapter}` },
  };
}

export default async function Reader({
  params,
}: {
  params: Promise<Params>;
}) {
  const { chapter } = await params;
  const c = getChapter(chapter);
  if (!c) notFound();

  const idx = chapters.findIndex((x) => x.slug === c.slug);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <div className="reader">
      <header className="reader__bar">
        <Link href="/manga/read" className="reader__back">
          ← главы
        </Link>
        <span className="reader__title">
          Глава {c.num}. {c.title}
          {c.status ? <span className="reader__badge">{c.status}</span> : null}
        </span>
      </header>

      <div className="reader__strip">
        {/* Вебтун-лента главы. eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.strip} alt={`Глава ${c.num}. ${c.title}`} />
      </div>

      {c.note ? <p className="reader__note">{c.note}</p> : null}

      <nav className="reader__nav">
        {prev ? (
          <Link href={`/manga/read/${prev.slug}`}>← Глава {prev.num}</Link>
        ) : (
          <span className="reader__nav-empty">Это первая глава</span>
        )}
        <Link href="/manga/read" className="reader__nav-list">
          Все главы
        </Link>
        {next ? (
          <Link href={`/manga/read/${next.slug}`}>Глава {next.num} →</Link>
        ) : (
          <span className="reader__nav-empty">Продолжение скоро</span>
        )}
      </nav>
    </div>
  );
}
