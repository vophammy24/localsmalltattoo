import { useEffect, useRef, useState } from "react";
import type { TattooStyle } from "../types/tattooStyle";

export function StyleNavigation({ styles }: { styles: TattooStyle[] }) {
  const initialHash = window.location.hash.slice(1);
  const [activeSlug, setActiveSlug] = useState(
    styles.some((style) => style.slug === initialHash) ? initialHash : (styles[0]?.slug ?? ""),
  );
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = styles
      .map((style) => document.getElementById(style.slug))
      .filter((section): section is HTMLElement => Boolean(section));
    let animationFrame = 0;

    const updateActiveStyle = () => {
      const navigationBottom = navigationRef.current?.getBoundingClientRect().bottom ?? 0;
      const activationLine = navigationBottom + 24;
      const activeSection = [...sections]
        .reverse()
        .find((section) => section.getBoundingClientRect().top <= activationLine);
      const nextSlug = activeSection?.id ?? sections[0]?.id ?? "";

      if (nextSlug) setActiveSlug(nextSlug);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateActiveStyle);
    };

    const syncFromHash = () => {
      const slug = window.location.hash.slice(1);
      const target = sections.find((section) => section.id === slug);
      if (!target) return;
      setActiveSlug(slug);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const initialTarget = sections.find((section) => section.id === window.location.hash.slice(1));
    if (initialTarget) {
      setActiveSlug(initialTarget.id);
      window.requestAnimationFrame(() => initialTarget.scrollIntoView({ block: "start" }));
    } else {
      scheduleUpdate();
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [styles]);

  return (
    <nav ref={navigationRef} className="style-navigation" aria-label="Tattoo style categories">
      <div className="page-shell style-navigation__inner">
        {styles.map((style) => (
          <a
            className={activeSlug === style.slug ? "is-active" : ""}
            href={`#${style.slug}`}
            key={style._id}
            onClick={() => setActiveSlug(style.slug)}
          >
            {style.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
