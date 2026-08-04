import { ButtonLink } from "../../components/common/ButtonLink";
import { SectionHeading } from "../../components/common/SectionHeading";

export function ArtistSection() {
  return (
    <section className="section artist-section" aria-labelledby="artist-heading">
      <div className="page-shell">
        <SectionHeading title="The Artists" align="center" />

        <article className="artist-feature">
          <div className="artist-feature__content">
            <h3 id="artist-heading">Thuan Nguyen</h3>
            <p className="artist-feature__specialty">
              Architectural · Fineline · Shadow work
            </p>
            <p>
              Focused on considered linework and balanced composition. Each piece is
              developed through consultation, scale studies, and placement testing.
            </p>
            <div className="artist-feature__actions">
              <ButtonLink to="/artists/khoi-nguyen">View artist</ButtonLink>
            </div>
          </div>

          <div className="artist-feature__portrait">
            <img src="/images/artist-thuan.jpg" alt="Portrait placeholder for artist Thuan Nguyen" />
          </div>

          <dl className="artist-feature__facts">
            <div>
              <dt>Based in</dt>
              <dd>Da Nang</dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>5+ years</dd>
            </div>
            <div>
              <dt>Primary style</dt>
              <dd>Fineline</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
