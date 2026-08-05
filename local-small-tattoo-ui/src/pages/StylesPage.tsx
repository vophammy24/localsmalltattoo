import { ButtonLink } from "../components/common/ButtonLink";
import { StyleNavigation } from "../features/tattooStyles/components/StyleNavigation";
import { TattooStyleSection } from "../features/tattooStyles/components/TattooStyleSection";
import { useTattooStyles } from "../features/tattooStyles/hooks/useTattooStyles";
import { PageHero } from "../components/common/PageHero";

export function StylesPage() {
  const { data, isLoading, error } = useTattooStyles();
  return (
    <div className="styles-page">
      <PageHero
        className="styles-page__hero"
        title="Tattoo styles"
        description="Explore the visual languages practiced at our atelier."
      />
      {isLoading ? <div className="page-shell styles-page__state">Loading styles...</div> : null}
      {error ? (
        <div className="page-shell styles-page__state styles-page__state--error">
          Unable to load tattoo styles.
        </div>
      ) : null}
      {!isLoading && !error && data.length === 0 ? (
        <div className="page-shell styles-page__state">No published tattoo styles yet.</div>
      ) : null}
      {data.length > 0 ? (
        <>
          <StyleNavigation styles={data} />
          {data.map((style) => (
            <TattooStyleSection key={style._id} style={style} />
          ))}
        </>
      ) : null}
      <section className="styles-booking-cta">
        <div className="page-shell">
          <p>Have a direction in mind?</p>
          <h2>Begin with a conversation.</h2>
          <ButtonLink to="/booking">Book An Appointment</ButtonLink>
        </div>
      </section>
    </div>
  );
}
