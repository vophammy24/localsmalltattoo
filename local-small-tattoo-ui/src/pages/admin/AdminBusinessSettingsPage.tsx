import { ExternalLink, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import {
  deleteBusinessLogo,
  extractGoogleMapsEmbedUrl,
  getAdminBusinessSettings,
  saveBusinessSettings,
  uploadBusinessLogo,
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
  async function logo(file?: File) {
    if (!file) return;
    setBusy("logo");
    try {
      const data = await uploadBusinessLogo(
        file,
        values?.logoAlt ?? values?.businessName ?? "Logo",
      );
      setValues(data.settings);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to upload logo.");
    } finally {
      setBusy("");
    }
  }
  async function removeLogo() {
    setBusy("logo");
    try {
      const data = await deleteBusinessLogo();
      setValues(data.settings);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete logo.");
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
          <label>
            Business name *
            <input
              value={values.businessName}
              onChange={(e) => patch("businessName", e.target.value)}
            />
          </label>
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
        <div className="business-logo">
          {values.logo ? <img src={values.logo.url} alt={values.logo.alt} /> : null}
          <label className="admin-secondary">
            <Upload />
            Upload logo
            <input
              type="file"
              accept="image/*,.heic,.heif"
              onChange={(e) => void logo(e.target.files?.[0])}
            />
          </label>
          {values.logo ? (
            <button className="admin-secondary" onClick={() => void removeLogo()}>
              <Trash2 />
              Remove
            </button>
          ) : null}
          <input
            placeholder="Logo alt text"
            value={values.logoAlt ?? values.logo?.alt ?? ""}
            onChange={(e) => patch("logoAlt", e.target.value)}
          />
        </div>
      </section>
      <section className="admin-panel business-form">
        <h2>Contact</h2>
        <div className="admin-about-fields">
          <label>
            Phone *
            <input
              value={values.contact.phoneNumber}
              onChange={(e) => patch("contact", { ...values.contact, phoneNumber: e.target.value })}
            />
          </label>
          <label>
            Secondary phone
            <input
              value={values.contact.secondaryPhoneNumber}
              onChange={(e) =>
                patch("contact", { ...values.contact, secondaryPhoneNumber: e.target.value })
              }
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              value={values.contact.email}
              onChange={(e) => patch("contact", { ...values.contact, email: e.target.value })}
            />
          </label>
        </div>
      </section>
      <section className="admin-panel business-form">
        <h2>Address</h2>
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
      </section>
      <section className="admin-panel business-form">
        <h2>Google Maps</h2>
        <div className="admin-about-fields">
          <label className="is-full">
            Public URL *
            <input
              value={values.location.googleMapsUrl}
              onChange={(e) =>
                patch("location", { ...values.location, googleMapsUrl: e.target.value })
              }
            />
          </label>
          <label className="is-full">
            Embed URL *
            <input
              value={values.location.googleMapsEmbedUrl}
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
            href={values.location.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open Maps <ExternalLink />
          </a>
        </div>
        <iframe
          className="business-map-preview"
          src={extractGoogleMapsEmbedUrl(values.location.googleMapsEmbedUrl)}
          title="Map preview"
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </section>
      <section className="admin-panel business-form">
        <h2>Opening hours</h2>
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
      </section>
      <section className="admin-panel business-form">
        <h2>Social media</h2>
        <div className="admin-about-fields">
          {(["instagram", "facebook", "tiktok", "messenger", "whatsapp", "zalo"] as const).map(
            (key) => (
              <label key={key}>
                {key}
                <input
                  placeholder="https://"
                  value={values.socialLinks[key] ?? ""}
                  onChange={(e) =>
                    patch("socialLinks", { ...values.socialLinks, [key]: e.target.value })
                  }
                />
              </label>
            ),
          )}
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
