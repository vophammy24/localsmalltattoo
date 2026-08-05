import type { AboutContent } from "../types/about";
export function MissionSection({ content }: { content: AboutContent["mission"] }) {
  return (
    <section className="about-mission">
      <div className="page-shell">
        <div className="about-mission__intro">
          <div>
            <h2>{content.heading}</h2>
            <p>{content.description}</p>
          </div>
          {content.image ? (
            <img src={content.image.image.url} alt={content.image.image.alt} loading="lazy" />
          ) : null}
        </div>
        <div className="about-values">
          {[...content.values]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((value, index) => (
              <article key={value.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
