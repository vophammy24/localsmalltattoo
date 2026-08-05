import type { Artist } from "../../artists/types/artist";
import type { TattooStyle } from "../../tattooStyles/types/tattooStyle";

export type GalleryType = "TATTOO_WORK" | "CUSTOMER_PHOTO" | "STUDIO_PHOTO";

export interface GalleryItem {
  _id: string;
  title?: string;
  caption?: string;
  image: { url: string; publicId: string; width?: number; height?: number; alt: string };
  type: GalleryType;
  artistId?: Pick<Artist, "_id" | "fullName" | "displayName" | "slug">;
  tattooStyleIds: Pick<TattooStyle, "_id" | "name" | "slug">[];
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
  photographedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryPageData {
  items: GalleryItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface GalleryFormValues {
  title: string;
  caption: string;
  alt: string;
  type: GalleryType;
  artistId: string;
  tattooStyleIds: string[];
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
  photographedAt: string;
}

export interface GalleryMediaItem {
  image: { url: string; publicId: string; alt: string };
  sourceCollection: "TattooStyle" | "Artist";
  sourceId: string;
  sourceLabel: string;
  artistId?: string;
  tattooStyleIds?: string[];
  alreadyLinked: boolean;
}
