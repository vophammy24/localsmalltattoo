import { useBusinessSettings } from "../../businessSettings/BusinessSettingsContext";
import { summarizeHours } from "../../businessSettings/components/OpeningHours";
import {
  createPhoneHref,
  formatBusinessAddress,
} from "../../businessSettings/utils/businessSettings";
export function StudioInformation() {
  const { settings } = useBusinessSettings();
  if (!settings) return null;
  return (
    <aside className="booking-studio" aria-labelledby="booking-studio-title">
      <div>
        <p className="booking-studio__label">Atelier location</p>
        <h2 id="booking-studio-title">{settings.address.city}</h2>
        <address>
          <a href={settings.location.googleMapsUrl} target="_blank" rel="noreferrer">
            {formatBusinessAddress(settings.address)}
          </a>
        </address>
      </div>

      <dl className="booking-studio__details">
        <div>
          <dt>Phone</dt>
          <dd>
            <a href={createPhoneHref(settings.contact.phoneNumber)}>
              {settings.contact.phoneNumber}
            </a>
          </dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>
          </dd>
        </div>
        <div>
          <dt>Studio hours</dt>
          <dd>{summarizeHours(settings.openingHours)}</dd>
        </div>
      </dl>

      <a
        className="button button--secondary booking-studio__map-link"
        href={settings.location.googleMapsUrl}
        target="_blank"
        rel="noreferrer"
      >
        Get Directions ↗
      </a>
      {settings.bookingNotice ? (
        <p className="booking-studio__notice">{settings.bookingNotice}</p>
      ) : null}
    </aside>
  );
}
