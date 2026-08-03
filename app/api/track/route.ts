import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";

export async function POST(req: Request) {
  const { slug, scroll_pct, seconds } = (await req.json().catch(() => ({}))) as {
    slug?: string;
    scroll_pct?: number;
    seconds?: number;
  };
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: true, persisted: false });
  const pct = Math.max(0, Math.min(100, Math.round(scroll_pct ?? 0)));
  const secs = Math.max(0, Math.min(24 * 3600, Math.round(seconds ?? 0)));
  const db = sql();
  try {
    await db`insert into reads (slug, scroll_pct, seconds) values (${slug}, ${pct}, ${secs})`;
  } catch {
    // колонки seconds ещё нет (миграция не применена) — пишем без времени
    await db`insert into reads (slug, scroll_pct) values (${slug}, ${pct})`;
  }
  return NextResponse.json({ ok: true });
}
