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

export function HomePage() {
  const { settings } = useBusinessSettings();
  const structuredData = settings
    ? {
        "@context": "https://schema.org",
        "@type": "TattooParlor",
        name: SITE_CONFIG.businessName,
        description: settings.description,
        url: SITE_URL,
        telephone: SITE_CONFIG.contact.phone,
        email: SITE_CONFIG.contact.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address.addressLine,
          addressLocality: settings.address.city,
          postalCode: settings.address.postalCode,
          addressCountry: "VN",
        },
        ...(settings.location.latitude != null && settings.location.longitude != null
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: settings.location.latitude,
                longitude: settings.location.longitude,
              },
            }
          : {}),
        sameAs: [
          SITE_CONFIG.social.instagram,
          SITE_CONFIG.social.facebook,
          SITE_CONFIG.social.tiktok,
        ].filter(Boolean),
      }
    : undefined;
  return (
    <>
      <Seo
        title="Local Small Tattoo | Tattoo Studio in Da Nang"
        description="Discover custom fine line, blackwork and contemporary tattoo work at Local Small Tattoo, a professional tattoo studio in Da Nang."
        path="/"
        structuredData={structuredData}
      />
      <HeroSection />
      <MarqueeTicker />
      <TattooStylesSection />
      <FounderSection />
      <LocationReviewSection />
      <TestimonialsSection />
      <FeaturedGallerySection />
      <CustomerGallerySection />
    </>
  );
}
