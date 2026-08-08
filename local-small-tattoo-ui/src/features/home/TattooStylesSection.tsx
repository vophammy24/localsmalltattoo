import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "../../components/common/ButtonLink";
import { SectionHeading } from "../../components/common/SectionHeading";
import { useTattooStyles } from "../tattooStyles/hooks/useTattooStyles";
import { useTouchActivation } from "../../components/common/useTouchActivation";

export function TattooStylesSection() {
  const { data: tattooStyles, isLoading, error } = useTattooStyles(true);
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const getPageSize = () => {
    if (
      window.matchMedia("(orientation: landscape) and (max-height: 600px) and (pointer: coarse)")
        .matches
    )
      return 2;
    return window.matchMedia("(max-width: 767px)").matches ? 1 : 4;
  };
  const [pageSize, setPageSize] = useState(getPageSize);
  const touchStartX = useRef(0);
  const { activeKey, shouldRunAction, clearTouchActivation } = useTouchActivation();

  useEffect(() => {
    const portraitQuery = window.matchMedia("(max-width: 767px)");
    const landscapeQuery = window.matchMedia(
      "(orientation: landscape) and (max-height: 600px) and (pointer: coarse)",
    );
    const updatePageSize = () => {
      setPageSize(getPageSize());
      setStartIndex(0);
    };
    portraitQuery.addEventListener("change", updatePageSize);
    landscapeQuery.addEventListener("change", updatePageSize);
    return () => {
      portraitQuery.removeEventListener("change", updatePageSize);
      landscapeQuery.removeEventListener("change", updatePageSize);
    };
  }, []);

  useEffect(() => setStartIndex(0), [tattooStyles]);

  const visibleStyles = Array.from(
    { length: Math.min(pageSize, tattooStyles.length) },
    (_, offset) => tattooStyles[(startIndex + offset) % tattooStyles.length],
  );

  function move(direction: -1 | 1) {
    setDirection(direction === 1 ? "next" : "previous");
    setStartIndex((current) => (current + direction + tattooStyles.length) % tattooStyles.length);
  }

  return (
    <section className="section styles-section" aria-labelledby="styles-heading">
      <div className="page-shell">
        <SectionHeading title="Tattoo Styles." align="center" />
        {isLoading ? <p className="styles-section__state">Loading featured styles...</p> : null}
        {error ? (
          <p className="styles-section__state">Featured styles are temporarily unavailable.</p>
        ) : null}
        <div className="styles-carousel-shell">
          <div
            key={`${startIndex}-${pageSize}`}
            className={`styles-carousel styles-carousel--${direction}`}
            role="list"
            aria-label="Tattoo styles"
            aria-live="polite"
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0]?.clientX ?? 0;
            }}
            onTouchEnd={(event) => {
              const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
              if (Math.abs(delta) > 45) {
                event.preventDefault();
                clearTouchActivation();
                move(delta > 0 ? -1 : 1);
              }
            }}
          >
            {visibleStyles.map((style) => (
              <article
                className={`style-card${activeKey === style._id ? " is-touch-active" : ""}`}
                key={style._id}
                role="listitem"
              >
                <a
                  className="style-card__link"
                  href={`/styles#${style.slug}`}
                  onClick={(event) => {
                    if (!shouldRunAction(style._id)) event.preventDefault();
                  }}
                >
                  <img
                    className="style-card__image"
                    src={style.coverImage?.url}
                    alt={style.coverImage?.alt ?? ""}
                  />
                  <span className="style-card__overlay" aria-hidden="true" />
                  <span className="style-card__index">
                    {String(style.displayOrder + 1).padStart(2, "0")}.
                  </span>
                  <span className="style-card__content">
                    <strong>{style.name}</strong>
                    <small>{style.shortDescription}</small>
                  </span>
                </a>
              </article>
            ))}
          </div>
          {tattooStyles.length > 0 ? (
            <div className="styles-carousel__controls" aria-label="Style carousel controls">
              <button
                className="styles-carousel__control styles-carousel__control--previous"
                type="button"
                title="Previous styles"
                aria-label="Previous styles"
                onClick={() => move(-1)}
              >
                <ChevronLeft />
              </button>
              <button
                className="styles-carousel__control styles-carousel__control--next"
                type="button"
                title="Next styles"
                aria-label="Next styles"
                onClick={() => move(1)}
              >
                <ChevronRight />
              </button>
            </div>
          ) : null}
        </div>
        <div className="section-action">
          <ButtonLink to="/styles" variant="secondary">
            View all styles
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
