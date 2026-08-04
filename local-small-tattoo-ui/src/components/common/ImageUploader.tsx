import { ImagePlus, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";

type ImageUploaderProps = {
  file: File | null;
  currentUrl?: string;
  onChange: (file: File | null) => void;
};

export function ImageUploader({ file, currentUrl, onChange }: ImageUploaderProps) {
  const [preview, setPreview] = useState("");
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
    onChange(event.target.files?.[0] ?? null);
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
        <strong>Choose cover image</strong>
        <span>JPG, PNG or WebP · 5 MB maximum</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={select} />
      </label>
    </div>
  );
}
