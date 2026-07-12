import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { AUTH_COOKIE } from "./auth-shared";

export { AUTH_COOKIE };
const MAX_AGE = 60 * 60 * 24 * 90; // 90 дней

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

/** Постоянное по времени сравнение пароля с env (единственный владелец). */
export function checkPassword(input: string): boolean {
  const expected = process.env.OWNER_PASSWORD ?? "";
  if (!expected || input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ owner: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.owner === true;
  } catch {
    return false;
  }
}

/** Залогинен ли владелец (для серверных компонентов). */
export async function isOwner(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(AUTH_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};
