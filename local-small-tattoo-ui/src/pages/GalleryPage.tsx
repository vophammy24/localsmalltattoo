import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { GalleryFilters } from "../features/gallery/components/GalleryFilters";
import { GalleryGrid } from "../features/gallery/components/GalleryGrid";
import { GallerySkeleton } from "../features/gallery/components/GallerySkeleton";
import { useGallery } from "../features/gallery/hooks/useGallery";
import { useTattooStyles } from "../features/tattooStyles/hooks/useTattooStyles";
import { ButtonLink } from "../components/common/ButtonLink";
import { PageHero } from "../components/common/PageHero";

export function GalleryPage() {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => {
    const next = new URLSearchParams(params);
    if (next.get("type") === "customers") next.set("type", "CUSTOMER_PHOTO");
    next.set("limit", "12");
    return `?${next}`;
  }, [params]);
  const { data, isLoading, error } = useGallery(query);
  const { data: styles } = useTattooStyles();
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete("page");
    setParams(next);
  }
  return (
    <main className="gallery-page">
      <PageHero
        className="gallery-hero"
        title="Gallery"
        description="Tattoo work, client moments and the studio environment in one evolving archive."
      />
      <section className="page-shell gallery-browser">
        <GalleryFilters
          type={params.get("type") === "customers" ? "CUSTOMER_PHOTO" : (params.get("type") ?? "")}
          style={params.get("style") ?? ""}
          styles={styles}
          onChange={change}
        />
        {isLoading ? <GallerySkeleton /> : null}
        {error ? <p className="gallery-state">{error}</p> : null}
        {!isLoading && !error ? <GalleryGrid items={data.items} /> : null}
        {!isLoading && !data.items.length ? (
          <p className="gallery-state">No published images match these filters.</p>
        ) : null}
        {data.pagination.totalPages > 1 ? (
          <nav className="gallery-pagination" aria-label="Gallery pages">
            <button
              disabled={data.pagination.page <= 1}
              onClick={() => change("page", String(data.pagination.page - 1))}
            >
              Previous
            </button>
            <span>
              {data.pagination.page} / {data.pagination.totalPages}
            </span>
            <button
              disabled={data.pagination.page >= data.pagination.totalPages}
              onClick={() => change("page", String(data.pagination.page + 1))}
            >
              Next
            </button>
          </nav>
        ) : null}
      </section>
      <section className="gallery-cta">
        <p>Ready to make it yours?</p>
        <h2>Begin your next piece.</h2>
        <ButtonLink to="/booking">Book an appointment</ButtonLink>
      </section>
    </main>
  );
}
