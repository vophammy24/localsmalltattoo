import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { TattooStyleImage } from "../types/tattooStyle";

const MOBILE_QUERY = "(max-width: 767px)";

export function StyleGalleryPreview({ images }: { images: TattooStyleImage[] }) {
  const orderedImages = useMemo(
    () => [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [images],
  );
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "previous">("next");
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

  return (
    <div className="style-gallery-preview" aria-label="Tattoo style gallery">
      <div
        key={`${startIndex}-${pageSize}`}
        className={`style-gallery-preview__viewport style-gallery-preview__viewport--${direction}`}
        aria-live="polite"
      >
        {visibleImages.map((image) => (
          <a key={image.publicId} href={image.url} target="_blank" rel="noreferrer">
            <img src={image.url} alt={image.alt} loading="lazy" />
          </a>
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
  );
}
