import { Link } from "react-router";
import { GoogleMapEmbed } from "../features/businessSettings/components/GoogleMapEmbed";
import { OpeningHours } from "../features/businessSettings/components/OpeningHours";
import { useBusinessSettings } from "../features/businessSettings/BusinessSettingsContext";
import { PageHero } from "../components/common/PageHero";
import {
  createPhoneHref,
  formatBusinessAddress,
  getBusinessSocialLinks,
} from "../features/businessSettings/utils/businessSettings";
import { Seo } from "../components/seo/Seo";
export function ContactPage() {
  const { settings, isLoading } = useBusinessSettings();
  const seo = (
    <Seo
      title="Contact Local Small Tattoo | Da Nang"
      description="Contact Local Small Tattoo in Da Nang for studio directions, opening hours, tattoo questions and appointment requests."
      path="/contact"
    />
  );
  if (isLoading)
    return (
      <>
        {seo}
        <main className="contact-state page-shell">Loading contact information...</main>
      </>
    );
  if (!settings)
    return (
      <>
        {seo}
        <main className="contact-state page-shell">
          Contact information is temporarily unavailable.
        </main>
      </>
    );
  const address = formatBusinessAddress(settings.address);
  const socials = getBusinessSocialLinks(settings);
  return (
    <main className="contact-page">
      <Seo
        title="Contact Local Small Tattoo | Da Nang"
        description="Contact Local Small Tattoo in Da Nang for studio directions, opening hours, tattoo questions and appointment requests."
        path="/contact"
      />
      <PageHero
        className="contact-hero"
        title="Let's create something permanent"
        description="Visit the studio, ask a question, or begin your booking directly with our team."
      />
      <section className="contact-main page-shell">
        <div className="contact-details">
          <p>Visit or contact</p>
          <h2>{settings.businessName}</h2>
          <address>
            <a href={settings.location.googleMapsUrl} target="_blank" rel="noreferrer">
              {address}
            </a>
          </address>
          <a href={createPhoneHref(settings.contact.phoneNumber)}>{settings.contact.phoneNumber}</a>
          <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>
          <h3>Opening hours</h3>
          <OpeningHours hours={settings.openingHours} />
          <div className="contact-socials">
            {socials.map(({ name, url }) => (
              <a key={name} href={url} target="_blank" rel="noreferrer">
                {name}
              </a>
            ))}
          </div>
          <div className="contact-actions">
            <a className="button" href={createPhoneHref(settings.contact.phoneNumber)}>
              Call now
            </a>
            <a
              className="button button--secondary"
              href={settings.location.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
            <Link className="button button--secondary" to="/booking">
              Book An Appointment
            </Link>
          </div>
        </div>
        <div className="contact-map-wrap">
          <GoogleMapEmbed
            url={settings.location.googleMapsEmbedUrl}
            title={settings.businessName}
          />
        </div>
      </section>
    </main>
  );
}
