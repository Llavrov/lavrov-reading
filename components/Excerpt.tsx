import type { ReactNode } from "react";

type ExcerptProps = {
  children: ReactNode;
  /** Источник вырезки: автор, год, издание. */
  source?: string;
};

/**
 * Вырезка из статьи/книги — визуально отделённая цитата из первоисточника,
 * чтобы отличать чужой текст от моего разбора.
 */
export function Excerpt({ children, source }: ExcerptProps) {
  return (
    <aside className="excerpt">
      <span className="excerpt__label">Вырезка из источника</span>
      <div className="excerpt__body">{children}</div>
      {source ? <cite className="excerpt__source">{source}</cite> : null}
    </aside>
  );
}
