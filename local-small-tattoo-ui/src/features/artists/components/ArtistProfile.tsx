import { ButtonLink } from "../../../components/common/ButtonLink";
import type { Artist } from "../types/artist";
import { ArtistSocialLinks } from "./ArtistSocialLinks";
import { ArtistStyleList } from "./ArtistStyleList";
export function ArtistProfile({ artist }: { artist: Artist }) {
  const name = artist.displayName || artist.fullName;
  return (
    <section className="artist-profile page-shell">
      <div className="artist-profile__image">
        {artist.profileImage ? (
          <img src={artist.profileImage.url} alt={artist.profileImage.alt} />
        ) : null}
      </div>
      <div className="artist-profile__content">
        <h1>{name}</h1>
        <div className="artist-profile__biography">{artist.biography}</div>
        {artist.yearsOfExperience !== undefined ? (
          <dl>
            <dt>Experience</dt>
            <dd>{artist.yearsOfExperience}+ years</dd>
          </dl>
        ) : null}
        <ArtistStyleList styles={artist.tattooStyleIds} />
        <ArtistSocialLinks links={artist.socialLinks} />
        <ButtonLink to={`/booking?artist=${artist.slug}`}>Book with this artist</ButtonLink>
      </div>
    </section>
  );
}
