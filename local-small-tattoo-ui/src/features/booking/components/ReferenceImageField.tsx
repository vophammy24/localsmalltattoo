import type { ChangeEvent } from "react";
import { BOOKING_IMAGE_RULES } from "../data/bookingOptions";

type ReferenceImageFieldProps = {
  error?: string;
  previews: Array<{
    file: File;
    url: string;
  }>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
};

export function ReferenceImageField({
  error,
  previews,
  onChange,
  onRemove,
}: ReferenceImageFieldProps) {
  return (
    <div className="booking-field booking-field--full">
      <label className="booking-field__label" htmlFor="referenceImages">
        Reference images <span>Optional</span>
      </label>

      <input
        className="booking-upload__input"
        id="referenceImages"
        name="referenceImages"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "referenceImages-error" : undefined}
      />

      <label
        className={`booking-upload ${error ? "has-error" : ""}`}
        htmlFor="referenceImages"
      >
        <span className="booking-upload__symbol" aria-hidden="true">
          +
        </span>
        <strong>Choose reference images</strong>
        <small>
          JPG, PNG or WebP · Up to {BOOKING_IMAGE_RULES.maxFiles} images · 5 MB
          each
        </small>
      </label>

      {error ? (
        <p className="booking-field__error" id="referenceImages-error">
          {error}
        </p>
      ) : null}

      {previews.length > 0 ? (
        <ul className="booking-upload__previews" aria-label="Selected images">
          {previews.map(({ file, url }, index) => (
            <li key={`${file.name}-${file.lastModified}`}>
              <img src={url} alt={`Selected reference ${index + 1}`} />
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${file.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
