import { useEffect, useState } from "react";
import type { TattooStyle } from "../types/tattooStyle";

export function StyleNavigation({ styles }: { styles: TattooStyle[] }) {
  const [activeSlug, setActiveSlug] = useState(styles[0]?.slug ?? "");

  useEffect(() => {
    const sections = styles
      .map((style) => document.getElementById(style.slug))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActiveSlug(visible.target.id);
        window.history.replaceState(null, "", `#${visible.target.id}`);
      },
      { rootMargin: "-25% 0px -60%", threshold: [0.1, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [styles]);

  return (
    <nav className="style-navigation" aria-label="Tattoo style categories">
      <div className="page-shell style-navigation__inner">
        {styles.map((style) => (
          <a
            className={activeSlug === style.slug ? "is-active" : ""}
            href={`#${style.slug}`}
            key={style._id}
          >
            {style.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
