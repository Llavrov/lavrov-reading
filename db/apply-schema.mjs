// Применяет db/schema.sql к Neon через HTTPS-драйвер (TCP:5432 не нужен).
// Запуск: DATABASE_URL="postgres://..." node db/apply-schema.mjs
import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.join(dir, "schema.sql"), "utf8");
const clean = schema
  .split("\n")
  .filter((l) => !l.trim().startsWith("--"))
  .join("\n");
const statements = clean
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

const sql = neon(url);
for (const st of statements) {
  await sql.query(st);
  console.log("ok:", st.replace(/\s+/g, " ").slice(0, 60));
}
const rows = await sql.query(
  "select table_name from information_schema.tables where table_schema='public' order by 1",
);
console.log("TABLES:", rows.map((r) => r.table_name).join(", "));
