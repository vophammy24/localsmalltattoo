import type { ChangeEvent } from "react";
import { IMAGE_INPUT_ACCEPT } from "../../../utils/imageUpload";

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
        accept={IMAGE_INPUT_ACCEPT}
        multiple
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby="referenceImages-help referenceImages-error"
      />

      <label className={`booking-upload ${error ? "has-error" : ""}`} htmlFor="referenceImages">
        <strong>Choose images</strong>
        <small id="referenceImages-help">Up to 5 images · 20 MB each</small>
      </label>

      <p className="booking-field__error" id="referenceImages-error" aria-live="polite">
        {error}
      </p>

      {previews.length > 0 ? (
        <ul className="booking-upload__previews" aria-label="Selected images">
          {previews.map(({ file, url }, index) => (
            <li key={url}>
              <span className="booking-upload__filename">{file.name}</span>
              <img
                src={url}
                alt=""
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
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
