import { SITE_CONFIG } from "../config/siteConfig";
import type { NavItem } from "../types/content";

export const navigationItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Booking", href: SITE_CONFIG.links.booking },
  { label: "Styles", href: "/styles" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: SITE_CONFIG.links.contact },
];
