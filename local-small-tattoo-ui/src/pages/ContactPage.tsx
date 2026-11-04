import { SITE_CONFIG } from "../config/siteConfig";
import { Link } from "react-router";
import { GoogleMapEmbed } from "../features/businessSettings/components/GoogleMapEmbed";
import { OpeningHours } from "../features/businessSettings/components/OpeningHours";
import { PageHero } from "../components/common/PageHero";
import {
  createPhoneHref,
  formatBusinessAddress,
  getBusinessSocialLinks,
} from "../features/businessSettings/utils/businessSettings";
import { Seo } from "../components/seo/Seo";
export function ContactPage() {
  const address = formatBusinessAddress(SITE_CONFIG.address);
  const socials = getBusinessSocialLinks();
  return (
    <div className="contact-page">
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
          <h2>{SITE_CONFIG.businessName}</h2>
          <address>
            <a href={SITE_CONFIG.links.googleMaps} target="_blank" rel="noreferrer">
              {address}
            </a>
          </address>
          <a href={createPhoneHref(SITE_CONFIG.contact.phone)}>{SITE_CONFIG.contact.phone}</a>
          <a href={`mailto:${SITE_CONFIG.contact.email}`}>{SITE_CONFIG.contact.email}</a>
          <h3>Opening hours</h3>
          <OpeningHours hours={SITE_CONFIG.openingHours} />
          <div className="contact-socials">
            {socials.map(({ name, url }) => (
              <a key={name} href={url} target="_blank" rel="noreferrer">
                {name}
              </a>
            ))}
          </div>
          <div className="contact-actions">
            <a className="button" href={createPhoneHref(SITE_CONFIG.contact.phone)}>
              Call now
            </a>
            <a
              className="button button--secondary"
              href={SITE_CONFIG.links.googleMaps}
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
            <Link className="button button--secondary" to={SITE_CONFIG.links.booking}>
              Book An Appointment
            </Link>
          </div>
        </div>
        <div className="contact-map-wrap">
          <GoogleMapEmbed
            url={SITE_CONFIG.links.googleMapsEmbed}
            title={SITE_CONFIG.businessName}
          />
        </div>
      </section>
    </div>
  );
}
