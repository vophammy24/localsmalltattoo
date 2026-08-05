import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { GalleryItem } from "../../gallery/types/gallery";
import { useTouchActivation } from "../../../components/common/useTouchActivation";

function score(value: string) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
}

export function ArtistGalleryCarousel({ images }: { images: GalleryItem[] }) {
  const [open, setOpen] = useState(false);
  const { activeKey, shouldRunAction } = useTouchActivation();
  const orderedImages = useMemo(
    () => [...images].sort((a, b) => score(a.image.publicId) - score(b.image.publicId)),
    [images],
  );
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [open]);
  if (!orderedImages.length)
    return (
      <section className="artist-portfolio">
        <p>Work gallery</p>
        <h2>Portfolio images will be available soon.</h2>
      </section>
    );
  const preview = orderedImages.slice(0, 8);
  return (
    <section className="artist-work">
      <header>
        <h2>Work gallery</h2>
      </header>
      <div className="artist-masonry">
        {preview.map((image) => (
          <figure
            className={activeKey === image._id ? "is-touch-active" : ""}
            key={image._id}
            tabIndex={0}
            onClick={() => {
              if (shouldRunAction(image._id)) setOpen(true);
            }}
          >
            <img src={image.image.url} alt={image.image.alt} loading="lazy" />
            <figcaption>
              <strong>{image.title || image.image.alt}</strong>
              <small>{image.artistId?.displayName || image.artistId?.fullName || "Artist"}</small>
            </figcaption>
          </figure>
        ))}
      </div>
      <button type="button" className="artist-view-gallery" onClick={() => setOpen(true)}>
        View all gallery
      </button>
      {open ? (
        <div
          className="artist-gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Artist work gallery"
        >
          <header>
            <h2>Work gallery</h2>
            <button
              type="button"
              title="Close gallery"
              aria-label="Close gallery"
              onClick={() => setOpen(false)}
            >
              <X />
            </button>
          </header>
          <div className="artist-gallery-modal__scroll">
            <div className="artist-masonry artist-masonry--all">
              {orderedImages.map((image) => (
                <figure key={image._id} tabIndex={0}>
                  <img src={image.image.url} alt={image.image.alt} loading="lazy" />
                  <figcaption>
                    <strong>{image.title || image.image.alt}</strong>
                    <small>
                      {image.artistId?.displayName || image.artistId?.fullName || "Artist"}
                    </small>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
