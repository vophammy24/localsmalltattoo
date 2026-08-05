import { ArtistSection } from "../features/home/ArtistSection";
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
      <ArtistSection />
      <LocationReviewSection />
      <FeaturedGallerySection />
      <CustomerGallerySection />
    </>
  );
}
