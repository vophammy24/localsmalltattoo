import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { MultiImageUploader } from "../../../components/common/MultiImageUploader";
import {
  deleteStyleGalleryImage,
  reorderStyleGallery,
  uploadStyleGallery,
} from "../../tattooStyles/api/tattooStyleApi";
import type { TattooStyle } from "../../tattooStyles/types/tattooStyle";

export function StyleImageManager({
  style,
  onChange,
}: {
  style: TattooStyle;
  onChange: (style: TattooStyle) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    setError("");
    try {
      const result = await uploadStyleGallery(style._id, files);
      onChange(result.style);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to upload images.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(imageId?: string) {
    if (!imageId || !window.confirm("Remove this gallery image?")) return;
    setBusy(true);
    setError("");
    try {
      await deleteStyleGalleryImage(style._id, imageId);
      onChange({
        ...style,
        galleryImages: style.galleryImages.filter((image) => image._id !== imageId),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to remove image.");
    } finally {
      setBusy(false);
    }
  }
  async function move(index: number, direction: -1 | 1) {
    const ordered = [...(style.galleryImages ?? [])].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    );
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target]!, ordered[index]!];
    const next = ordered.map((image, displayOrder) => ({ ...image, displayOrder }));
    onChange({ ...style, galleryImages: next });
    setBusy(true);
    try {
      await reorderStyleGallery(
        style._id,
        next.flatMap((image) =>
          image._id ? [{ imageId: image._id, displayOrder: image.displayOrder ?? 0 }] : [],
        ),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to reorder images.");
      onChange(style);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="admin-panel style-image-manager">
      <h2>Gallery images</h2>
      <MultiImageUploader
        disabled={busy || style.galleryImages.length >= 20}
        onChange={(files) => void upload(files)}
      />
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="style-image-manager__grid">
        {[...(style.galleryImages ?? [])]
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((image, index, images) => (
            <figure key={image._id ?? image.publicId}>
              <img src={image.url} alt={image.alt} />
              <div className="style-image-manager__actions">
                <button
                  type="button"
                  title="Move left"
                  disabled={busy || index === 0}
                  onClick={() => void move(index, -1)}
                >
                  <ArrowLeft />
                </button>
                <button
                  type="button"
                  title="Move right"
                  disabled={busy || index === images.length - 1}
                  onClick={() => void move(index, 1)}
                >
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  title="Remove image"
                  disabled={busy}
                  onClick={() => void remove(image._id)}
                >
                  <Trash2 />
                </button>
              </div>
            </figure>
          ))}
      </div>
    </section>
  );
}
