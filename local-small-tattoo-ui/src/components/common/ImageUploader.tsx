import { ImagePlus, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { getImageFileError, IMAGE_INPUT_ACCEPT } from "../../utils/imageUpload";

type ImageUploaderProps = {
  file: File | null;
  currentUrl?: string;
  onChange: (file: File | null) => void;
  label?: string;
};

export function ImageUploader({
  file,
  currentUrl,
  onChange,
  label = "Choose cover image",
}: ImageUploaderProps) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function select(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    const validationError = selectedFile ? getImageFileError(selectedFile) : null;
    setError(validationError ?? "");
    onChange(validationError ? null : selectedFile);
    if (validationError) event.target.value = "";
  }

  const source = preview || currentUrl;
  return (
    <div className="image-uploader">
      {source ? (
        <div className="image-uploader__preview">
          <img src={source} alt="Cover preview" />
          <button type="button" title="Remove selected image" onClick={() => onChange(null)}>
            <X />
          </button>
        </div>
      ) : null}
      <label>
        <ImagePlus />
        <strong>{label}</strong>
        <span>JPG, JPEG, PNG, WebP, HEIC or HEIF · Under 20 MB</span>
        <input type="file" accept={IMAGE_INPUT_ACCEPT} onChange={select} />
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}
