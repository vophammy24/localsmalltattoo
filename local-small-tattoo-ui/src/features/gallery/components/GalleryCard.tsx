import type { GalleryItem } from "../types/gallery";

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
        src={item.image.url}
        alt={item.image.alt}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.hidden = true;
          event.currentTarget.parentElement?.classList.add("has-image-error");
        }}
      />
      <span className="gallery-card__fallback">Image unavailable</span>
      <span className="gallery-card__overlay">
        <strong>{item.title || item.image.alt}</strong>
        <small>
          {item.artistId?.displayName || item.artistId?.fullName || item.type.replaceAll("_", " ")}
        </small>
      </span>
    </button>
  );
}
