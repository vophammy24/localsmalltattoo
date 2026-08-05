import { Link } from "react-router";
import { navigationItems } from "../../data/navigation";
import { useBusinessSettings } from "../../features/businessSettings/BusinessSettingsContext";
import { summarizeHours } from "../../features/businessSettings/components/OpeningHours";
import {
  createPhoneHref,
  formatBusinessAddress,
  getBusinessSocialLinks,
} from "../../features/businessSettings/utils/businessSettings";
import { useTattooStyles } from "../../features/tattooStyles/hooks/useTattooStyles";

export function Footer() {
  const { settings } = useBusinessSettings();
  const { data: styles } = useTattooStyles();
  const name = settings?.businessName ?? "Local Small Tattoo";
  const socialLinks = getBusinessSocialLinks(settings);
  return (
    <footer className="site-footer">
      <div className="site-footer__main page-shell">
        <section className="site-footer__brand-column">
          <Link className="site-footer__brand" to="/">
            {name}
          </Link>
          <p>
            {settings?.description ??
              "A private tattoo studio focused on precise work and personal stories."}
          </p>
        </section>

        <section className="site-footer__column">
          <h2>Navigation</h2>
          <ul>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link to={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="site-footer__column">
          <h2>Styles</h2>
          <ul>
            {styles.map((style) => (
              <li key={style._id}>
                <Link to={`/styles#${style.slug}`}>{style.name}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="site-footer__column site-footer__contact">
          <h2>Contact</h2>
          <address>
            {settings ? (
              <a href={settings.location.googleMapsUrl} target="_blank" rel="noreferrer">
                {formatBusinessAddress(settings.address)}
              </a>
            ) : null}
          </address>
          <a href={createPhoneHref(settings?.contact.phoneNumber ?? "")}>
            {settings?.contact.phoneNumber}
          </a>
          <a href={`mailto:${settings?.contact.email ?? ""}`}>{settings?.contact.email}</a>
          <p>{settings ? summarizeHours(settings.openingHours) : ""}</p>
        </section>
      </div>

      <div className="site-footer__bottom page-shell">
        <p>
          © {new Date().getFullYear()} {name}
        </p>
        <div>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          {socialLinks.map(({ name: socialName, url }) => (
            <a href={url} key={socialName} target="_blank" rel="noreferrer">
              {socialName}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
