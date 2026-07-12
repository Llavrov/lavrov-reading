import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { getAllSlugs, getArticle, formatDate } from "@/lib/articles";
import { mdxComponents } from "@/components/mdx";
import { ReadingProgress } from "@/components/ReadingProgress";
import { OwnerZone } from "@/components/OwnerZone";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!getAllSlugs().includes(slug)) return {};
  const a = getArticle(slug);
  const url = `${site.url}/${slug}`;
  return {
    title: a.title,
    description: a.description,
    keywords: a.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: a.title,
      description: a.description,
      publishedTime: a.date || undefined,
      authors: [site.author],
      tags: a.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: a.title,
      description: a.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!getAllSlugs().includes(slug)) notFound();

  const a = getArticle(slug);
  const { content } = await compileMDX({
    source: a.content,
    components: mdxComponents,
    options: { parseFrontmatter: true },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date || undefined,
    author: { "@type": "Person", name: site.author },
    keywords: a.tags.join(", "),
    mainEntityOfPage: `${site.url}/${slug}`,
  };

  return (
    <>
      <ReadingProgress />
      <main className="wrap article">
        <Link href="/" className="article__back">
          ← ко всем конспектам
        </Link>

        <article>
          <h1 className="article__title">{a.title}</h1>
          <div className="article__meta">
            <span>{formatDate(a.date)}</span>
            <span>{a.readingMinutes} мин чтения</span>
            {a.tags.length ? <span>{a.tags.join(" · ")}</span> : null}
          </div>

          <div className="prose">{content}</div>

          {a.sources.length ? (
            <section className="sources">
              <h2 className="sources__title">Источники</h2>
              <ul>
                {a.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>

        <OwnerZone slug={slug} questions={a.questions} />
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
