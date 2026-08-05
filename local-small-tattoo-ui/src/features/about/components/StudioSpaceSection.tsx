import type { AboutContent } from "../types/about";
export function StudioSpaceSection({ content }: { content: AboutContent["studioSpace"] }) {
  if (!content.images?.length) return null;
  return (
    <section className="about-space page-shell">
      <header>
        <h2>{content.heading}</h2>
        <p>{content.description}</p>
      </header>
      <div>
        {content.images.map((item) => (
          <img key={item._id} src={item.image.url} alt={item.image.alt} loading="lazy" />
        ))}
      </div>
    </section>
  );
}
