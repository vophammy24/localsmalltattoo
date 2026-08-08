import type { AboutContent } from "../types/about";
export function StudioStorySection({ content }: { content: AboutContent["story"] }) {
  return (
    <section
      className={`about-story page-shell${content.primaryImage || content.secondaryImage ? " has-images" : ""}`}
    >
      {content.primaryImage || content.secondaryImage ? (
        <div
          className={`about-story__images${content.primaryImage ? " has-primary" : ""}${content.secondaryImage ? " has-secondary" : ""}`}
        >
          {content.primaryImage ? (
            <img
              className="about-story__image about-story__image--primary"
              src={content.primaryImage.url}
              alt={content.primaryImage.alt}
            />
          ) : null}
          {content.secondaryImage ? (
            <img
              className="about-story__image about-story__image--secondary"
              src={content.secondaryImage.url}
              alt={content.secondaryImage.alt}
            />
          ) : null}
        </div>
      ) : null}
      <div className="about-story__copy">
        <p>{content.label}</p>
        <h2>{content.heading}</h2>
        {content.paragraphs.map((paragraph, index) => (
          <span key={index}>{paragraph}</span>
        ))}
        {content.signature ? (
          <strong className="about-story__signature">{content.signature}</strong>
        ) : null}
      </div>
    </section>
  );
}
