import { useParams } from "react-router";
import { ArtistGalleryCarousel } from "../features/artists/components/ArtistGalleryCarousel";
import { ArtistProfile } from "../features/artists/components/ArtistProfile";
import { useArtist } from "../features/artists/hooks/useArtist";
import { useGallery } from "../features/gallery/hooks/useGallery";
export function ArtistDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, error } = useArtist(slug);
  const gallery = useGallery(
    slug ? `?artist=${encodeURIComponent(slug)}&type=TATTOO_WORK&limit=12` : "",
  );
  if (isLoading) return <main className="artist-detail-state page-shell">Loading artist...</main>;
  if (error || !data)
    return <main className="artist-detail-state page-shell">{error || "Artist not found."}</main>;
  return (
    <main className="artist-detail-page">
      <section className={`artist-detail-hero${data.coverImage ? " has-cover" : ""}`}>
        {data.coverImage ? (
          <img
            className="artist-detail-hero__background"
            src={data.coverImage.url}
            alt={data.coverImage.alt}
          />
        ) : null}
        <div className="artist-detail-hero__overlay" aria-hidden="true" />
        <ArtistProfile artist={data} />
      </section>
      <div className="page-shell">
        <ArtistGalleryCarousel images={gallery.data.items} />
      </div>
    </main>
  );
}
