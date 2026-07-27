import type { Metadata } from "next";
import Link from "next/link";
import { getAllGuides } from "@/lib/guides";
import { site } from "@/lib/site";

const title = "Проект: своя манга на Remanga";
const description =
  "Рабочие гайды по созданию своего вебтуна в духе HPMOR: ремесло, разбор жанра, характеры, ИИ-генерация. Мастерская, не конспекты.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${site.url}/manga` },
  openGraph: { type: "website", url: `${site.url}/manga`, title, description },
};

export default function MangaProject() {
  const guides = getAllGuides();

  return (
    <main className="wrap home">
      <Link href="/" className="article__back">
        ← ко всем конспектам
      </Link>

      <h1 className="project__title">Своя манга на Remanga</h1>
      <p className="home__lead">
        Рабочая мастерская проекта: своя вселенная в духе «Гарри Поттер и методы
        рационального мышления» — рациональный герой, магия как система с
        правилами. Это не конспекты чужих книг, а мои гайды по ремеслу: как
        разобрать жанр, придумать героя и вектор истории, генерировать картинки
        нейросетью и довести вебтун до релиза.
      </p>

      <Link href="/manga/read" className="read-cta">
        <span className="read-cta__label">Читать мангу</span>
        <span className="read-cta__sub">«Сырой слой» · Глава 1 — арт-пасс</span>
        <span className="read-cta__arrow">→</span>
      </Link>

      <h2 className="project__section">Рабочие материалы</h2>

      <ul className="article-list">
        {guides.map((g, i) => (
          <li key={g.slug} className="article-list__item">
            <Link href={`/manga/${g.slug}`} className="article-list__link">
              <h2 className="article-list__title">
                <span className="project__num">{i + 1}.</span> {g.title}
              </h2>
              <p className="article-list__desc">{g.description}</p>
              <span className="article-list__meta">
                {g.readingMinutes} мин чтения
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
