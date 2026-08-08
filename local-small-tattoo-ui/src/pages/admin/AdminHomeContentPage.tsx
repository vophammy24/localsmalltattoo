import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { SectionImageField } from "../../features/admin/about/SectionImageField";
import { SectionVisibility } from "../../features/admin/about/SectionVisibility";
import {
  getAdminAbout,
  publishAdminAbout,
  saveAdminAbout,
} from "../../features/about/api/aboutApi";
import type { AboutContent } from "../../features/about/types/about";

export function AdminHomeContentPage() {
  const [content, setContent] = useState<AboutContent>();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    void getAdminAbout()
      .then((result) => setContent(result.content))
      .catch((e: Error) => setMessage(e.message));
  }, []);
  if (!content) return <p className="admin-loading">{message || "Loading Home content..."}</p>;
  const update = (next: AboutContent) => setContent(next);
  async function save(publish: boolean) {
    setBusy(publish ? "publish" : "save");
    setMessage("");
    try {
      const saved = await saveAdminAbout(content!);
      setContent(saved.content);
      if (publish) setContent((await publishAdminAbout()).content);
      setMessage(publish ? "Home page published." : "Home draft saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save Home page.");
    } finally {
      setBusy("");
    }
  }
  const home = content.home;
  const founder = content.founderSection;
  return (
    <>
      <AdminPageHeader
        title="Home CMS"
        description="Edit Home page sections and their fixed images."
      />
      {message ? <p className="admin-success">{message}</p> : null}
      <section className="admin-panel admin-about-section">
        <div className="admin-about-section__header">
          <h2>Hero</h2>
          <SectionVisibility
            checked={home.hero.isVisible}
            onChange={(isVisible) =>
              update({ ...content, home: { ...home, hero: { ...home.hero, isVisible } } })
            }
          />
        </div>
        <div className="admin-about-fields">
          <label className="is-full">
            Heading lines
            <textarea
              rows={3}
              value={home.hero.headingLines.join("\n")}
              onChange={(e) =>
                update({
                  ...content,
                  home: {
                    ...home,
                    hero: {
                      ...home.hero,
                      headingLines: e.target.value.split("\n").filter(Boolean),
                    },
                  },
                })
              }
            />
          </label>
          <label>
            Subtitle
            <input
              value={home.hero.subtitle}
              onChange={(e) =>
                update({
                  ...content,
                  home: { ...home, hero: { ...home.hero, subtitle: e.target.value } },
                })
              }
            />
          </label>
          <label>
            Button label
            <input
              value={home.hero.buttonLabel}
              onChange={(e) =>
                update({
                  ...content,
                  home: { ...home, hero: { ...home.hero, buttonLabel: e.target.value } },
                })
              }
            />
          </label>
          <label>
            Button URL
            <input
              value={home.hero.buttonUrl}
              onChange={(e) =>
                update({
                  ...content,
                  home: { ...home, hero: { ...home.hero, buttonUrl: e.target.value } },
                })
              }
            />
          </label>
        </div>
        <SectionImageField
          section="home-hero"
          label="Fixed hero image"
          image={home.hero.image}
          alt="Local Small Tattoo studio"
          onChange={(image) =>
            update({ ...content, home: { ...home, hero: { ...home.hero, image } } })
          }
        />
      </section>
      <section className="admin-panel admin-about-section">
        <div className="admin-about-section__header">
          <h2>Founder</h2>
          <SectionVisibility
            checked={founder.isVisible}
            onChange={(isVisible) =>
              update({ ...content, founderSection: { ...founder, isVisible } })
            }
          />
        </div>
        <div className="admin-about-fields">
          <label>
            Name
            <input
              value={founder.name}
              onChange={(e) =>
                update({ ...content, founderSection: { ...founder, name: e.target.value } })
              }
            />
          </label>
          <label>
            Role
            <input
              value={founder.role}
              onChange={(e) =>
                update({ ...content, founderSection: { ...founder, role: e.target.value } })
              }
            />
          </label>
          <label>
            Heading
            <input
              value={founder.heading}
              onChange={(e) =>
                update({ ...content, founderSection: { ...founder, heading: e.target.value } })
              }
            />
          </label>
          <label>
            Signature
            <input
              value={founder.signature}
              onChange={(e) =>
                update({ ...content, founderSection: { ...founder, signature: e.target.value } })
              }
            />
          </label>
        </div>
        {founder.paragraphs.map((paragraph, index) => (
          <div className="admin-about-repeat" key={index}>
            <textarea
              rows={3}
              value={paragraph}
              onChange={(e) =>
                update({
                  ...content,
                  founderSection: {
                    ...founder,
                    paragraphs: founder.paragraphs.map((p, i) =>
                      i === index ? e.target.value : p,
                    ),
                  },
                })
              }
            />
            <button
              title="Remove"
              onClick={() =>
                update({
                  ...content,
                  founderSection: {
                    ...founder,
                    paragraphs: founder.paragraphs.filter((_, i) => i !== index),
                  },
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
            update({
              ...content,
              founderSection: { ...founder, paragraphs: [...founder.paragraphs, ""] },
            })
          }
        >
          <Plus /> Add paragraph
        </button>
        <SectionImageField
          section="founder"
          label="Fixed founder image"
          image={founder.image}
          alt={founder.name}
          onChange={(image) => update({ ...content, founderSection: { ...founder, image } })}
        />
      </section>
      <section className="admin-panel admin-about-section">
        <div className="admin-about-section__header">
          <h2>Location</h2>
          <SectionVisibility
            checked={home.location.isVisible}
            onChange={(isVisible) =>
              update({ ...content, home: { ...home, location: { ...home.location, isVisible } } })
            }
          />
        </div>
        <div className="admin-about-fields">
          <label>
            Heading
            <input
              value={home.location.heading}
              onChange={(e) =>
                update({
                  ...content,
                  home: { ...home, location: { ...home.location, heading: e.target.value } },
                })
              }
            />
          </label>
          <label className="is-full">
            Description
            <textarea
              rows={4}
              value={home.location.description}
              onChange={(e) =>
                update({
                  ...content,
                  home: { ...home, location: { ...home.location, description: e.target.value } },
                })
              }
            />
          </label>
        </div>
        <SectionImageField
          section="home-location"
          label="Fixed location image"
          image={home.location.image}
          alt={home.location.heading}
          onChange={(image) =>
            update({ ...content, home: { ...home, location: { ...home.location, image } } })
          }
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
          {busy === "publish" ? "Publishing..." : "Publish Home"}
        </button>
      </div>
    </>
  );
}
