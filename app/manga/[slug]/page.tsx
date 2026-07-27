import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllGuideSlugs, getGuide } from "@/lib/guides";
import { ReadingProgress } from "@/components/ReadingProgress";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!getAllGuideSlugs().includes(slug)) return {};
  const g = getGuide(slug);
  const url = `${site.url}/manga/${slug}`;
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: g.title,
      description: g.description,
      authors: [site.author],
    },
    twitter: { card: "summary_large_image", title: g.title, description: g.description },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!getAllGuideSlugs().includes(slug)) notFound();

  const g = getGuide(slug);

  return (
    <>
      <ReadingProgress />
      <main className="wrap article">
        <Link href="/manga" className="article__back">
          ← к проекту «Манга»
        </Link>

        <article>
          <h1 className="article__title">{g.title}</h1>
          <div className="article__meta">
            <span>{g.readingMinutes} мин чтения</span>
            <span>проект «Манга»</span>
          </div>

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: g.html }}
          />
        </article>
      </main>
    </>
  );
}
