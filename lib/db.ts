import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

/** Ленивый Neon-клиент: не падает на билде, если DATABASE_URL ещё не задан. */
export function sql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}

export function hasDb(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
