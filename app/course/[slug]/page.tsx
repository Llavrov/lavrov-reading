import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { getAllLessons, getAllLessonSlugs, getLesson, readsKey, course } from "@/lib/course";
import { mdxComponents } from "@/components/mdx";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ReadTracker } from "@/components/ReadTracker";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllLessonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  if (!getAllLessonSlugs().includes(slug)) return {};
  const l = getLesson(slug);
  return {
    title: `${l.title} — ${course.title}`,
    description: l.description,
    alternates: { canonical: `${site.url}/course/${slug}` },
  };
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!getAllLessonSlugs().includes(slug)) notFound();

  const l = getLesson(slug);
  const all = getAllLessons();
  const idx = all.findIndex((x) => x.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  const { content } = await compileMDX({
    source: l.content,
    components: mdxComponents,
    options: { parseFrontmatter: true },
  });

  return (
    <>
      <ReadingProgress />
      <ReadTracker slug={readsKey(slug)} />
      <main className="wrap article">
        <Link href="/course" className="article__back">← к курсу «{course.title}»</Link>

        <article>
          <div className="lesson__badge">{l.week}{l.level ? ` · ${l.level}` : ""}</div>
          <h1 className="article__title">{l.title}</h1>
          <div className="article__meta">
            <span>{l.readingMinutes} мин чтения</span>
          </div>

          <div className="prose">{content}</div>

          {l.questions.length ? (
            <section className="sources">
              <h2 className="sources__title">Проверь себя</h2>
              <ul>
                {l.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {l.sources.length ? (
            <section className="sources">
              <h2 className="sources__title">Источник</h2>
              <ul>
                {l.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>

        <nav className="lesson-nav">
          {prev ? (
            <Link href={`/course/${prev.slug}`} className="lesson-nav__link lesson-nav__link--prev">
              ← {prev.week}
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/course/${next.slug}`} className="lesson-nav__link lesson-nav__link--next">
              {next.week} →
            </Link>
          ) : <span />}
        </nav>
      </main>
    </>
  );
}
