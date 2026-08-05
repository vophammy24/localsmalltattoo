import type { AboutContent } from "../types/about";
export function StudioStorySection({ content }: { content: AboutContent["story"] }) {
  return (
    <section
      className={`about-story page-shell${content.primaryImage || content.secondaryImage ? " has-images" : ""}`}
    >
      <div className="about-story__copy">
        <p>{content.label}</p>
        <h2>{content.heading}</h2>
        {content.paragraphs.map((paragraph, index) => (
          <span key={index}>{paragraph}</span>
        ))}
      </div>
      {content.primaryImage || content.secondaryImage ? (
        <div className="about-story__images">
          {content.primaryImage ? (
            <img src={content.primaryImage.image.url} alt={content.primaryImage.image.alt} />
          ) : null}
          {content.secondaryImage ? (
            <img src={content.secondaryImage.image.url} alt={content.secondaryImage.image.alt} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
