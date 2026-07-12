import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

export type SourceLink = {
  label: string;
  url: string;
};

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO YYYY-MM-DD
  tags: string[];
  sources: SourceLink[];
  questions: string[];
  readingMinutes: number;
};

export type Article = ArticleMeta & {
  content: string; // raw MDX body
};

function readRaw(slug: string): { data: Record<string, unknown>; content: string } {
  const fullPath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(fullPath, "utf8");
  return matter(raw);
}

function toMeta(slug: string, data: Record<string, unknown>, content: string): ArticleMeta {
  const stats = readingTime(content);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    sources: Array.isArray(data.sources) ? (data.sources as SourceLink[]) : [],
    questions: Array.isArray(data.questions) ? (data.questions as string[]) : [],
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getArticle(slug: string): Article {
  const { data, content } = readRaw(slug);
  return { ...toMeta(slug, data, content), content };
}

export function getAllArticles(): ArticleMeta[] {
  return getAllSlugs()
    .map((slug) => {
      const { data, content } = readRaw(slug);
      return toMeta(slug, data, content);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
