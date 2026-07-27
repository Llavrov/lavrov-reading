import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { Marked } from "marked";

// Отдельный «проект» читальни: гайды по своей манге/вебтуну.
// Живут в content/manga/*.md, рендерятся как обычный markdown (с GFM-таблицами)
// через marked — отдельно от MDX-конспектов, чтобы не смешиваться с ними.

const GUIDES_DIR = path.join(process.cwd(), "content", "manga");

// Внешние ссылки открываем в новой вкладке — как в mdx-компонентах.
const marked = new Marked({ gfm: true });
marked.use({
  renderer: {
    link({ href, title, text }) {
      const external = /^https?:\/\//.test(href);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      const t = title ? ` title="${title}"` : "";
      return `<a href="${href}"${t}${attrs}>${text}</a>`;
    },
  },
});

export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  order: number;
  readingMinutes: number;
};

export type Guide = GuideMeta & {
  html: string; // отрендеренный markdown
};

function readRaw(slug: string): { data: Record<string, unknown>; content: string } {
  const fullPath = path.join(GUIDES_DIR, `${slug}.md`);
  const raw = fs.readFileSync(fullPath, "utf8");
  return matter(raw);
}

function toMeta(slug: string, data: Record<string, unknown>, content: string): GuideMeta {
  const stats = readingTime(content);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    order: typeof data.order === "number" ? data.order : 999,
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
  };
}

// Убираем первый H1 из тела — заголовок показываем из фронтматтера,
// чтобы не дублировался на странице.
function stripLeadingH1(content: string): string {
  return content.replace(/^\s*#\s+.+\n+/, "");
}

export function getAllGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getGuide(slug: string): Guide {
  const { data, content } = readRaw(slug);
  const body = stripLeadingH1(content);
  return { ...toMeta(slug, data, content), html: marked.parse(body) as string };
}

export function getAllGuides(): GuideMeta[] {
  return getAllGuideSlugs()
    .map((slug) => {
      const { data, content } = readRaw(slug);
      return toMeta(slug, data, content);
    })
    .sort((a, b) => a.order - b.order);
}
