import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

// Курс «Анализ систем» — уроки живут в content/course/*.mdx.
// Переиспользуем ту же механику, что и статьи, но с порядком и уровнем.

const COURSE_DIR = path.join(process.cwd(), "content", "course");

export const course = {
  slug: "sistemnyy-analiz",
  title: "Анализ систем",
  lead:
    "Как думать до кода: вытащить требования, найти настоящие части системы, провести границы и выбрать архитектуру под них. Конспект курса Школы сильных программистов — своими словами, с привязкой к реальному бэкенду.",
};

export type CourseSource = { label: string; url: string };

export type LessonMeta = {
  slug: string;
  order: number;
  week: string; // "Неделя 0"
  level: string; // "Kitten" | "House Cat" | ...
  title: string;
  description: string;
  questions: string[];
  sources: CourseSource[];
  readingMinutes: number;
};

export type Lesson = LessonMeta & { content: string };

function readRaw(slug: string): { data: Record<string, unknown>; content: string } {
  const raw = fs.readFileSync(path.join(COURSE_DIR, `${slug}.mdx`), "utf8");
  return matter(raw);
}

function toMeta(slug: string, data: Record<string, unknown>, content: string): LessonMeta {
  const stats = readingTime(content);
  return {
    slug,
    order: Number(data.order ?? 0),
    week: String(data.week ?? ""),
    level: String(data.level ?? ""),
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    questions: Array.isArray(data.questions) ? (data.questions as string[]) : [],
    sources: Array.isArray(data.sources) ? (data.sources as CourseSource[]) : [],
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
  };
}

export function getAllLessonSlugs(): string[] {
  if (!fs.existsSync(COURSE_DIR)) return [];
  return fs
    .readdirSync(COURSE_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getLesson(slug: string): Lesson {
  const { data, content } = readRaw(slug);
  return { ...toMeta(slug, data, content), content };
}

export function getAllLessons(): LessonMeta[] {
  return getAllLessonSlugs()
    .map((slug) => {
      const { data, content } = readRaw(slug);
      return toMeta(slug, data, content);
    })
    .sort((a, b) => a.order - b.order);
}

// slug урока в таблице reads — с префиксом, чтобы не смешивать со статьями.
export function readsKey(slug: string): string {
  return `course:${slug}`;
}
