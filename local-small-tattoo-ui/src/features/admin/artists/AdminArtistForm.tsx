import { useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router";
import { ImageUploader } from "../../../components/common/ImageUploader";
import type { TattooStyle } from "../../tattooStyles/types/tattooStyle";
import type { Artist, ArtistFormValues } from "../../artists/types/artist";

const EMPTY: ArtistFormValues = {
  fullName: "",
  displayName: "",
  slug: "",
  role: "Tattoo Artist",
  shortBio: "",
  biography: "",
  profileAlt: "",
  coverAlt: "",
  tattooStyleIds: [],
  yearsOfExperience: "",
  instagram: "",
  facebook: "",
  tiktok: "",
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

export function AdminArtistForm({
  artist,
  styles,
  busy,
  onSave,
}: {
  artist?: Artist;
  styles: TattooStyle[];
  busy: boolean;
  onSave: (values: ArtistFormValues, profile: File | null, cover: File | null) => Promise<void>;
}) {
  const socialLinks = artist?.socialLinks ?? {};
  const [values, setValues] = useState<ArtistFormValues>(() =>
    artist
      ? {
          fullName: artist.fullName,
          displayName: artist.displayName ?? "",
          slug: artist.slug,
          role: artist.role,
          shortBio: artist.shortBio,
          biography: artist.biography,
          profileAlt: artist.profileImage?.alt ?? "",
          coverAlt: artist.coverImage?.alt ?? "",
          tattooStyleIds: artist.tattooStyleIds.map((style) => style._id),
          yearsOfExperience: artist.yearsOfExperience?.toString() ?? "",
          instagram: socialLinks.instagram ?? "",
          facebook: socialLinks.facebook ?? "",
          tiktok: socialLinks.tiktok ?? "",
          isFeatured: artist.isFeatured,
          isPublished: artist.isPublished,
          displayOrder: artist.displayOrder,
        }
      : EMPTY,
  );
  const [profile, setProfile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(artist));
  const formRef = useRef<HTMLFormElement>(null);
  function field(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === "fullName" && !slugEdited ? { slug: slugify(value) } : {}),
    }));
  }
  function toggleStyle(id: string) {
    setValues((current) => ({
      ...current,
      tattooStyleIds: current.tattooStyleIds.includes(id)
        ? current.tattooStyleIds.filter((item) => item !== id)
        : [...current.tattooStyleIds, id],
    }));
  }
  function submit(publish: boolean) {
    if (!formRef.current?.reportValidity()) return;
    void onSave({ ...values, isPublished: publish }, profile, cover);
  }
  return (
    <form ref={formRef} className="admin-style-form" onSubmit={(event) => event.preventDefault()}>
      <section className="admin-panel">
        <h2>Basic information</h2>
        <div className="admin-style-form__grid">
          <label>
            Full name *
            <input
              required
              minLength={2}
              maxLength={100}
              name="fullName"
              value={values.fullName}
              onChange={field}
            />
          </label>
          <label>
            Display name
            <input maxLength={100} name="displayName" value={values.displayName} onChange={field} />
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
          <label>
            Role *
            <input required maxLength={100} name="role" value={values.role} onChange={field} />
          </label>
          <label className="is-full">
            Short biography *
            <textarea
              required
              maxLength={250}
              name="shortBio"
              value={values.shortBio}
              onChange={field}
            />
            <span>{values.shortBio.length}/250</span>
          </label>
          <label className="is-full">
            Full biography *
            <textarea
              required
              maxLength={5000}
              rows={10}
              name="biography"
              value={values.biography}
              onChange={field}
            />
          </label>
          <label>
            Years of experience
            <input
              type="number"
              min={0}
              step={1}
              name="yearsOfExperience"
              value={values.yearsOfExperience}
              onChange={field}
            />
          </label>
          <label>
            Display order
            <input
              type="number"
              min={0}
              step={1}
              value={values.displayOrder}
              onChange={(event) =>
                setValues((current) => ({ ...current, displayOrder: Number(event.target.value) }))
              }
            />
          </label>
        </div>
      </section>
      <section className="admin-panel">
        <h2>Specialties *</h2>
        <div className="artist-style-select">
          {styles.map((style) => (
            <label key={style._id}>
              <input
                type="checkbox"
                checked={values.tattooStyleIds.includes(style._id)}
                onChange={() => toggleStyle(style._id)}
              />
              {style.name}
            </label>
          ))}
        </div>
        {values.tattooStyleIds.length === 0 ? (
          <p className="admin-style-form__hint">Select at least one tattoo style.</p>
        ) : null}
      </section>
      <section className="admin-panel">
        <h2>Media</h2>
        <div className="artist-media-grid">
          <div>
            <h3>Profile image *</h3>
            <ImageUploader
              file={profile}
              currentUrl={artist?.profileImage?.url}
              onChange={setProfile}
              label="Choose profile image"
            />
            <label className="style-cover-alt">
              Profile alternative text
              <input maxLength={160} name="profileAlt" value={values.profileAlt} onChange={field} />
            </label>
          </div>
          <div>
            <h3>Cover image</h3>
            <ImageUploader
              file={cover}
              currentUrl={artist?.coverImage?.url}
              onChange={setCover}
              label="Choose cover image"
            />
            <label className="style-cover-alt">
              Cover alternative text
              <input maxLength={160} name="coverAlt" value={values.coverAlt} onChange={field} />
            </label>
          </div>
        </div>
      </section>
      <section className="admin-panel">
        <h2>Social links</h2>
        <div className="admin-style-form__grid">
          {(["instagram", "facebook", "tiktok"] as const).map((name) => (
            <label key={name}>
              {name}
              <input
                type="url"
                pattern="https://.*"
                name={name}
                value={values[name]}
                onChange={field}
                placeholder={`https://${name}.com/...`}
              />
            </label>
          ))}
        </div>
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
      </section>
      <div className="admin-style-form__actions">
        <Link className="admin-secondary" to="/admin/artists">
          Cancel
        </Link>
        <button
          type="button"
          className="admin-secondary"
          disabled={busy || values.tattooStyleIds.length === 0}
          onClick={() => submit(false)}
        >
          Save draft
        </button>
        <button
          type="button"
          className="admin-primary"
          disabled={busy || values.tattooStyleIds.length === 0}
          onClick={() => submit(true)}
        >
          {busy ? "Saving..." : "Publish"}
        </button>
      </div>
    </form>
  );
}
