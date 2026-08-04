import { ButtonLink } from "../components/common/ButtonLink";
import { StyleNavigation } from "../features/tattooStyles/components/StyleNavigation";
import { TattooStyleSection } from "../features/tattooStyles/components/TattooStyleSection";
import { useTattooStyles } from "../features/tattooStyles/hooks/useTattooStyles";

export function StylesPage() {
  const { data, isLoading, error } = useTattooStyles();
  return (
    <div className="styles-page">
      <section className="styles-page__hero">
        <div className="page-shell">
          <p>Disciplines &amp; techniques</p>
          <h1>Tattoo styles.</h1>
          <span>Explore the visual languages practiced at our Da Nang atelier.</span>
        </div>
      </section>
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
          {data.map((style, index) => (
            <TattooStyleSection key={style._id} style={style} index={index} />
          ))}
        </>
      ) : null}
      <section className="styles-booking-cta">
        <div className="page-shell">
          <p>Have a direction in mind?</p>
          <h2>Begin with a conversation.</h2>
          <ButtonLink to="/booking">Request a booking</ButtonLink>
        </div>
      </section>
    </div>
  );
}
