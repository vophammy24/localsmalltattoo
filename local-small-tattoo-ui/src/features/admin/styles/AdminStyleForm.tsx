import { useRef, useState, type ChangeEvent } from "react";
import { ImageUploader } from "../../../components/common/ImageUploader";
import type { TattooStyle, TattooStyleFormValues } from "../../tattooStyles/types/tattooStyle";

export const EMPTY_STYLE_VALUES: TattooStyleFormValues = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  coverAlt: "",
  isFeatured: false,
  isPublished: false,
  displayOrder: 0,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminStyleForm({
  initialStyle,
  onSave,
  busy,
}: {
  initialStyle?: TattooStyle;
  onSave: (values: TattooStyleFormValues, cover: File | null, publish: boolean) => Promise<void>;
  busy: boolean;
}) {
  const [values, setValues] = useState<TattooStyleFormValues>(() =>
    initialStyle
      ? {
          name: initialStyle.name,
          slug: initialStyle.slug,
          shortDescription: initialStyle.shortDescription,
          description: initialStyle.description,
          coverAlt: initialStyle.coverImage?.alt ?? "",
          isFeatured: initialStyle.isFeatured,
          isPublished: initialStyle.isPublished,
          displayOrder: initialStyle.displayOrder,
        }
      : EMPTY_STYLE_VALUES,
  );
  const [cover, setCover] = useState<File | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(initialStyle));
  const formRef = useRef<HTMLFormElement>(null);

  function field(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === "name" && !slugEdited ? { slug: slugify(value) } : {}),
    }));
  }
  function submit(publish: boolean) {
    if (!formRef.current?.reportValidity()) return;
    void onSave({ ...values, isPublished: publish }, cover, publish);
  }

  return (
    <form ref={formRef} className="admin-style-form" onSubmit={(event) => event.preventDefault()}>
      <section className="admin-panel">
        <h2>Basic information</h2>
        <div className="admin-style-form__grid">
          <label>
            Style name *
            <input
              required
              minLength={2}
              maxLength={80}
              name="name"
              value={values.name}
              onChange={field}
            />
          </label>
          <label>
            Slug *
            <input
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              name="slug"
              value={values.slug}
              onChange={(event) => {
                setSlugEdited(true);
                field(event);
              }}
            />
          </label>
          <label className="is-full">
            Short description *
            <textarea
              required
              maxLength={200}
              name="shortDescription"
              value={values.shortDescription}
              onChange={field}
            />
            <span>{values.shortDescription.length}/200</span>
          </label>
          <label className="is-full">
            Full description *
            <textarea
              required
              maxLength={3000}
              rows={9}
              name="description"
              value={values.description}
              onChange={field}
            />
          </label>
          <label>
            Display order
            <input
              type="number"
              min={0}
              name="displayOrder"
              value={values.displayOrder}
              onChange={(event) =>
                setValues((current) => ({ ...current, displayOrder: Number(event.target.value) }))
              }
            />
          </label>
        </div>
      </section>
      <section className="admin-panel">
        <h2>Cover media</h2>
        <ImageUploader
          file={cover}
          currentUrl={initialStyle?.coverImage?.url}
          onChange={setCover}
        />
        <label className="style-cover-alt">
          Alternative text
          <input maxLength={160} name="coverAlt" value={values.coverAlt} onChange={field} />
        </label>
      </section>
      <section className="admin-panel">
        <h2>Visibility</h2>
        <label className="admin-toggle">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(event) =>
              setValues((current) => ({ ...current, isFeatured: event.target.checked }))
            }
          />
          <span />
          Featured on Home
        </label>
        <p className="admin-style-form__hint">
          Publishing requires a cover image. Archived styles can be restored by saving them again.
        </p>
      </section>
      <div className="admin-style-form__actions">
        <button
          type="button"
          className="admin-secondary"
          disabled={busy}
          onClick={() => submit(false)}
        >
          Save draft
        </button>
        <button
          type="button"
          className="admin-primary"
          disabled={busy}
          onClick={() => submit(true)}
        >
          {busy ? "Saving..." : "Publish style"}
        </button>
      </div>
    </form>
  );
}
