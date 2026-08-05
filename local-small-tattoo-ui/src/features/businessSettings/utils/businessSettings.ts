import type { BusinessSettings } from "../types/businessSettings";

export function formatBusinessAddress(address: BusinessSettings["address"]) {
  return [
    address.addressLine,
    address.ward,
    address.district,
    address.city,
    address.country,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export function createPhoneHref(phoneNumber: string) {
  return `tel:${phoneNumber.replace(/[^+\d]/g, "")}`;
}

export function getBusinessSocialLinks(settings?: BusinessSettings) {
  if (!settings) return [];
  return Object.entries(settings.socialLinks)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([name, url]) => ({ name, url }));
}
