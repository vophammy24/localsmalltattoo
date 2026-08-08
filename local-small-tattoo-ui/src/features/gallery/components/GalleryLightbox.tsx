import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import type { GalleryItem } from "../types/gallery";

export function GalleryLightbox({
  items,
  index,
  onChange,
  onClose,
}: {
  items: GalleryItem[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const startX = useRef(0);
  const item = items[index];
  const move = (step: number) => onChange((index + step + items.length) % items.length);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", key);
    };
  });
  if (!item) return null;
  return (
    <div
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image viewer"
      onClick={onClose}
    >
      <button className="gallery-lightbox__close" title="Close" onClick={onClose}>
        <X />
      </button>
      {items.length > 1 ? (
        <button
          className="gallery-lightbox__prev"
          title="Previous image"
          onClick={(event) => {
            event.stopPropagation();
            move(-1);
          }}
        >
          <ChevronLeft />
        </button>
      ) : null}
      <div
        className="gallery-lightbox__content"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => {
          startX.current = event.touches[0]?.clientX ?? 0;
        }}
        onTouchEnd={(event) => {
          const delta = (event.changedTouches[0]?.clientX ?? 0) - startX.current;
          if (Math.abs(delta) > 50) move(delta > 0 ? -1 : 1);
        }}
      >
        <img src={item.image.url} alt={item.image.alt} />
        <aside>
          <p>{item.type.replaceAll("_", " ")}</p>
          <h2>{item.title || item.image.alt}</h2>
          {item.caption ? <span>{item.caption}</span> : null}
          <div>
            {item.tattooStyleIds.map((style) => (
              <Link key={style._id} to={`/styles#${style.slug}`}>
                {style.name}
              </Link>
            ))}
          </div>
          <Link className="button" to="/booking">
            Book appointment
          </Link>
        </aside>
      </div>
      {items.length > 1 ? (
        <button
          className="gallery-lightbox__next"
          title="Next image"
          onClick={(event) => {
            event.stopPropagation();
            move(1);
          }}
        >
          <ChevronRight />
        </button>
      ) : null}
    </div>
  );
}
