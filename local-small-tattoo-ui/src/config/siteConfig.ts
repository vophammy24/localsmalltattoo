// Values copied from the existing API defaults. Empty values need operator input.
export const SITE_CONFIG = {
  businessName: "Local Small Tattoo",
  siteUrl: "https://localsmalltattoo.com.vn",
  timezone: "Asia/Ho_Chi_Minh",
  // Copied from apps/api/src/controllers/business-settings.controller.ts DEFAULT_SETTINGS.
  address: {
    addressLine: "52-54 Tran Thanh Mai",
    ward: "An Hai",
    district: "Son Tra",
    city: "Da Nang",
    country: "Vietnam",
    postalCode: "",
  },
  openingHours: (
    ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const
  ).map((day) => ({
    day,
    isOpen: true,
    openTime: "10:00",
    closeTime: "20:00",
  })),
  contact: {
    phone: "+84 946 752 336",
    secondaryPhone: "",
    email: "localsmalltattoo.dn@gmail.com",
  },
  social: {
    instagram: "https://www.instagram.com/localsmalltattoo.danang",
    facebook: "https://www.facebook.com/localsmall.tattoo",
    tiktok: "https://www.tiktok.com/@localsmall.danang",
    zalo: "https://zalo.me/+84946752336",
    messenger: "https://m.me/localsmall.tattoo",
    whatsapp: "https://wa.me/+84946752336",
  },
  links: {
    googleMapsEmbed:
      "https://www.google.com/maps?q=52-54+Tran+Thanh+Mai+Da+Nang+Vietnam&output=embed",
    booking: "/booking",
    contact: "/contact",
    googleMaps: "https://maps.app.goo.gl/Dz19zWHKMq88qs9FA",
    googleReviews: "https://maps.app.goo.gl/Dz19zWHKMq88qs9FA",
    writeGoogleReview: "https://maps.app.goo.gl/Dz19zWHKMq88qs9FA",
  },
} as const;
