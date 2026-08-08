import { ButtonLink } from "../../components/common/ButtonLink";
import { SectionHeading } from "../../components/common/SectionHeading";
import { GalleryGrid } from "../gallery/components/GalleryGrid";
import { useGallery } from "../gallery/hooks/useGallery";

export function FeaturedGallerySection() {
  const { data } = useGallery("?type=TATTOO_WORK&featured=true&limit=10");
  if (!data.items.length) return null;
  return (
    <section className="section home-featured-gallery">
      <div className="page-shell">
        <SectionHeading title="Made With Intent." />
        <GalleryGrid items={data.items.slice(0, 10)} className="gallery-grid--featured" />
        <div className="section-action">
          <ButtonLink to="/gallery?type=TATTOO_WORK" variant="secondary">
            View all work
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
