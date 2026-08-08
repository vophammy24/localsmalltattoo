import { ButtonLink } from "../../components/common/ButtonLink";
import { useAboutPage } from "../about/hooks/useAboutPage";

export function HeroSection() {
  const { data } = useAboutPage();
  const hero = data?.home.hero;
  if (hero?.isVisible === false) return null;

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__media" aria-hidden="true">
        {hero?.image ? <img src={hero.image.url} alt={hero.image.alt} /> : null}
      </div>
      <div className="home-hero__overlay" aria-hidden="true" />
      <div className="home-hero__content page-shell">
        <h1 id="home-hero-title" className="home-hero__title">
          {(hero?.headingLines ?? ["Local.", "Small."]).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p className="home-hero__subtitle">{hero?.subtitle ?? "Ink Our Story"}</p>
        <div className="home-hero__actions">
          <ButtonLink to={hero?.buttonUrl || "/booking"}>
            {hero?.buttonLabel || "Book an appointment"}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
