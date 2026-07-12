import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE } from "@/lib/auth-shared";
import { isValidShareKey } from "@/lib/share";

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

// Пути, всегда доступные без входа (сама страница логина и её API).
const PUBLIC_PATHS = new Set(["/login", "/api/login", "/api/logout"]);

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  if (await isOwner(req)) return NextResponse.next();

  // Гость: одна статья доступна по секретной ссылке /<slug>?k=<токен>.
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1 && !pathname.startsWith("/api/")) {
    const slug = segments[0];
    if (await isValidShareKey(slug, searchParams.get("k"))) {
      return NextResponse.next();
    }
  }

  // Записи и приватные API — 401.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Всё остальное (главная, список, другие статьи, кабинет) — на логин.
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Гейтим всё, кроме статики и служебных ассетов.
  matcher: [
    "/((?!_next/static|_next/image|images/|favicon.ico|icon.svg).*)",
  ],
};
