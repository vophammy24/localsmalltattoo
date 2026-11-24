import type { CSSProperties, ReactNode } from "react";
export function PageHero({
  title,
  description,
  children,
  className = "",
  style,
  titleId,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  titleId?: string;
}) {
  return (
    <section
      className={`page-hero${className ? ` ${className}` : ""}`}
      style={style}
      aria-labelledby={titleId}
    >
      <div className="page-shell page-hero__inner">
        <div className="page-hero__title">
          <h1 id={titleId}>{title}</h1>
        </div>
        {description || children ? (
          <div className="page-hero__aside">
            {description ? <p>{description}</p> : null}
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
