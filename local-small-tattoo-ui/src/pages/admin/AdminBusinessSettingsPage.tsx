import { SITE_CONFIG } from "../../config/siteConfig";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import {
  extractGoogleMapsEmbedUrl,
  getAdminBusinessSettings,
  saveBusinessSettings,
} from "../../features/businessSettings/api/businessSettingsApi";
import { useBusinessSettings } from "../../features/businessSettings/BusinessSettingsContext";
import {
  BUSINESS_DAYS,
  type BusinessSettings,
} from "../../features/businessSettings/types/businessSettings";
const dayNames: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};
export function AdminBusinessSettingsPage() {
  const [values, setValues] = useState<BusinessSettings>();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { refresh } = useBusinessSettings();
  useEffect(() => {
    void getAdminBusinessSettings()
      .then((data) => setValues({ ...data.settings, logoAlt: data.settings.logo?.alt ?? "" }))
      .catch((reason: Error) => setError(reason.message));
  }, []);
  if (!values) return <p className="admin-loading">{error || "Loading settings..."}</p>;
  const patch = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) =>
    setValues((current) => (current ? { ...current, [key]: value } : current));
  async function save() {
    setBusy("save");
    setError("");
    try {
      const data = await saveBusinessSettings(values!);
      setValues(data.settings);
      await refresh();
      setNotice("Business settings saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save settings.");
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <AdminPageHeader
        title="Business settings"
        description="One source for brand, contact, location and opening hours."
      />
      {error ? <p className="admin-error">{error}</p> : null}
      {notice ? <p className="admin-success">{notice}</p> : null}
      <section className="admin-panel business-form">
        <h2>Brand information</h2>
        <div className="admin-about-fields">
          <p>Public business name: {SITE_CONFIG.businessName}</p>
          <label>
            Short name
            <input value={values.shortName} onChange={(e) => patch("shortName", e.target.value)} />
          </label>
          <label className="is-full">
            Description
            <textarea
              maxLength={500}
              value={values.description}
              onChange={(e) => patch("description", e.target.value)}
            />
          </label>
        </div>
        <p>
          Logo, public business name, phone, email and social links are managed through
          src/config/siteAssets.ts and src/config/siteConfig.ts.
        </p>
      </section>
      <section className="admin-panel business-form">
        <h2>Address</h2>
        <p>
          Public address is fixed in src/config/siteConfig.ts. These stored historical fields are
          read-only.
        </p>
        <p>{Object.values(SITE_CONFIG.address).filter(Boolean).join(", ")}</p>
        <fieldset disabled>
          <div className="admin-about-fields">
            {(["addressLine", "ward", "district", "city", "country", "postalCode"] as const).map(
              (key) => (
                <label key={key}>
                  {key.replace(/([A-Z])/g, " $1")}
                  <input
                    value={values.address[key]}
                    onChange={(e) => patch("address", { ...values.address, [key]: e.target.value })}
                  />
                </label>
              ),
            )}
          </div>
        </fieldset>
      </section>
      <section className="admin-panel business-form">
        <h2>Google Maps</h2>
        <div className="admin-about-fields">
          <p>
            Directions and embed URLs are managed through SITE_CONFIG.links.googleMaps and
            googleMapsEmbed.
          </p>
          <label className="is-full">
            Embed URL *
            <input
              readOnly
              value={SITE_CONFIG.links.googleMapsEmbed}
              onChange={(e) =>
                patch("location", { ...values.location, googleMapsEmbedUrl: e.target.value })
              }
            />
          </label>
          <label>
            Latitude
            <input
              type="number"
              value={values.location.latitude ?? ""}
              onChange={(e) =>
                patch("location", {
                  ...values.location,
                  latitude: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </label>
          <label>
            Longitude
            <input
              type="number"
              value={values.location.longitude ?? ""}
              onChange={(e) =>
                patch("location", {
                  ...values.location,
                  longitude: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </label>
        </div>
        <div>
          <a
            className="admin-secondary"
            href={SITE_CONFIG.links.googleMaps}
            target="_blank"
            rel="noreferrer"
          >
            Open Maps <ExternalLink />
          </a>
        </div>
        <iframe
          className="business-map-preview"
          src={extractGoogleMapsEmbedUrl(SITE_CONFIG.links.googleMapsEmbed)}
          title="Map preview"
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </section>
      <section className="admin-panel business-form">
        <h2>Opening hours</h2>
        <p>
          Public hours: 10:00-20:00 daily, managed in src/config/siteConfig.ts. Stored hours below
          are read-only.
        </p>
        <fieldset disabled>
          <div className="business-hours-editor">
            {BUSINESS_DAYS.map((day) => {
              const item = values.openingHours.find((hour) => hour.day === day) ?? {
                day,
                isOpen: false,
                openTime: "",
                closeTime: "",
              };
              const update = (next: typeof item) =>
                patch(
                  "openingHours",
                  BUSINESS_DAYS.map((value) =>
                    value === day
                      ? next
                      : (values.openingHours.find((hour) => hour.day === value) ?? {
                          day: value,
                          isOpen: false,
                          openTime: "",
                          closeTime: "",
                        }),
                  ),
                );
              return (
                <div key={day}>
                  <strong>{dayNames[day]}</strong>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.isOpen}
                      onChange={(e) => update({ ...item, isOpen: e.target.checked })}
                    />
                    Open
                  </label>
                  <input
                    type="time"
                    disabled={!item.isOpen}
                    value={item.openTime}
                    onChange={(e) => update({ ...item, openTime: e.target.value })}
                  />
                  <span>-</span>
                  <input
                    type="time"
                    disabled={!item.isOpen}
                    value={item.closeTime}
                    onChange={(e) => update({ ...item, closeTime: e.target.value })}
                  />
                </div>
              );
            })}
          </div>
        </fieldset>
      </section>
      <section className="admin-panel business-form">
        <h2>Booking notice</h2>
        <div className="admin-about-fields">
          <label className="is-full">
            Booking notice
            <textarea
              value={values.bookingNotice}
              onChange={(e) => patch("bookingNotice", e.target.value)}
            />
          </label>
        </div>
      </section>
      <div className="admin-style-form__actions">
        <button className="admin-primary" disabled={Boolean(busy)} onClick={() => void save()}>
          {busy === "save" ? "Saving..." : "Save changes"}
        </button>
      </div>
    </>
  );
}
