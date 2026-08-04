import type { GalleryImage, Review } from "../types/content";

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
