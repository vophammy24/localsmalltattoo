import { Link } from "react-router";
import type { Artist } from "../types/artist";

export function ArtistStyleList({ styles }: { styles: Artist["tattooStyleIds"] }) {
  return (
    <div className="artist-style-list">
      {styles.map((style) => (
        <Link key={style._id} to={`/styles#${style.slug}`}>
          {style.name}
        </Link>
      ))}
    </div>
  );
}
