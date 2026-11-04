import { SITE_CONFIG } from "../../config/siteConfig";
import { BrandLogo } from "../common/BrandLogo";
import { Link } from "react-router";
import { navigationItems } from "../../data/navigation";
import { useBusinessSettings } from "../../features/businessSettings/BusinessSettingsContext";
import { summarizeHours } from "../../features/businessSettings/components/OpeningHours";
import {
  createPhoneHref,
  formatBusinessAddress,
} from "../../features/businessSettings/utils/businessSettings";
import { useTattooStyles } from "../../features/tattooStyles/hooks/useTattooStyles";

export function Footer() {
  const { settings } = useBusinessSettings();
  const { data: styles } = useTattooStyles();
  const name = SITE_CONFIG.businessName;
  return (
    <footer className="site-footer">
      <div className="site-footer__main page-shell">
        <section className="site-footer__brand-column">
          <Link className="site-footer__brand" to="/">
            <BrandLogo />
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
            <a href={SITE_CONFIG.links.googleMaps} target="_blank" rel="noreferrer">
              {formatBusinessAddress(SITE_CONFIG.address)}
            </a>
          </address>
          <a href={createPhoneHref(SITE_CONFIG.contact.phone)}>{SITE_CONFIG.contact.phone}</a>
          <a href={`mailto:${SITE_CONFIG.contact.email}`}>{SITE_CONFIG.contact.email}</a>
          <p>{summarizeHours(SITE_CONFIG.openingHours)}</p>
        </section>
      </div>

      <div className="site-footer__bottom page-shell">
        <p>
          © {new Date().getFullYear()} {name}
        </p>
        <div>
          <Link to="/#privacy">Privacy</Link>
          <Link to="/#terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
