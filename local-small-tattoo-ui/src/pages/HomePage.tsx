import { SITE_CONFIG } from "../config/siteConfig";
import { FounderSection } from "../features/home/FounderSection";
import { CustomerGallerySection } from "../features/home/CustomerGallerySection";
import { HeroSection } from "../features/home/HeroSection";
import { LocationReviewSection } from "../features/home/LocationReviewSection";
import { MarqueeTicker } from "../features/home/MarqueeTicker";
import { TattooStylesSection } from "../features/home/TattooStylesSection";
import { FeaturedGallerySection } from "../features/home/FeaturedGallerySection";
import { TestimonialsSection } from "../features/reviews/components/TestimonialsSection";
import { Seo, SITE_URL } from "../components/seo/Seo";
import { useBusinessSettings } from "../features/businessSettings/BusinessSettingsContext";

import { HomeSharedBackground } from "../features/home/HomeSharedBackground";

export function HomePage() {
  const { settings } = useBusinessSettings();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: SITE_CONFIG.businessName,
    description: settings?.description ?? "A private tattoo studio in Da Nang.",
    url: SITE_URL,
    telephone: SITE_CONFIG.contact.phone,
    email: SITE_CONFIG.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.addressLine,
      addressLocality: SITE_CONFIG.address.city,
      postalCode: SITE_CONFIG.address.postalCode,
      addressCountry: "VN",
    },
    ...(settings?.location.latitude != null && settings.location.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: settings.location.latitude,
            longitude: settings.location.longitude,
          },
        }
      : {}),
    openingHoursSpecification: SITE_CONFIG.openingHours.map((item) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: item.day.charAt(0) + item.day.slice(1).toLowerCase(),
      opens: item.openTime,
      closes: item.closeTime,
    })),
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.tiktok,
    ].filter(Boolean),
  };
  return (
    <>
      <Seo
        title="Local Small Tattoo | Tattoo Studio in Da Nang"
        description="Discover custom fine line, blackwork and contemporary tattoo work at Local Small Tattoo, a professional tattoo studio in Da Nang."
        path="/"
        structuredData={structuredData}
      />
      <HomeSharedBackground>
        <HeroSection />
        <MarqueeTicker />
        <TattooStylesSection />
        <FounderSection />
        <LocationReviewSection />
        <TestimonialsSection />
      </HomeSharedBackground>
      <FeaturedGallerySection />
      <CustomerGallerySection />
    </>
  );
}
