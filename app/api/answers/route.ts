import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";

export async function POST(req: Request) {
  const { slug, question_idx, answer } = (await req
    .json()
    .catch(() => ({}))) as {
    slug?: string;
    question_idx?: number;
    answer?: string;
  };
  if (!slug || question_idx == null) {
    return NextResponse.json({ error: "slug and question_idx required" }, {
      status: 400,
    });
  }
  if (!hasDb()) return NextResponse.json({ ok: true, persisted: false });
  await sql()`
    insert into answers (slug, question_idx, answer, updated_at)
    values (${slug}, ${question_idx}, ${answer ?? null}, now())
    on conflict (slug, question_idx) do update
      set answer = excluded.answer,
          updated_at = now()
  `;
  return NextResponse.json({ ok: true });
}
