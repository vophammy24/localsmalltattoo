import type { Artist } from "../types/artist";

export function ArtistSocialLinks({ links }: { links: Artist["socialLinks"] }) {
  const items = Object.entries(links ?? {}).filter((item): item is [string, string] =>
    Boolean(item[1]),
  );
  if (!items.length) return null;
  return (
    <div className="artist-social-links">
      {items.map(([name, url]) => (
        <a key={name} href={url} target="_blank" rel="noreferrer">
          {name}
        </a>
      ))}
    </div>
  );
}
