import { Images } from "lucide-react";
import type { ChangeEvent } from "react";

export function MultiImageUploader({
  onChange,
  disabled = false,
}: {
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  function select(event: ChangeEvent<HTMLInputElement>) {
    onChange(Array.from(event.target.files ?? []));
    event.target.value = "";
  }
  return (
    <label className="multi-image-uploader">
      <Images />
      <strong>Add gallery images</strong>
      <span>Up to 20 images per style · 5 MB each</span>
      <input
        disabled={disabled}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={select}
      />
    </label>
  );
}
