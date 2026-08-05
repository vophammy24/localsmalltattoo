import type { Artist } from "../../artists/types/artist";
import type { TattooStyle } from "../../tattooStyles/types/tattooStyle";
import type { GalleryFormValues } from "../../gallery/types/gallery";

export const EMPTY_GALLERY_VALUES: GalleryFormValues = {
  title: "",
  caption: "",
  alt: "",
  type: "TATTOO_WORK",
  artistId: "",
  tattooStyleIds: [],
  isFeatured: false,
  isPublished: false,
  displayOrder: 0,
  photographedAt: "",
};

export function GalleryFields({
  values,
  artists,
  styles,
  onChange,
  hideAlt = false,
}: {
  values: GalleryFormValues;
  artists: Artist[];
  styles: TattooStyle[];
  onChange: (values: GalleryFormValues) => void;
  hideAlt?: boolean;
}) {
  const field = (key: keyof GalleryFormValues, value: GalleryFormValues[keyof GalleryFormValues]) =>
    onChange({ ...values, [key]: value });
  return (
    <div className="admin-gallery-fields">
      <label>
        Type *
        <select value={values.type} onChange={(event) => field("type", event.target.value)}>
          <option value="TATTOO_WORK">Tattoo work</option>
          <option value="CUSTOMER_PHOTO">Customer photo</option>
          <option value="STUDIO_PHOTO">Studio photo</option>
        </select>
      </label>
      <label>
        Artist
        <select value={values.artistId} onChange={(event) => field("artistId", event.target.value)}>
          <option value="">No artist</option>
          {artists.map((artist) => (
            <option key={artist._id} value={artist._id}>
              {artist.displayName || artist.fullName}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Tattoo styles</legend>
        <div className="admin-gallery-fields__checks">
          {styles.map((style) => (
            <label key={style._id}>
              <input
                type="checkbox"
                checked={values.tattooStyleIds.includes(style._id)}
                onChange={(event) =>
                  field(
                    "tattooStyleIds",
                    event.target.checked
                      ? [...values.tattooStyleIds, style._id]
                      : values.tattooStyleIds.filter((id) => id !== style._id),
                  )
                }
              />
              {style.name}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Title
        <input
          maxLength={160}
          value={values.title}
          onChange={(event) => field("title", event.target.value)}
        />
      </label>
      {!hideAlt ? (
        <label>
          Alt text *
          <input
            maxLength={200}
            value={values.alt}
            onChange={(event) => field("alt", event.target.value)}
          />
        </label>
      ) : null}
      <label className="is-full">
        Caption
        <textarea
          rows={4}
          maxLength={500}
          value={values.caption}
          onChange={(event) => field("caption", event.target.value)}
        />
      </label>
      <label>
        Photographed at
        <input
          type="date"
          value={values.photographedAt}
          onChange={(event) => field("photographedAt", event.target.value)}
        />
      </label>
      <label>
        Display order
        <input
          type="number"
          min={0}
          value={values.displayOrder}
          onChange={(event) => field("displayOrder", Number(event.target.value))}
        />
      </label>
      <label className="admin-check">
        <input
          type="checkbox"
          checked={values.isFeatured}
          onChange={(event) => field("isFeatured", event.target.checked)}
        />
        Featured
      </label>
      <label className="admin-check">
        <input
          type="checkbox"
          checked={values.isPublished}
          onChange={(event) => field("isPublished", event.target.checked)}
        />
        Published
      </label>
    </div>
  );
}
