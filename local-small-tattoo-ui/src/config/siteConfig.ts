// Values copied from the existing API defaults. Empty values need operator input.
export const SITE_CONFIG = {
  businessName: "Local Small Tattoo",
  siteUrl: "https://localsmalltattoo.com",
  timezone: "Asia/Ho_Chi_Minh",
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
    whatsapp: "https://wa.me/+84946752336" },
  links: {
    booking: "/booking",
    contact: "/contact",
    googleMaps: "https://maps.app.goo.gl/Dz19zWHKMq88qs9FA",
    googleReviews: "https://maps.app.goo.gl/Dz19zWHKMq88qs9FA",
    writeGoogleReview: "https://maps.app.goo.gl/Dz19zWHKMq88qs9FA",
  },
} as const;
