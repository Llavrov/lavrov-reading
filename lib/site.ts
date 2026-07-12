export const site = {
  name: "Лёва Лавров · конспекты",
  shortName: "Конспекты",
  title: "Лёва Лавров — конспекты и разборы",
  description:
    "Личная читальня: конспекты книг и статей, разборы идей своими словами, с вырезками из первоисточников и ссылками. Удобно читать с телефона.",
  author: "Лёва Лавров",
  // Меняется на реальный домен после первого деплоя Vercel.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://lavrov-reading.vercel.app",
  locale: "ru_RU",
  lang: "ru",
} as const;
