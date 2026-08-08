import { useState } from "react";
import { deleteSectionImage, uploadSectionImage } from "../../about/api/aboutApi";
import type { SectionImage } from "../../about/types/about";

export function SectionImageField({
  section,
  label,
  image,
  alt,
  onChange,
}: {
  section: string;
  label: string;
  image?: SectionImage;
  alt: string;
  onChange: (image: SectionImage | undefined) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="admin-section-image">
      <h3>{label}</h3>
      {image ? <img src={image.url} alt={image.alt} /> : null}
      <div className="admin-section-image__actions">
        <label className="admin-secondary admin-founder-upload">
          {busy ? "Working..." : image ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/*"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setBusy(true);
              setError("");
              void uploadSectionImage(section, file, alt, image?.publicId)
                .then((result) => onChange(result.image))
                .catch((reason: Error) => setError(reason.message))
                .finally(() => setBusy(false));
            }}
          />
        </label>
        {image ? (
          <button
            type="button"
            className="admin-danger"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setError("");
              void deleteSectionImage(image.publicId)
                .then(() => onChange(undefined))
                .catch((reason: Error) => setError(reason.message))
                .finally(() => setBusy(false));
            }}
          >
            Delete image
          </button>
        ) : null}
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}
