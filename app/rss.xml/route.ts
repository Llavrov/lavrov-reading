import { getAllArticles } from "@/lib/articles";
import { site } from "@/lib/site";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const articles = getAllArticles();
  const items = articles
    .map((a) => {
      const link = `${site.url}/${a.slug}`;
      const pubDate = a.date ? new Date(a.date).toUTCString() : "";
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(a.description)}</description>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.description)}</description>
    <language>ru</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
