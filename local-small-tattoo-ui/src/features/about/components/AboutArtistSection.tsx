import { ArtistGrid } from "../../artists/components/ArtistGrid";
import type { AboutContent } from "../types/about";
export function AboutArtistSection({ content }: { content: AboutContent["artistSection"] }) {
  if (!content.artists?.length) return null;
  return (
    <section className="about-cms-artists page-shell">
      <header>
        <h2>{content.heading}</h2>
        <p>{content.description}</p>
      </header>
      <ArtistGrid artists={content.artists} />
    </section>
  );
}
