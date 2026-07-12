import { NextResponse } from "next/server";
import {
  checkPassword,
  createSessionToken,
  AUTH_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, sessionCookieOptions);
  return res;
}
