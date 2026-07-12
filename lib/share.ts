// Секретная ссылка для отдельной статьи. Токен = HMAC(AUTH_SECRET, "share:"+slug).
// Детерминированный, без базы. Работает и в edge (middleware), и в node (API)
// через Web Crypto (crypto.subtle доступен в обоих).

const TOKEN_LEN = 24; // hex-символов

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, TOKEN_LEN);
}

export async function shareToken(slug: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return "";
  return hmacHex(secret, `share:${slug}`);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isValidShareKey(
  slug: string,
  key: string | null | undefined,
): Promise<boolean> {
  if (!key) return false;
  const expected = await shareToken(slug);
  return expected.length > 0 && timingSafeEqual(key, expected);
}
