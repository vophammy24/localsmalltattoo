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
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3833.8047207592995!2d108.240459!3d16.0756202!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142177a8ed5b05f%3A0xae2354111d3c055!2sLocal%20Small%20Tattoo!5e0!3m2!1sen!2s!4v1793761655261!5m2!1sen!2s",
    booking: "/booking",
    contact: "/contact",
    googleMaps: "https://maps.app.goo.gl/Dz19zWHKMq88qs9FA",
    googleReviews: "https://maps.app.goo.gl/Dz19zWHKMq88qs9FA",
    writeGoogleReview: "https://maps.app.goo.gl/Dz19zWHKMq88qs9FA",
  },
} as const;
