import type { Artist } from "../../artists/types/artist";
export function AboutArtistPicker({
  artists,
  selectedIds,
  onChange,
}: {
  artists: Artist[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="admin-about-artists">
      {artists.map((artist) => (
        <label key={artist._id}>
          <input
            type="checkbox"
            checked={selectedIds.includes(artist._id)}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? [...selectedIds, artist._id]
                  : selectedIds.filter((id) => id !== artist._id),
              )
            }
          />
          {artist.profileImage ? <img src={artist.profileImage.url} alt="" /> : null}
          <span>
            <strong>{artist.displayName || artist.fullName}</strong>
            <small>{artist.role}</small>
          </span>
        </label>
      ))}
    </div>
  );
}
