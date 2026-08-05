import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TattooStyleImage } from "../types/tattooStyle";
import { useBusinessSettings } from "../../businessSettings/BusinessSettingsContext";
import { useTouchActivation } from "../../../components/common/useTouchActivation";

const MOBILE_QUERY = "(max-width: 767px)";
export type StyleCarouselImage = TattooStyleImage & {
  title?: string;
  author?: string;
};

export function StyleGalleryPreview({ images }: { images: StyleCarouselImage[] }) {
  const { settings } = useBusinessSettings();
  const orderedImages = useMemo(
    () => [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [images],
  );
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const touchStartX = useRef(0);
  const carouselTouchStartX = useRef(0);
  const { activeKey, shouldRunAction, clearTouchActivation } = useTouchActivation();
  const [pageSize, setPageSize] = useState(() => (window.matchMedia(MOBILE_QUERY).matches ? 1 : 3));

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const updatePageSize = () => {
      setPageSize(mediaQuery.matches ? 1 : 3);
      setStartIndex(0);
    };
    mediaQuery.addEventListener("change", updatePageSize);
    return () => mediaQuery.removeEventListener("change", updatePageSize);
  }, []);

  useEffect(() => setStartIndex(0), [images]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowLeft")
        setOpenIndex((current) =>
          current === null ? null : (current - 1 + orderedImages.length) % orderedImages.length,
        );
      if (event.key === "ArrowRight")
        setOpenIndex((current) => (current === null ? null : (current + 1) % orderedImages.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, orderedImages.length]);

  if (orderedImages.length === 0) return null;

  const visibleImages = Array.from(
    { length: Math.min(pageSize, orderedImages.length) },
    (_, offset) => orderedImages[(startIndex + offset) % orderedImages.length],
  );

  function move(direction: -1 | 1) {
    setDirection(direction === 1 ? "next" : "previous");
    setStartIndex(
      (currentIndex) => (currentIndex + direction + orderedImages.length) % orderedImages.length,
    );
  }

  function moveLightbox(step: -1 | 1) {
    setOpenIndex((current) =>
      current === null ? null : (current + step + orderedImages.length) % orderedImages.length,
    );
  }

  const openImage = openIndex === null ? null : orderedImages[openIndex];

  return (
    <>
      <div className="style-gallery-preview" aria-label="Tattoo style gallery">
        <div
          key={`${startIndex}-${pageSize}`}
          className={`style-gallery-preview__viewport style-gallery-preview__viewport--${direction}`}
          aria-live="polite"
          onTouchStart={(event) => {
            carouselTouchStartX.current = event.touches[0]?.clientX ?? 0;
          }}
          onTouchEnd={(event) => {
            const delta = (event.changedTouches[0]?.clientX ?? 0) - carouselTouchStartX.current;
            if (Math.abs(delta) > 45) {
              event.preventDefault();
              clearTouchActivation();
              move(delta > 0 ? -1 : 1);
            }
          }}
        >
          {visibleImages.map((image) => (
            <button
              className={`style-gallery-preview__item${activeKey === image.publicId ? " is-touch-active" : ""}`}
              key={image.publicId}
              type="button"
              aria-label={`View ${image.title || image.alt}`}
              onClick={() => {
                if (shouldRunAction(image.publicId))
                  setOpenIndex(orderedImages.findIndex((item) => item.publicId === image.publicId));
              }}
            >
              <img src={image.url} alt={image.alt} loading="lazy" />
              <span className="style-gallery-preview__meta">
                <strong>{image.title || image.alt}</strong>
                <small>{image.author || settings?.businessName || "Studio artist"}</small>
              </span>
            </button>
          ))}
        </div>
        <button
          className="style-gallery-preview__control style-gallery-preview__control--previous"
          type="button"
          title="Previous images"
          aria-label="Previous images"
          onClick={() => move(-1)}
        >
          <ChevronLeft />
        </button>
        <button
          className="style-gallery-preview__control style-gallery-preview__control--next"
          type="button"
          title="Next images"
          aria-label="Next images"
          onClick={() => move(1)}
        >
          <ChevronRight />
        </button>
      </div>
      {openImage ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Tattoo style image viewer"
          onClick={() => setOpenIndex(null)}
        >
          <button
            className="gallery-lightbox__close"
            type="button"
            title="Close"
            aria-label="Close image viewer"
            onClick={() => setOpenIndex(null)}
          >
            <X />
          </button>
          {orderedImages.length > 1 ? (
            <button
              className="gallery-lightbox__prev"
              type="button"
              title="Previous image"
              aria-label="Previous image"
              onClick={(event) => {
                event.stopPropagation();
                moveLightbox(-1);
              }}
            >
              <ChevronLeft />
            </button>
          ) : null}
          <div
            className="gallery-lightbox__content"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0]?.clientX ?? 0;
            }}
            onTouchEnd={(event) => {
              const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
              if (Math.abs(delta) > 50) moveLightbox(delta > 0 ? -1 : 1);
            }}
          >
            <img src={openImage.url} alt={openImage.alt} />
            <aside>
              <p>Tattoo work</p>
              <h2>{openImage.title || openImage.alt}</h2>
              <span>{openImage.author || settings?.businessName || "Studio artist"}</span>
              <small>
                {(openIndex ?? 0) + 1} / {orderedImages.length}
              </small>
            </aside>
          </div>
          {orderedImages.length > 1 ? (
            <button
              className="gallery-lightbox__next"
              type="button"
              title="Next image"
              aria-label="Next image"
              onClick={(event) => {
                event.stopPropagation();
                moveLightbox(1);
              }}
            >
              <ChevronRight />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
