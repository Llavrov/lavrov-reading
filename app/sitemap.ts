import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  return [
    {
      url: site.url,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...articles.map((a) => ({
      url: `${site.url}/${a.slug}`,
      lastModified: a.date ? new Date(a.date) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
