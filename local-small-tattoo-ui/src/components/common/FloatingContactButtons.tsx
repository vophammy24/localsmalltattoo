import { Camera, MessageCircle, Send } from "lucide-react";
import { useBusinessSettings } from "../../features/businessSettings/BusinessSettingsContext";

type ContactLink = {
  key: string;
  label: string;
  url?: string;
  icon: typeof MessageCircle;
};

export function FloatingContactButtons() {
  const { settings } = useBusinessSettings();
  const socialLinks = settings?.socialLinks;
  const links: ContactLink[] = [
    {
      key: "messenger",
      label: "Messenger",
      url: socialLinks?.messenger || socialLinks?.facebook,
      icon: MessageCircle,
    },
    { key: "instagram", label: "Instagram", url: socialLinks?.instagram, icon: Camera },
    { key: "whatsapp", label: "WhatsApp", url: socialLinks?.whatsapp, icon: MessageCircle },
    { key: "zalo", label: "Zalo", url: socialLinks?.zalo, icon: Send },
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
