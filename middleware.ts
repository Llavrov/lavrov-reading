import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE } from "@/lib/auth-shared";

async function isOwner(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return false;
  const s = process.env.AUTH_SECRET;
  if (!s) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(s));
    return payload.owner === true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const owner = await isOwner(req);
  if (owner) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // API-записи для неавторизованных — 401.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Приватные страницы — на логин.
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/me/:path*",
    "/api/panel",
    "/api/feedback",
    "/api/answers",
    "/api/track",
  ],
};
