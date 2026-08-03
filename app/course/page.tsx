import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, CircleDot, Circle, Clock, CalendarDays } from "lucide-react";
import { course, getAllLessons, readsKey, type LessonMeta } from "@/lib/course";
import { sql, hasDb } from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: course.title,
  description: course.lead,
  alternates: { canonical: `${site.url}/course` },
};

type Prog = { last: string | null; pct: number; reads: number; secs: number };

async function loadProgress(keys: string[]): Promise<Map<string, Prog>> {
  const map = new Map<string, Prog>();
  if (!hasDb() || keys.length === 0) return map;
  const db = sql();
  type R = { slug: string; last: string | null; pct: number; reads: number; secs: number };
  let rows: R[];
  try {
    rows = (await db`
      select slug, max(read_at) as last, max(scroll_pct)::int as pct,
             count(*)::int as reads, coalesce(sum(seconds), 0)::int as secs
      from reads where slug = any(${keys}) group by slug
    `) as R[];
  } catch {
    // колонки seconds ещё нет (миграция не применена) — читаем без времени
    const base = (await db`
      select slug, max(read_at) as last, max(scroll_pct)::int as pct, count(*)::int as reads
      from reads where slug = any(${keys}) group by slug
    `) as Omit<R, "secs">[];
    rows = base.map((r) => ({ ...r, secs: 0 }));
  }
  for (const r of rows) {
    map.set(r.slug, { last: r.last, pct: r.pct ?? 0, reads: r.reads, secs: r.secs ?? 0 });
  }
  return map;
}

function statusOf(p: Prog | undefined): "done" | "started" | "new" {
  if (!p || p.reads === 0) return "new";
  return p.pct >= 85 ? "done" : "started";
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(iso));
}

function fmtDur(secs: number): string {
  if (!secs) return "—";
  const m = Math.round(secs / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  return `${h} ч ${m % 60} мин`;
}

export default async function CoursePage() {
  const lessons: LessonMeta[] = getAllLessons();
  const keys = lessons.map((l) => readsKey(l.slug));
  const prog = await loadProgress(keys);

  const perLesson = lessons.map((l) => ({ l, p: prog.get(readsKey(l.slug)), st: statusOf(prog.get(readsKey(l.slug))) }));
  const done = perLesson.filter((x) => x.st === "done").length;
  const pctTotal = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const totalSecs = perLesson.reduce((s, x) => s + (x.p?.secs ?? 0), 0);
  const lastStudied = perLesson
    .map((x) => x.p?.last)
    .filter(Boolean)
    .sort()
    .at(-1) as string | undefined;

  return (
    <main className="wrap course">
      <Link href="/" className="article__back">← на главную</Link>

      <header className="course__head">
        <h1 className="course__title">{course.title}</h1>
        <p className="course__lead">{course.lead}</p>
      </header>

      <section className="course-progress">
        <div className="course-progress__row">
          <span className="course-progress__big">{done} / {lessons.length}</span>
          <span className="course-progress__cap">уроков пройдено · {pctTotal}%</span>
        </div>
        <div className="course-progress__bar">
          <div className="course-progress__fill" style={{ width: `${pctTotal}%` }} />
        </div>
        <div className="course-progress__meta">
          <span><CalendarDays size={14} /> последний раз: {fmtDate(lastStudied ?? null)}</span>
          <span><Clock size={14} /> всего: {fmtDur(totalSecs)}</span>
        </div>
        {!hasDb() && (
          <p className="course-progress__note">База не подключена — прогресс появится, когда подключишь Neon.</p>
        )}
      </section>

      <ol className="lesson-list">
        {perLesson.map(({ l, p, st }) => (
          <li key={l.slug} className={`lesson-list__item lesson-list__item--${st}`}>
            <Link href={`/course/${l.slug}`} className="lesson-list__link">
              <span className="lesson-list__icon">
                {st === "done" ? <CheckCircle2 size={20} /> : st === "started" ? <CircleDot size={20} /> : <Circle size={20} />}
              </span>
              <span className="lesson-list__body">
                <span className="lesson-list__top">
                  {l.week}{l.level ? ` · ${l.level}` : ""}
                </span>
                <span className="lesson-list__title">{l.title}</span>
                <span className="lesson-list__desc">{l.description}</span>
                <span className="lesson-list__meta">
                  {l.readingMinutes} мин чтения
                  {st !== "new" ? ` · последний раз ${fmtDate(p?.last ?? null)} · прочитано ${p?.pct ?? 0}%` : ""}
                  {st === "done" ? " · пройдено" : st === "started" ? " · в процессе" : " · не начато"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
