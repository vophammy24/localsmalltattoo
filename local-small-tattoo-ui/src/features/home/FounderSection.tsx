import { useState } from "react";
import { SITE_ASSETS } from "../../config/siteAssets";
import { DEFAULT_FOUNDER_SECTION } from "../about/data/defaultFounder";
import { useAboutPage } from "../about/hooks/useAboutPage";
import type { AboutContent } from "../about/types/about";

export function FounderSection({
  content: suppliedContent,
}: {
  content?: AboutContent["founderSection"];
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const { data } = useAboutPage();
  const content = suppliedContent ?? data?.founderSection ?? DEFAULT_FOUNDER_SECTION;

  if (content.isVisible === false) return null;

  return (
    <section className="section founder-section" aria-labelledby="founder-heading">
      <div className={`founder-section__inner page-shell${!imageFailed ? " has-image" : ""}`}>
        <div className="founder-section__content">
          <h2 id="founder-heading">{content.heading}</h2>
          <div className="founder-section__copy">
            {content.paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>
          {content.signature ? (
            <p className="founder-section__signature">{content.signature}</p>
          ) : null}
        </div>
        {!imageFailed ? (
          <figure className="founder-section__portrait">
            <img
              src={SITE_ASSETS.founder}
              alt={content.image?.alt || content.name}
              width={900}
              height={1351}
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
            <figcaption>
              <strong>{content.name}</strong>
              {content.role ? <span>{content.role}</span> : null}
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
