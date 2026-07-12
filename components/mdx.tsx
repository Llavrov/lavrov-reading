import type { AnchorHTMLAttributes } from "react";
import { Excerpt } from "./Excerpt";
import { Figure } from "./Figure";

/** Ссылки: внешние открываем в новой вкладке, внутренние — как есть. */
function MdxLink({ href = "", ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
  }
  return <a href={href} {...props} />;
}

export const mdxComponents = {
  a: MdxLink,
  Excerpt,
  Figure,
};
