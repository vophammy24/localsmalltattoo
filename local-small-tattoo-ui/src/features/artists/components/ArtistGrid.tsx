import type { Artist } from "../types/artist";
import { ArtistCard } from "./ArtistCard";
export function ArtistGrid({ artists }: { artists: Artist[] }) {
  return (
    <div className="artist-grid">
      {artists.map((artist) => (
        <ArtistCard key={artist._id} artist={artist} />
      ))}
    </div>
  );
}
