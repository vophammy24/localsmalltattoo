import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { EMPTY_GALLERY_VALUES, GalleryFields } from "../../features/admin/gallery/GalleryFields";
import { uploadGallery } from "../../features/gallery/api/galleryApi";
import type { GalleryFormValues } from "../../features/gallery/types/gallery";
import { getAdminArtists } from "../../features/artists/api/artistApi";
import type { Artist } from "../../features/artists/types/artist";
import { getAdminTattooStyles } from "../../features/tattooStyles/api/tattooStyleApi";
import type { TattooStyle } from "../../features/tattooStyles/types/tattooStyle";
import { GalleryMediaLibrary } from "../../features/admin/gallery/GalleryMediaLibrary";

export function AdminGalleryUploadPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<GalleryFormValues>(EMPTY_GALLERY_VALUES);
  const [files, setFiles] = useState<File[]>([]);
  const [alts, setAlts] = useState<string[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [styles, setStyles] = useState<TattooStyle[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    void getAdminArtists().then((data) => setArtists(data.items));
    void getAdminTattooStyles().then((data) => setStyles(data.items));
  }, []);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  async function submit() {
    if (!files.length) return setError("Select at least one image.");
    if (values.isPublished && alts.some((alt) => !alt.trim()))
      return setError("Alt text is required for every published image.");
    setBusy(true);
    setError("");
    try {
      await uploadGallery(files, values, alts);
      navigate("/admin/gallery");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to upload images.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <AdminPageHeader
        title="Upload gallery"
        description="Upload new images or reuse media already in the database."
      />
      <section className="admin-panel admin-gallery-upload">
        <label className="admin-gallery-drop">
          Select images
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/*"
            multiple
            onChange={(event) => {
              const next = Array.from(event.target.files ?? []).slice(0, 20);
              setFiles(next);
              setAlts(
                next.map((file) => file.name.replace(/\.[^.]+$/, "").replaceAll(/[-_]/g, " ")),
              );
            }}
          />
          <span>JPEG, PNG, WebP, HEIC or HEIF. Maximum 20 MB each.</span>
        </label>
        {files.length ? (
          <div className="admin-gallery-previews">
            {files.map((file, index) => (
              <label key={`${file.name}-${index}`}>
                <img src={previews[index]} alt="" />
                <span>{file.name}</span>
                <input
                  required={values.isPublished}
                  maxLength={200}
                  placeholder="Alt text"
                  value={alts[index] ?? ""}
                  onChange={(event) =>
                    setAlts((current) =>
                      current.map((alt, position) =>
                        position === index ? event.target.value : alt,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
        ) : null}
      </section>
      <section className="admin-panel">
        <h2>Shared metadata</h2>
        <GalleryFields
          values={values}
          artists={artists}
          styles={styles}
          onChange={setValues}
          hideAlt
        />
      </section>
      <GalleryMediaLibrary onDone={() => navigate("/admin/gallery")} onError={setError} />
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-style-form__actions">
        <button className="admin-secondary" onClick={() => navigate("/admin/gallery")}>
          Cancel
        </button>
        <button className="admin-primary" disabled={busy} onClick={() => void submit()}>
          {busy ? "Uploading..." : `Upload ${files.length || ""} images`}
        </button>
      </div>
    </>
  );
}
