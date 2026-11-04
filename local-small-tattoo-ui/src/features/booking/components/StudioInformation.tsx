import { SITE_CONFIG } from "../../../config/siteConfig";
import { useBusinessSettings } from "../../businessSettings/BusinessSettingsContext";
import { summarizeHours } from "../../businessSettings/components/OpeningHours";
import {
  createPhoneHref,
  formatBusinessAddress,
} from "../../businessSettings/utils/businessSettings";
export function StudioInformation() {
  const { settings } = useBusinessSettings();
  return (
    <aside className="booking-studio" aria-labelledby="booking-studio-title">
      <div>
        <p className="booking-studio__label">Atelier location</p>
        <h2 id="booking-studio-title">{SITE_CONFIG.address.city}</h2>
        <address>
          <a href={SITE_CONFIG.links.googleMaps} target="_blank" rel="noreferrer">
            {formatBusinessAddress(SITE_CONFIG.address)}
          </a>
        </address>
      </div>

      <dl className="booking-studio__details">
        <div>
          <dt>Phone</dt>
          <dd>
            <a href={createPhoneHref(SITE_CONFIG.contact.phone)}>{SITE_CONFIG.contact.phone}</a>
          </dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${SITE_CONFIG.contact.email}`}>{SITE_CONFIG.contact.email}</a>
          </dd>
        </div>
        <div>
          <dt>Studio hours</dt>
          <dd>{summarizeHours(SITE_CONFIG.openingHours)}</dd>
        </div>
      </dl>

      <a
        className="button button--secondary booking-studio__map-link"
        href={SITE_CONFIG.links.googleMaps}
        target="_blank"
        rel="noreferrer"
      >
        Get Directions
      </a>
      {settings?.bookingNotice ? (
        <p className="booking-studio__notice">{settings.bookingNotice}</p>
      ) : null}
    </aside>
  );
}
