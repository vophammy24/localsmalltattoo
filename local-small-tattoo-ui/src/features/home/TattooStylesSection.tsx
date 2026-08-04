import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "../../components/common/ButtonLink";
import { SectionHeading } from "../../components/common/SectionHeading";
import { useTattooStyles } from "../tattooStyles/hooks/useTattooStyles";

export function TattooStylesSection() {
  const { data: tattooStyles, isLoading, error } = useTattooStyles(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const updateControls = () => {
      setCanScrollBack(carousel.scrollLeft > 1);
      setCanScrollForward(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1);
    };
    updateControls();
    carousel.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    return () => {
      carousel.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [tattooStyles]);

  function move(direction: -1 | 1) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({ left: direction * carousel.clientWidth * 0.8, behavior: "smooth" });
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
          <div ref={carouselRef} className="styles-carousel" role="list" aria-label="Tattoo styles">
            {tattooStyles.map((style) => (
              <article className="style-card" key={style._id} role="listitem">
                <a className="style-card__link" href={`/styles#${style.slug}`}>
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
            <div className="styles-carousel__controls">
              <button
                type="button"
                title="Previous styles"
                aria-label="Previous styles"
                disabled={!canScrollBack}
                onClick={() => move(-1)}
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                title="Next styles"
                aria-label="Next styles"
                disabled={!canScrollForward}
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
