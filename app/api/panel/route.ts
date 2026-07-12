import { NextResponse } from "next/server";
import { sql, hasDb } from "@/lib/db";

/** Загрузка всего состояния личного слоя для одной статьи. Только владелец. */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  if (!hasDb()) {
    return NextResponse.json({
      dbReady: false,
      rating: null,
      thoughts: "",
      answers: {},
      reads: { count: 0, last: null },
    });
  }

  const db = sql();
  const [feedback, answers, reads] = await Promise.all([
    db`select rating, thoughts from feedback where slug = ${slug} limit 1`,
    db`select question_idx, answer from answers where slug = ${slug}`,
    db`select count(*)::int as count, max(read_at) as last from reads where slug = ${slug}`,
  ]);

  const answerMap: Record<number, string> = {};
  for (const row of answers as { question_idx: number; answer: string }[]) {
    answerMap[row.question_idx] = row.answer ?? "";
  }

  return NextResponse.json({
    dbReady: true,
    rating: (feedback[0] as { rating?: number })?.rating ?? null,
    thoughts: (feedback[0] as { thoughts?: string })?.thoughts ?? "",
    answers: answerMap,
    reads: {
      count: (reads[0] as { count: number }).count,
      last: (reads[0] as { last: string | null }).last,
    },
  });
}
