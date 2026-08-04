import { ButtonLink } from "../../components/common/ButtonLink";
import { googleReviews } from "../../data/home";

export function LocationReviewSection() {
  return (
    <section className="section location-review-section" aria-labelledby="location-heading">
      <div className="page-shell location-review">
        <div className="location-review__visual">
          <img
            src="/images/studio-location.JPG"
            alt="Placeholder showing the tattoo studio interior"
          />
        </div>

        <div className="location-review__content">
          <h2 id="location-heading">Da Nang.</h2>
          <p>
            A private, appointment-led studio designed for focused consultation, careful
            preparation, and unhurried tattoo sessions.
          </p>

          <dl className="location-review__details">
            <div>
              <dt>Address</dt>
              <dd>52–54 Tran Thanh Mai, Da Nang, Vietnam</dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>Mon–Sun · 10:00–20:00</dd>
            </div>
          </dl>

          <div className="location-review__buttons">
            <ButtonLink to="/contact">View location</ButtonLink>
            <a className="button button--secondary" href="#google-reviews">
              Read reviews
            </a>
          </div>
        </div>
      </div>

      <div id="google-reviews" className="page-shell review-panel">
        <div className="review-panel__summary">
          <p>Google Maps Reviews</p>
          <strong>5.0</strong>
          <span aria-label="5 out of 5 stars">★★★★★</span>
          <small>Based on selected customer feedback</small>
        </div>

        <div className="review-panel__list">
          {googleReviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-card__header">
                <strong>{review.author}</strong>
                <span aria-label={`${review.rating} out of 5 stars`}>
                  {"★".repeat(review.rating)}
                </span>
              </div>
              <p>“{review.text}”</p>
              <small>{review.relativeDate}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
