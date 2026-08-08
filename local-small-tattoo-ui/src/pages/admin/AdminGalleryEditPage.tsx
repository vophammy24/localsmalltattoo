import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { EMPTY_GALLERY_VALUES, GalleryFields } from "../../features/admin/gallery/GalleryFields";
import { getAdminGalleryItem, updateGalleryItem } from "../../features/gallery/api/galleryApi";
import type { GalleryFormValues } from "../../features/gallery/types/gallery";
import { getAdminTattooStyles } from "../../features/tattooStyles/api/tattooStyleApi";
import type { TattooStyle } from "../../features/tattooStyles/types/tattooStyle";

export function AdminGalleryEditPage() {
  const { galleryItemId = "" } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState<GalleryFormValues>(EMPTY_GALLERY_VALUES);
  const [image, setImage] = useState("");
  const [styles, setStyles] = useState<TattooStyle[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void Promise.all([getAdminGalleryItem(galleryItemId), getAdminTattooStyles()])
      .then(([gallery, styleData]) => {
        const item = gallery.item;
        setImage(item.image.url);
        setStyles(styleData.items);
        setValues({
          title: item.title ?? "",
          caption: item.caption ?? "",
          alt: item.image.alt,
          type: item.type,
          tattooStyleIds: item.tattooStyleIds.map((style) => style._id),
          isFeatured: item.isFeatured,
          isPublished: item.isPublished,
          displayOrder: item.displayOrder,
          photographedAt: item.photographedAt?.slice(0, 10) ?? "",
        });
      })
      .catch((reason: Error) => setError(reason.message));
  }, [galleryItemId]);
  async function save() {
    setBusy(true);
    try {
      await updateGalleryItem(galleryItemId, values);
      navigate("/admin/gallery");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save image.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <AdminPageHeader
        title="Edit gallery image"
        description="Update classification, links and visibility."
      />
      <section className="admin-panel admin-gallery-edit">
        <img src={image} alt="" />
        <GalleryFields values={values} styles={styles} onChange={setValues} />
      </section>
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-style-form__actions">
        <button className="admin-secondary" onClick={() => navigate("/admin/gallery")}>
          Cancel
        </button>
        <button className="admin-primary" disabled={busy} onClick={() => void save()}>
          {busy ? "Saving..." : "Save changes"}
        </button>
      </div>
    </>
  );
}
