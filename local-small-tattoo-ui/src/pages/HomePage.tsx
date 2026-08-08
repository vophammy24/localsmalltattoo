import { FounderSection } from "../features/home/FounderSection";
import { CustomerGallerySection } from "../features/home/CustomerGallerySection";
import { HeroSection } from "../features/home/HeroSection";
import { LocationReviewSection } from "../features/home/LocationReviewSection";
import { MarqueeTicker } from "../features/home/MarqueeTicker";
import { TattooStylesSection } from "../features/home/TattooStylesSection";
import { FeaturedGallerySection } from "../features/home/FeaturedGallerySection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeTicker />
      <TattooStylesSection />
      <FounderSection />
      <LocationReviewSection />
      <FeaturedGallerySection />
      <CustomerGallerySection />
    </>
  );
}
