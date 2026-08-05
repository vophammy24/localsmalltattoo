import { googleReviews } from "../../data/home";
import { useGallery } from "../gallery/hooks/useGallery";
import { useBusinessSettings } from "../businessSettings/BusinessSettingsContext";
import { summarizeHours } from "../businessSettings/components/OpeningHours";

export function LocationReviewSection() {
  const { data: featuredStudio } = useGallery("?type=STUDIO_PHOTO&featured=true&limit=2");
  const { data: studioFallback } = useGallery("?type=STUDIO_PHOTO&limit=2");
  const studioImage =
    featuredStudio.items[1] ??
    featuredStudio.items[0] ??
    studioFallback.items[1] ??
    studioFallback.items[0];
  const { settings } = useBusinessSettings();
  return (
    <section className="section location-review-section" aria-labelledby="location-heading">
      <div className="page-shell location-review">
        <div className="location-review__visual">
          {studioImage ? <img src={studioImage.image.url} alt={studioImage.image.alt} /> : null}
        </div>

        <div className="location-review__content">
          <h2 id="location-heading">{settings?.address.city ?? "Da Nang"}.</h2>
          <p>
            {settings?.description ??
              "A private, appointment-led studio designed for focused consultation."}
          </p>

          <dl className="location-review__details">
            <div>
              <dt>Address</dt>
              <dd>
                {settings
                  ? [
                      settings.address.addressLine,
                      settings.address.city,
                      settings.address.country,
                    ].join(", ")
                  : "Da Nang, Vietnam"}
              </dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>{settings ? summarizeHours(settings.openingHours) : ""}</dd>
            </div>
          </dl>

          <div className="location-review__buttons">
            <a
              className="button"
              href={settings?.location.googleMapsUrl || "/contact"}
              target={settings?.location.googleMapsUrl ? "_blank" : undefined}
              rel={settings?.location.googleMapsUrl ? "noreferrer" : undefined}
            >
              Get Directions
            </a>
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
