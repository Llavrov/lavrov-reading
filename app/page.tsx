import Link from "next/link";
import { getAllArticles, formatDate } from "@/lib/articles";
import { site } from "@/lib/site";

export default function Home() {
  const articles = getAllArticles();

  return (
    <main className="wrap home">
      <p className="home__lead">
        Конспекты книг и статей своими словами: главное, что стоит запомнить, с
        вырезками из первоисточников и ссылками. Читаю, разбираю, возвращаюсь.
      </p>

      {articles.length === 0 ? (
        <p>Скоро здесь появятся первые разборы.</p>
      ) : (
        <ul className="article-list">
          {articles.map((a) => (
            <li key={a.slug} className="article-list__item">
              <Link href={`/${a.slug}`} className="article-list__link">
                <h2 className="article-list__title">{a.title}</h2>
                <p className="article-list__desc">{a.description}</p>
                <span className="article-list__meta">
                  {formatDate(a.date)} · {a.readingMinutes} мин чтения
                  {a.tags.length ? ` · ${a.tags.join(", ")}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
