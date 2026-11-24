import { useState } from "react";
import { ButtonLink } from "../components/common/ButtonLink";
import { PageHero } from "../components/common/PageHero";
import { Seo } from "../components/seo/Seo";
import { SITE_CONFIG } from "../config/siteConfig";
import { ARTISTS, type StaticArtist } from "../data/artists";
import "../styles/artists.css";

const description =
  "Meet the tattoo artists behind Local Small Tattoo in Da Nang. Discover their experience, creative background, and personal approach to tattoo art.";

function ArtistPortrait({ artist }: { artist: StaticArtist }) {
  const [failedSource, setFailedSource] = useState<string>();
  const { portrait, imageAlt } = artist;

  return (
    <div className="artist-profile__portrait">
      {portrait && failedSource !== portrait ? (
        <img
          src={portrait}
          alt={imageAlt.trim() || `Portrait of ${artist.name}`}
          loading="lazy"
          onError={() => setFailedSource(portrait)}
        />
      ) : (
        <span>Portrait unavailable</span>
      )}
    </div>
  );
}

export function ArtistsPage() {
  const artists = ARTISTS.filter(
    ({ id, name, yearsOfExperience }) =>
      id.trim() &&
      name.trim() &&
      Number.isInteger(yearsOfExperience) &&
      yearsOfExperience > 0,
  );

  return (
    <div className="artists-page">
      <Seo
        title="Tattoo Artists in Da Nang | Local Small Tattoo"
        description={description}
        path="/artists"
      />
      <PageHero
        className="artists-hero"
        titleId="artists-heading"
        title="Meet Our Artists"
        description="Discover the artists and creative minds behind Local Small Tattoo."
      />
      {artists.map((artist, index) => (
        <section
          className={index % 2 ? "artist-profile artist-profile--reversed" : "artist-profile"}
          key={artist.id}
          aria-labelledby={`artist-${artist.id}`}
        >
          <div className="page-shell artist-profile__inner">
            <ArtistPortrait artist={artist} />
            <div className="artist-profile__copy">
              <h2 id={`artist-${artist.id}`}>{artist.name}</h2>
              <p className="artist-profile__experience">
                {artist.yearsOfExperience} {artist.yearsOfExperience === 1 ? "year" : "years"} of
                experience
              </p>
              <p className="artist-profile__bio">{artist.introduction}</p>
            </div>
          </div>
        </section>
      ))}
      {artists.length === 0 ? (
        <p className="page-shell artists-page__empty">Artist profiles are currently unavailable.</p>
      ) : null}
      <section className="artists-page__booking" aria-labelledby="artists-booking-heading">
        <div className="page-shell">
          <h2 id="artists-booking-heading">Ready for your next tattoo?</h2>
          <ButtonLink to={SITE_CONFIG.links.booking}>Book an appointment</ButtonLink>
        </div>
      </section>
    </div>
  );
}
