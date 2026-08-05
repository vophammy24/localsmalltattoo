import type { TattooStyle } from "../../tattooStyles/types/tattooStyle";

export type ArtistImage = { url: string; publicId: string; alt: string };
export type Artist = {
  _id: string;
  fullName: string;
  displayName?: string;
  slug: string;
  role: string;
  shortBio: string;
  biography: string;
  profileImage?: ArtistImage;
  coverImage?: ArtistImage;
  tattooStyleIds: Pick<TattooStyle, "_id" | "name" | "slug" | "displayOrder">[];
  yearsOfExperience?: number;
  socialLinks?: { instagram?: string; facebook?: string; tiktok?: string };
  isFeatured: boolean;
  isPublished: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ArtistFormValues = {
  fullName: string;
  displayName: string;
  slug: string;
  role: string;
  shortBio: string;
  biography: string;
  profileAlt: string;
  coverAlt: string;
  tattooStyleIds: string[];
  yearsOfExperience: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
};
