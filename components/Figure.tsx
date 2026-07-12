type FigureProps = {
  src: string;
  alt: string;
  caption?: string;
  /** 'wide' немного шире колонки на десктопе. */
  variant?: "default" | "wide";
};

/** Иллюстрация с подписью. src — путь к картинке/SVG в /public. */
export function Figure({ src, alt, caption, variant = "default" }: FigureProps) {
  return (
    <figure className={`figure figure--${variant}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="figure__img" src={src} alt={alt} loading="lazy" />
      {caption ? <figcaption className="figure__cap">{caption}</figcaption> : null}
    </figure>
  );
}
