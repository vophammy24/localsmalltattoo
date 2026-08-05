import { ButtonLink } from "../../../components/common/ButtonLink";
import type { Artist } from "../types/artist";
export function ArtistCard({ artist }: { artist: Artist }) {
  const name = artist.displayName || artist.fullName;
  return (
    <article className="artist-card">
      <div className="artist-card__image">
        {artist.profileImage ? (
          <img src={artist.profileImage.url} alt={artist.profileImage.alt} />
        ) : null}
      </div>
      <div className="artist-card__content">
        <h2>{name}</h2>
        <p>{artist.tattooStyleIds.map((style) => style.name).join(" · ") || artist.role}</p>
        <ButtonLink to={`/artists/${artist.slug}`} variant="secondary">
          View artist profile
        </ButtonLink>
      </div>
    </article>
  );
}
