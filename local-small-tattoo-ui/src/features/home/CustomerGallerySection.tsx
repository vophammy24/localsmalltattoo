import { ButtonLink } from "../../components/common/ButtonLink";
import { SectionHeading } from "../../components/common/SectionHeading";
import { useGallery } from "../gallery/hooks/useGallery";
import { getCloudinaryImageUrl, getCloudinarySrcSet } from "../../utils/cloudinaryImage";

export function CustomerGallerySection() {
  const { data } = useGallery("?type=CUSTOMER_PHOTO&featured=true&limit=6");
  if (!data.items.length) return null;
  return (
    <section
      className="section customer-gallery-section"
      aria-labelledby="customer-gallery-heading"
    >
      <div className="page-shell">
        <SectionHeading title="With Our Clients." align="center" />

        <div className="customer-gallery">
          {data.items.map((item, index) => (
            <figure
              className={`customer-gallery__item customer-gallery__item--${index % 3 === 0 ? "large" : "small"}`}
              key={item._id}
            >
              <img
                src={getCloudinaryImageUrl(item.image.url, { width: 800 })}
                srcSet={getCloudinarySrcSet(item.image.url)}
                sizes="(max-width: 767px) 100vw, 50vw"
                alt={item.image.alt}
                loading="lazy"
                decoding="async"
                width={item.image.width}
                height={item.image.height}
              />
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
