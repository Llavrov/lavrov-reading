import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";

export async function POST(req: Request) {
  const { slug, scroll_pct } = (await req.json().catch(() => ({}))) as {
    slug?: string;
    scroll_pct?: number;
  };
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: true, persisted: false });
  const pct = Math.max(0, Math.min(100, Math.round(scroll_pct ?? 0)));
  await sql()`insert into reads (slug, scroll_pct) values (${slug}, ${pct})`;
  return NextResponse.json({ ok: true });
}
