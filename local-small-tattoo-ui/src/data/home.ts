import type { GalleryImage, Review, TattooStyle } from "../types/content";

export const tattooStyles: TattooStyle[] = [
  {
    id: "style-01",
    index: "01.",
    name: "Fineline",
    slug: "fineline",
    image: "/images/style-fineline.svg",
    description: "Delicate linework, restrained detail, and elegant composition.",
  },
  {
    id: "style-02",
    index: "02.",
    name: "Ornamental",
    slug: "ornamental",
    image: "/images/style-ornamental.svg",
    description: "Decorative structures inspired by symmetry, pattern, and architecture.",
  },
  {
    id: "style-03",
    index: "03.",
    name: "Blackwork",
    slug: "blackwork",
    image: "/images/style-blackwork.svg",
    description: "Strong black forms, contrast, negative space, and graphic rhythm.",
  },
  {
    id: "style-04",
    index: "04.",
    name: "Old School",
    slug: "old-school",
    image: "/images/style-old-school.svg",
    description: "Bold outlines and classic American tattoo symbolism.",
  },
  {
    id: "style-05",
    index: "05.",
    name: "Japanese",
    slug: "japanese",
    image: "/images/style-japanese.svg",
    description: "Traditional motifs arranged through movement and visual storytelling.",
  },
  {
    id: "style-06",
    index: "06.",
    name: "Realism",
    slug: "realism",
    image: "/images/style-realism.svg",
    description: "Detailed shading and lifelike subjects rendered with precision.",
  },
];

export const googleReviews: Review[] = [
  {
    id: "review-01",
    author: "Linh Nguyen",
    rating: 5,
    text: "The studio was calm, clean, and professional. Every detail was explained clearly.",
    relativeDate: "2 weeks ago",
  },
  {
    id: "review-02",
    author: "Minh Tran",
    rating: 5,
    text: "Thoughtful consultation and beautiful fine-line work. The result feels completely personal.",
    relativeDate: "1 month ago",
  },
  {
    id: "review-03",
    author: "Anna Lee",
    rating: 5,
    text: "A welcoming experience from the first message through aftercare guidance.",
    relativeDate: "2 months ago",
  },
];

export const customerGallery: GalleryImage[] = [
  {
    id: "customer-01",
    src: "/images/customer-1.JPG",
    alt: "Customer portrait after a tattoo session",
    size: "portrait",
  },
  {
    id: "customer-02",
    src: "/images/customer-2.JPG",
    alt: "Customer showing minimalist tattoo artwork",
    size: "square",
  },
  {
    id: "customer-03",
    src: "/images/customer-3.JPG",
    alt: "Tattoo artist with a customer in the studio",
    size: "landscape",
  },
  {
    id: "customer-04",
    src: "/images/customer-4.HEIC",
    alt: "Customer moment inside the tattoo studio",
    size: "square",
  },
  {
    id: "customer-05",
    src: "/images/customer-05.svg",
    alt: "Finished tattoo and customer photo",
    size: "portrait",
  },
  {
    id: "customer-06",
    src: "/images/customer-06.svg",
    alt: "Customer celebrating a completed tattoo session",
    size: "landscape",
  },
];
