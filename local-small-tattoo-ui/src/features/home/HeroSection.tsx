import { ButtonLink } from "../../components/common/ButtonLink";

export function HeroSection() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__media" aria-hidden="true">
        <img src="/images/hero-art1.JPG" alt="" />
      </div>
      <div className="home-hero__overlay" aria-hidden="true" />
      <div className="home-hero__content page-shell">
        <h1 id="home-hero-title" className="home-hero__title">
          <span>Local.</span>
          <span>Small.</span>
        </h1>
        <div className="home-hero__actions">
          <ButtonLink to="/booking">Book an appointment</ButtonLink>
        </div>
      </div>
    </section>
  );
}
