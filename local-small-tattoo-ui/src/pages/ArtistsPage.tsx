import { ButtonLink } from "../components/common/ButtonLink";
import { ArtistGrid } from "../features/artists/components/ArtistGrid";
import { ArtistHero } from "../features/artists/components/ArtistHero";
import { useArtists } from "../features/artists/hooks/useArtists";
export function ArtistsPage() {
  const { data, isLoading, error } = useArtists();
  return (
    <div className="artists-page">
      <ArtistHero />
      <section className="artists-list page-shell">
        {isLoading ? <p>Loading artists...</p> : null}
        {error ? <p className="artists-error">{error}</p> : null}
        {!isLoading && !error ? <ArtistGrid artists={data} /> : null}
      </section>
      <section className="artists-cta">
        <p>Found the right direction?</p>
        <h2>Start your consultation.</h2>
        <ButtonLink to="/booking">Book an appointment</ButtonLink>
      </section>
    </div>
  );
}
