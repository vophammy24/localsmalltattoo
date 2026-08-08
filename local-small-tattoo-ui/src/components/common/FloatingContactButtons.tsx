import { SiFacebook, SiInstagram, SiMessenger, SiWhatsapp, SiZalo } from "react-icons/si";
import type { IconType } from "react-icons";
import { useBusinessSettings } from "../../features/businessSettings/BusinessSettingsContext";

type ContactLink = {
  key: string;
  label: string;
  url?: string;
  icon: IconType;
};

export function FloatingContactButtons() {
  const { settings } = useBusinessSettings();
  const socialLinks = settings?.socialLinks;
  const links: ContactLink[] = [
    { key: "messenger", label: "Messenger", url: socialLinks?.messenger, icon: SiMessenger },
    { key: "facebook", label: "Facebook", url: socialLinks?.facebook, icon: SiFacebook },
    { key: "instagram", label: "Instagram", url: socialLinks?.instagram, icon: SiInstagram },
    { key: "whatsapp", label: "WhatsApp", url: socialLinks?.whatsapp, icon: SiWhatsapp },
    { key: "zalo", label: "Zalo", url: socialLinks?.zalo, icon: SiZalo },
  ].filter((link) => Boolean(link.url));

  if (!links.length) return null;

  return (
    <nav className="floating-contacts" aria-label="Contact us">
      {links.map(({ key, label, url, icon: Icon }) => (
        <a
          className={`floating-contacts__link floating-contacts__link--${key}`}
          href={url}
          key={key}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${label}`}
          title={label}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
