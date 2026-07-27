// Главы самой манги (не гайды). Читаются в ридере /manga/read/[chapter].
// Пока каждая глава - вертикальная вебтун-лента (одна картинка-склейка).

export type Chapter = {
  num: number;
  slug: string;
  title: string;
  cover: string; // превью-обложка
  strip: string; // вертикальная лента главы (склейка панелей)
  status: string; // напр. "арт-пасс"
  note?: string;
};

export const chapters: Chapter[] = [
  {
    num: 1,
    slug: "chapter-1",
    title: "Правило",
    cover: "/manga/pilot-iznanka.png",
    strip: "/manga/chapter-1.png",
    status: "арт-пасс",
    note: "Черновой рендер без леттеринга. Финальная версия - после консистентности (Soul ID / LoRA).",
  },
];

export function getAllChapterSlugs(): string[] {
  return chapters.map((c) => c.slug);
}

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}
