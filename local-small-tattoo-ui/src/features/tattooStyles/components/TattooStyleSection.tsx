import { ButtonLink } from "../../../components/common/ButtonLink";
import type { TattooStyle } from "../types/tattooStyle";
import { StyleGalleryPreview } from "./StyleGalleryPreview";

export function TattooStyleSection({ style, index }: { style: TattooStyle; index: number }) {
  return (
    <section className="tattoo-style-section" id={style.slug}>
      <div className="page-shell">
        <header className="tattoo-style-section__heading">
          <p>
            {String(index + 1).padStart(2, "0")} / {style.name}
          </p>
          <h2>{style.name}</h2>
          <p>{style.shortDescription}</p>
        </header>
        {style.coverImage ? (
          <figure className="tattoo-style-section__cover">
            <img src={style.coverImage.url} alt={style.coverImage.alt} loading="lazy" />
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
        <StyleGalleryPreview images={style.galleryImages ?? []} />
      </div>
    </section>
  );
}
