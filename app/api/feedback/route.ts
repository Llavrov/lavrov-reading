import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";

export async function POST(req: Request) {
  const { slug, rating, thoughts } = (await req.json().catch(() => ({}))) as {
    slug?: string;
    rating?: number | null;
    thoughts?: string;
  };
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ ok: true, persisted: false });
  const safeRating =
    rating == null ? null : Math.max(1, Math.min(5, Math.round(rating)));
  await sql()`
    insert into feedback (slug, rating, thoughts, updated_at)
    values (${slug}, ${safeRating}, ${thoughts ?? null}, now())
    on conflict (slug) do update
      set rating = excluded.rating,
          thoughts = excluded.thoughts,
          updated_at = now()
  `;
  return NextResponse.json({ ok: true });
}
