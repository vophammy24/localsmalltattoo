import type { Artist } from "../../artists/types/artist";
import type { GalleryItem } from "../../gallery/types/gallery";

export interface AboutContent {
  version: number;
  isPublished?: boolean;
  hero: {
    isVisible: boolean;
    heading: string;
    description: string;
    imageId?: string;
    image?: GalleryItem;
    primaryCtaLabel: string;
    primaryCtaUrl: string;
  };
  story: {
    isVisible: boolean;
    label: string;
    heading: string;
    paragraphs: string[];
    primaryImageId?: string;
    secondaryImageId?: string;
    primaryImage?: GalleryItem;
    secondaryImage?: GalleryItem;
  };
  mission: {
    isVisible: boolean;
    heading: string;
    description: string;
    values: { title: string; description: string; displayOrder: number }[];
    imageId?: string;
    image?: GalleryItem;
  };
  studioSpace: {
    isVisible: boolean;
    heading: string;
    description: string;
    galleryItemIds: string[];
    images?: GalleryItem[];
  };
  artistSection: {
    isVisible: boolean;
    heading: string;
    description: string;
    artistIds: string[];
    artists?: Artist[];
  };
  finalCta: {
    isVisible: boolean;
    heading: string;
    description: string;
    buttonLabel: string;
    buttonUrl: string;
    imageId?: string;
    image?: GalleryItem;
  };
  updatedAt?: string;
  publishedAt?: string;
}
