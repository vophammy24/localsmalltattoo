export const BUSINESS_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;
export type BusinessSettings = {
  businessName: string;
  shortName: string;
  description: string;
  logo?: { url: string; publicId: string; alt: string };
  logoAlt?: string;
  contact: { phoneNumber: string; secondaryPhoneNumber: string; email: string };
  address: {
    addressLine: string;
    ward: string;
    district: string;
    city: string;
    country: string;
    postalCode: string;
  };
  location: {
    latitude?: number;
    longitude?: number;
    googleMapsUrl: string;
    googleMapsEmbedUrl: string;
  };
  openingHours: {
    day: (typeof BUSINESS_DAYS)[number];
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }[];
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
    messenger: string;
    whatsapp: string;
    zalo: string;
  };
  bookingNotice: string;
};
