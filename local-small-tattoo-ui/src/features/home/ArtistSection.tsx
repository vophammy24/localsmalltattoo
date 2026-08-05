import { ButtonLink } from "../../components/common/ButtonLink";
import { SectionHeading } from "../../components/common/SectionHeading";
import { ArtistGrid } from "../artists/components/ArtistGrid";
import { useArtists } from "../artists/hooks/useArtists";

export function ArtistSection() {
  const { data, isLoading, error } = useArtists("?featured=true");
  return (
    <section className="section artist-section" aria-labelledby="artist-heading">
      <div className="page-shell">
        <SectionHeading title="The Artists" align="center" />

        {isLoading ? <p className="styles-section__state">Loading featured artists...</p> : null}
        {error ? (
          <p className="styles-section__state">Featured artists are temporarily unavailable.</p>
        ) : null}
        {!isLoading && !error ? <ArtistGrid artists={data.slice(0, 3)} /> : null}
        {data.length > 0 ? (
          <div className="section-action">
            <ButtonLink to="/artists" variant="secondary">
              View all artists
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
