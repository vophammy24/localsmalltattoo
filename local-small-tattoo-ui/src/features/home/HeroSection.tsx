import { ButtonLink } from "../../components/common/ButtonLink";
import { useGallery } from "../gallery/hooks/useGallery";

export function HeroSection() {
  const { data: featuredStudio } = useGallery("?type=STUDIO_PHOTO&featured=true&limit=2");
  const { data: studioFallback } = useGallery("?type=STUDIO_PHOTO&limit=2");
  const heroImage = featuredStudio.items[0] ?? studioFallback.items[0];

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__media" aria-hidden="true">
        {heroImage ? <img src={heroImage.image.url} alt="" /> : null}
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
