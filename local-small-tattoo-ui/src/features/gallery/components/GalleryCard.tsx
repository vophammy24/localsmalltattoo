import type { GalleryItem } from "../types/gallery";
import { getCloudinaryImageUrl, getCloudinarySrcSet } from "../../../utils/cloudinaryImage";

export function GalleryCard({
  item,
  isTouchActive,
  onActivate,
}: {
  item: GalleryItem;
  isTouchActive: boolean;
  onActivate: () => void;
}) {
  return (
    <button
      className={`gallery-card${isTouchActive ? " is-touch-active" : ""}`}
      type="button"
      onClick={onActivate}
    >
      <img
        src={getCloudinaryImageUrl(item.image.url, { width: 800 })}
        srcSet={getCloudinarySrcSet(item.image.url)}
        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
        alt={item.image.alt}
        loading="lazy"
        decoding="async"
        width={item.image.width}
        height={item.image.height}
        onError={(event) => {
          event.currentTarget.hidden = true;
          event.currentTarget.parentElement?.classList.add("has-image-error");
        }}
      />
      <span className="gallery-card__fallback">Image unavailable</span>
      <span className="gallery-card__overlay">
        <strong>{item.title || item.image.alt}</strong>
        <small>{item.tattooStyleIds.map((style) => style.name).join(" · ")}</small>
      </span>
    </button>
  );
}
