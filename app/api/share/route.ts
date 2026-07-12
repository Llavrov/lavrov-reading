import { NextResponse } from "next/server";
import { shareToken } from "@/lib/share";
import { site } from "@/lib/site";

/** Секретная публичная ссылка на одну статью. Только владелец (гейтит middleware). */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  const token = await shareToken(slug);
  if (!token) {
    return NextResponse.json({ error: "AUTH_SECRET not set" }, { status: 500 });
  }
  return NextResponse.json({
    token,
    url: `${site.url}/${slug}?k=${token}`,
  });
}
