import { useEffect, useState } from "react";
import { getGalleryMediaLibrary, linkGalleryMedia } from "../../gallery/api/galleryApi";
import type { GalleryMediaItem } from "../../gallery/types/gallery";

export function GalleryMediaLibrary({
  onDone,
  onError,
}: {
  onDone: () => void;
  onError: (message: string) => void;
}) {
  const [items, setItems] = useState<GalleryMediaItem[]>([]);
  const [selected, setSelected] = useState<GalleryMediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void getGalleryMediaLibrary()
      .then((data) => setItems(data.items))
      .catch((error: Error) => onError(error.message));
  }, [onError]);
  async function link() {
    setBusy(true);
    try {
      await linkGalleryMedia(selected);
      onDone();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to link media.");
      setBusy(false);
    }
  }
  return (
    <section className="admin-panel">
      <h2>Existing media</h2>
      <p className="admin-muted">
        Reuse Style or Artist images without duplicating the Cloudinary asset.
      </p>
      <div className="admin-gallery-library">
        {items.map((item) => (
          <label className={item.alreadyLinked ? "is-disabled" : ""} key={item.image.publicId}>
            <img src={item.image.url} alt={item.image.alt} />
            <input
              type="checkbox"
              disabled={item.alreadyLinked}
              checked={selected.some((value) => value.image.publicId === item.image.publicId)}
              onChange={(event) =>
                setSelected((current) =>
                  event.target.checked
                    ? [...current, item]
                    : current.filter((value) => value.image.publicId !== item.image.publicId),
                )
              }
            />
            <span>
              {item.sourceLabel}
              {item.alreadyLinked ? " · Linked" : ""}
            </span>
          </label>
        ))}
      </div>
      <button
        className="admin-secondary"
        disabled={busy || !selected.length}
        onClick={() => void link()}
      >
        Add {selected.length || ""} existing images
      </button>
    </section>
  );
}
