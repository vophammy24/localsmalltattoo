import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AboutArtistPicker } from "../../features/admin/about/AboutArtistPicker";
import { AboutImagePicker } from "../../features/admin/about/AboutImagePicker";
import { SectionVisibility } from "../../features/admin/about/SectionVisibility";
import {
  getAdminAbout,
  publishAdminAbout,
  saveAdminAbout,
} from "../../features/about/api/aboutApi";
import type { AboutContent } from "../../features/about/types/about";
import { getAdminArtists } from "../../features/artists/api/artistApi";
import type { Artist } from "../../features/artists/types/artist";
import { getAdminGallery } from "../../features/gallery/api/galleryApi";
import type { GalleryItem } from "../../features/gallery/types/gallery";

export function AdminAboutPage() {
  const [content, setContent] = useState<AboutContent>();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    void Promise.all([
      getAdminAbout(),
      getAdminGallery("?type=STUDIO_PHOTO&limit=50"),
      getAdminArtists("?publication=published"),
    ])
      .then(([about, gallery, artistData]) => {
        setContent(about.content);
        setImages(gallery.items);
        setArtists(artistData.items);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);
  if (!content) return <p className="admin-loading">{error || "Loading About content..."}</p>;
  const section = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) =>
    setContent((current) => (current ? { ...current, [key]: value } : current));
  async function save(publish: boolean) {
    setBusy(publish ? "publish" : "save");
    setError("");
    setNotice("");
    try {
      const saved = await saveAdminAbout(content!);
      setContent(saved.content);
      if (publish) {
        const published = await publishAdminAbout();
        setContent(published.content);
        setNotice("About page published successfully.");
      } else setNotice("Draft saved. The public page has not changed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save About page.");
    } finally {
      setBusy("");
    }
  }
  const moveValue = (index: number, step: number) => {
    const values = [...content.mission.values];
    const target = index + step;
    if (target < 0 || target >= values.length) return;
    [values[index], values[target]] = [values[target]!, values[index]!];
    section("mission", {
      ...content.mission,
      values: values.map((value, displayOrder) => ({ ...value, displayOrder })),
    });
  };
  return (
    <>
      <AdminPageHeader
        title="About Us CMS"
        description="Edit the fixed About page structure and publish changes when ready."
        action={
          <span className={`admin-publication ${content.isPublished ? "is-published" : ""}`}>
            {content.isPublished ? "Published" : "Draft only"}
          </span>
        }
      />
      {error ? <p className="admin-error">{error}</p> : null}
      {notice ? <p className="admin-success">{notice}</p> : null}
      <section className="admin-panel admin-about-section">
        <div className="admin-about-section__header">
          <h2>Hero</h2>
          <SectionVisibility
            checked={content.hero.isVisible !== false}
            onChange={(isVisible) => section("hero", { ...content.hero, isVisible })}
          />
        </div>
        <div className="admin-about-fields">
          <label>
            Heading *
            <input
              required
              maxLength={150}
              value={content.hero.heading}
              onChange={(e) => section("hero", { ...content.hero, heading: e.target.value })}
            />
          </label>
          <label className="is-full">
            Description *
            <textarea
              rows={4}
              value={content.hero.description}
              onChange={(e) => section("hero", { ...content.hero, description: e.target.value })}
            />
          </label>
          <label>
            CTA label
            <input
              value={content.hero.primaryCtaLabel}
              onChange={(e) =>
                section("hero", { ...content.hero, primaryCtaLabel: e.target.value })
              }
            />
          </label>
          <label>
            CTA URL
            <input
              value={content.hero.primaryCtaUrl}
              onChange={(e) => section("hero", { ...content.hero, primaryCtaUrl: e.target.value })}
            />
          </label>
        </div>
        <h3>Hero image</h3>
        <AboutImagePicker
          items={images}
          selectedIds={content.hero.imageId ? [content.hero.imageId] : []}
          onChange={(ids) => section("hero", { ...content.hero, imageId: ids[0] ?? "" })}
        />
      </section>
      <section className="admin-panel admin-about-section">
        <div className="admin-about-section__header">
          <h2>Studio story</h2>
          <SectionVisibility
            checked={content.story.isVisible !== false}
            onChange={(isVisible) => section("story", { ...content.story, isVisible })}
          />
        </div>
        <div className="admin-about-fields">
          <label>
            Section label
            <input
              value={content.story.label}
              onChange={(e) => section("story", { ...content.story, label: e.target.value })}
            />
          </label>
          <label>
            Heading *
            <input
              value={content.story.heading}
              onChange={(e) => section("story", { ...content.story, heading: e.target.value })}
            />
          </label>
        </div>
        <h3>Paragraphs</h3>
        {content.story.paragraphs.map((paragraph, index) => (
          <div className="admin-about-repeat" key={index}>
            <textarea
              rows={4}
              value={paragraph}
              onChange={(e) =>
                section("story", {
                  ...content.story,
                  paragraphs: content.story.paragraphs.map((value, position) =>
                    position === index ? e.target.value : value,
                  ),
                })
              }
            />
            <button
              title="Remove paragraph"
              onClick={() =>
                section("story", {
                  ...content.story,
                  paragraphs: content.story.paragraphs.filter((_, position) => position !== index),
                })
              }
            >
              <Trash2 />
            </button>
          </div>
        ))}
        <button
          className="admin-secondary"
          onClick={() =>
            section("story", { ...content.story, paragraphs: [...content.story.paragraphs, ""] })
          }
        >
          <Plus />
          Add paragraph
        </button>
        <h3>Primary image</h3>
        <AboutImagePicker
          items={images}
          selectedIds={content.story.primaryImageId ? [content.story.primaryImageId] : []}
          onChange={(ids) => section("story", { ...content.story, primaryImageId: ids[0] ?? "" })}
        />
        <h3>Secondary image</h3>
        <AboutImagePicker
          items={images}
          selectedIds={content.story.secondaryImageId ? [content.story.secondaryImageId] : []}
          onChange={(ids) => section("story", { ...content.story, secondaryImageId: ids[0] ?? "" })}
        />
      </section>
      <section className="admin-panel admin-about-section">
        <div className="admin-about-section__header">
          <h2>Mission</h2>
          <SectionVisibility
            checked={content.mission.isVisible !== false}
            onChange={(isVisible) => section("mission", { ...content.mission, isVisible })}
          />
        </div>
        <div className="admin-about-fields">
          <label>
            Heading *
            <input
              value={content.mission.heading}
              onChange={(e) => section("mission", { ...content.mission, heading: e.target.value })}
            />
          </label>
          <label className="is-full">
            Mission statement *
            <textarea
              rows={5}
              value={content.mission.description}
              onChange={(e) =>
                section("mission", { ...content.mission, description: e.target.value })
              }
            />
          </label>
        </div>
        <h3>Core values</h3>
        {content.mission.values.map((value, index) => (
          <div className="admin-about-value" key={index}>
            <input
              placeholder="Title"
              value={value.title}
              onChange={(e) =>
                section("mission", {
                  ...content.mission,
                  values: content.mission.values.map((item, position) =>
                    position === index ? { ...item, title: e.target.value } : item,
                  ),
                })
              }
            />
            <textarea
              placeholder="Description"
              value={value.description}
              onChange={(e) =>
                section("mission", {
                  ...content.mission,
                  values: content.mission.values.map((item, position) =>
                    position === index ? { ...item, description: e.target.value } : item,
                  ),
                })
              }
            />
            <div>
              <button title="Move up" onClick={() => moveValue(index, -1)}>
                <ArrowUp />
              </button>
              <button title="Move down" onClick={() => moveValue(index, 1)}>
                <ArrowDown />
              </button>
              <button
                title="Remove"
                onClick={() =>
                  section("mission", {
                    ...content.mission,
                    values: content.mission.values.filter((_, position) => position !== index),
                  })
                }
              >
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
        <button
          className="admin-secondary"
          onClick={() =>
            section("mission", {
              ...content.mission,
              values: [
                ...content.mission.values,
                { title: "", description: "", displayOrder: content.mission.values.length },
              ],
            })
          }
        >
          <Plus />
          Add value
        </button>
        <h3>Mission image</h3>
        <AboutImagePicker
          items={images}
          selectedIds={content.mission.imageId ? [content.mission.imageId] : []}
          onChange={(ids) => section("mission", { ...content.mission, imageId: ids[0] })}
        />
      </section>
      <section className="admin-panel admin-about-section">
        <div className="admin-about-section__header">
          <h2>Studio space</h2>
          <SectionVisibility
            checked={content.studioSpace.isVisible !== false}
            onChange={(isVisible) => section("studioSpace", { ...content.studioSpace, isVisible })}
          />
        </div>
        <div className="admin-about-fields">
          <label>
            Heading *
            <input
              value={content.studioSpace.heading}
              onChange={(e) =>
                section("studioSpace", { ...content.studioSpace, heading: e.target.value })
              }
            />
          </label>
          <label className="is-full">
            Description
            <textarea
              value={content.studioSpace.description}
              onChange={(e) =>
                section("studioSpace", { ...content.studioSpace, description: e.target.value })
              }
            />
          </label>
        </div>
        <AboutImagePicker
          multiple
          items={images}
          selectedIds={content.studioSpace.galleryItemIds}
          onChange={(ids) =>
            section("studioSpace", { ...content.studioSpace, galleryItemIds: ids })
          }
        />
      </section>
      <section className="admin-panel admin-about-section">
        <div className="admin-about-section__header">
          <h2>Artists</h2>
          <SectionVisibility
            checked={content.artistSection.isVisible !== false}
            onChange={(isVisible) =>
              section("artistSection", { ...content.artistSection, isVisible })
            }
          />
        </div>
        <div className="admin-about-fields">
          <label>
            Heading *
            <input
              value={content.artistSection.heading}
              onChange={(e) =>
                section("artistSection", { ...content.artistSection, heading: e.target.value })
              }
            />
          </label>
          <label className="is-full">
            Description
            <textarea
              value={content.artistSection.description}
              onChange={(e) =>
                section("artistSection", { ...content.artistSection, description: e.target.value })
              }
            />
          </label>
        </div>
        <AboutArtistPicker
          artists={artists}
          selectedIds={content.artistSection.artistIds}
          onChange={(ids) => section("artistSection", { ...content.artistSection, artistIds: ids })}
        />
      </section>
      <section className="admin-panel admin-about-section">
        <div className="admin-about-section__header">
          <h2>Final CTA</h2>
          <SectionVisibility
            checked={content.finalCta.isVisible !== false}
            onChange={(isVisible) => section("finalCta", { ...content.finalCta, isVisible })}
          />
        </div>
        <div className="admin-about-fields">
          <label>
            Heading *
            <input
              value={content.finalCta.heading}
              onChange={(e) =>
                section("finalCta", { ...content.finalCta, heading: e.target.value })
              }
            />
          </label>
          <label>
            Button label *
            <input
              value={content.finalCta.buttonLabel}
              onChange={(e) =>
                section("finalCta", { ...content.finalCta, buttonLabel: e.target.value })
              }
            />
          </label>
          <label className="is-full">
            Description
            <textarea
              value={content.finalCta.description}
              onChange={(e) =>
                section("finalCta", { ...content.finalCta, description: e.target.value })
              }
            />
          </label>
          <label>
            Button URL *
            <input
              value={content.finalCta.buttonUrl}
              onChange={(e) =>
                section("finalCta", { ...content.finalCta, buttonUrl: e.target.value })
              }
            />
          </label>
        </div>
        <h3>Background image</h3>
        <AboutImagePicker
          items={images}
          selectedIds={content.finalCta.imageId ? [content.finalCta.imageId] : []}
          onChange={(ids) => section("finalCta", { ...content.finalCta, imageId: ids[0] })}
        />
      </section>
      <div className="admin-style-form__actions">
        <button
          className="admin-secondary"
          disabled={Boolean(busy)}
          onClick={() => void save(false)}
        >
          {busy === "save" ? "Saving..." : "Save draft"}
        </button>
        <button className="admin-primary" disabled={Boolean(busy)} onClick={() => void save(true)}>
          {busy === "publish" ? "Publishing..." : "Publish changes"}
        </button>
      </div>
    </>
  );
}
