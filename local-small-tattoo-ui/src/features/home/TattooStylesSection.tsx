import { ButtonLink } from "../../components/common/ButtonLink";
import { SectionHeading } from "../../components/common/SectionHeading";
import { tattooStyles } from "../../data/home";

export function TattooStylesSection() {
  return (
    <section className="section styles-section" aria-labelledby="styles-heading">
      <div className="page-shell">
        <SectionHeading title="Tattoo Styles." align="center" />

        <div className="styles-carousel" role="list" aria-label="Tattoo styles">
          {tattooStyles.map((style) => (
            <article className="style-card" key={style.id} role="listitem">
              <a className="style-card__link" href={`/styles#${style.slug}`}>
                <img className="style-card__image" src={style.image} alt="" />
                <span className="style-card__overlay" aria-hidden="true" />
                <span className="style-card__index">{style.index}</span>
                <span className="style-card__content">
                  <strong>{style.name}</strong>
                  <small>{style.description}</small>
                </span>
              </a>
            </article>
          ))}
        </div>

        <div className="section-action">
          <ButtonLink to="/styles" variant="secondary">
            View all styles
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
