export type TattooStyleImage = {
  _id?: string;
  url: string;
  publicId: string;
  alt: string;
  displayOrder?: number;
};

export type TattooStyle = {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage?: TattooStyleImage;
  galleryImages: TattooStyleImage[];
  isFeatured: boolean;
  isPublished: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type TattooStyleFormValues = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverAlt: string;
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
};
