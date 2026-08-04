import { ButtonLink } from "../../components/common/ButtonLink";
import { SectionHeading } from "../../components/common/SectionHeading";
import { customerGallery } from "../../data/home";

export function CustomerGallerySection() {
  return (
    <section className="section customer-gallery-section" aria-labelledby="customer-gallery-heading">
      <div className="page-shell">
        <SectionHeading
          eyebrow="04 / Studio moments"
          title="With Our Clients."
          align="center"
        />

        <div className="customer-gallery">
          {customerGallery.map((image) => (
            <figure
              className={`customer-gallery__item customer-gallery__item--${image.size}`}
              key={image.id}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>

        <div className="section-action">
          <ButtonLink to="/gallery?type=customers" variant="secondary">
            View customer gallery
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
