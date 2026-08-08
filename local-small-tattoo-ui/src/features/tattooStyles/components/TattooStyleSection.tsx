import { ButtonLink } from "../../../components/common/ButtonLink";
import type { TattooStyle } from "../types/tattooStyle";
import { StyleGalleryPreview, type StyleCarouselImage } from "./StyleGalleryPreview";
import { useGallery } from "../../gallery/hooks/useGallery";

export function TattooStyleSection({ style }: { style: TattooStyle }) {
  const gallery = useGallery(`?style=${encodeURIComponent(style.slug)}&type=TATTOO_WORK&limit=50`);
  const carouselImages: StyleCarouselImage[] = gallery.data.items.length
    ? gallery.data.items.map((item) => ({
        ...item.image,
        displayOrder: item.displayOrder,
        title: item.title,
      }))
    : (style.galleryImages ?? []);
  return (
    <section className="tattoo-style-section" id={style.slug}>
      <div className="page-shell">
        <header className="tattoo-style-section__heading">
          <h2>{style.name}</h2>
          <p>{style.shortDescription}</p>
        </header>
        {style.coverImage ? (
          <figure className="tattoo-style-section__cover" tabIndex={0}>
            <img src={style.coverImage.url} alt={style.coverImage.alt} loading="lazy" />
            <figcaption>
              <strong>{style.coverImage.alt || style.name}</strong>
              <small>{style.name}</small>
            </figcaption>
          </figure>
        ) : null}
        <div className="tattoo-style-section__body">
          <p>{style.description}</p>
          <div>
            <ButtonLink to={`/booking?style=${style.slug}`}>Book this style</ButtonLink>
            <ButtonLink to={`/gallery?style=${style.slug}`} variant="secondary">
              View gallery
            </ButtonLink>
          </div>
        </div>
        <StyleGalleryPreview images={carouselImages} tattooStyle={style.name} />
      </div>
    </section>
  );
}
