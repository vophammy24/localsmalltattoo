import { SITE_CONFIG } from "../../config/siteConfig";
import { useAboutPage } from "../about/hooks/useAboutPage";
import { useBusinessSettings } from "../businessSettings/BusinessSettingsContext";
import { summarizeHours } from "../businessSettings/components/OpeningHours";

export function LocationReviewSection() {
  const { data } = useAboutPage();
  const location = data?.home.location;
  const { settings } = useBusinessSettings();
  if (location?.isVisible === false) return null;
  return (
    <section className="section location-review-section" aria-labelledby="location-heading">
      <div className="page-shell location-review">
        <div className="location-review__visual">
          {location?.image ? <img src={location.image.url} alt={location.image.alt} /> : null}
        </div>

        <div className="location-review__content">
          <h2 id="location-heading">
            {location?.heading || `${settings?.address.city ?? "Da Nang"}.`}
          </h2>
          <p>{location?.description || settings?.description}</p>

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
              href={SITE_CONFIG.links.googleMaps || SITE_CONFIG.links.contact}
              target={SITE_CONFIG.links.googleMaps ? "_blank" : undefined}
              rel={SITE_CONFIG.links.googleMaps ? "noreferrer" : undefined}
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
