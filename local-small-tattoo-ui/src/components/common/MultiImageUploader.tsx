import { Images } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { getImageFileError, IMAGE_INPUT_ACCEPT } from "../../utils/imageUpload";

export function MultiImageUploader({
  onChange,
  disabled = false,
}: {
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState("");
  function select(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const validationError = files.map(getImageFileError).find(Boolean);
    setError(validationError ?? "");
    if (!validationError) onChange(files);
    event.target.value = "";
  }
  return (
    <label className="multi-image-uploader">
      <Images />
      <strong>Add gallery images</strong>
      <span>JPG, JPEG, PNG, WebP, HEIC or HEIF · Up to 20 images · Under 20 MB each</span>
      <input
        disabled={disabled}
        type="file"
        multiple
        accept={IMAGE_INPUT_ACCEPT}
        onChange={select}
      />
      {error ? <span className="admin-error">{error}</span> : null}
    </label>
  );
}
