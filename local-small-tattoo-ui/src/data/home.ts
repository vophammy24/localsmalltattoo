import type { GalleryImage, Review } from "../types/content";

export const googleReviews: Review[] = [
  {
    id: "review-03",
    author: "Niamh Cullen",
    rating: 5,
    text: "I went to this tattoo studio in Da Nang. It was a small tattoo studio. The tattoo artist Thuan was very nice and thorough. Myself and my friend got a small tattoo. We paid 400,000 dong each for the tattoo which €16. I would highly recommend coming to this tattoo studio. 10/10 experience.",
    relativeDate: "4 weeks ago",
  },
  {
    id: "review-01",
    author: "Greg Harriss",
    rating: 5,
    text: "Amazing work - so professional, clean & friendly - came with a rough picture and some ideas but so happy with the personal design and extra work ….. highly recommend to anyone travelling to Da Nang !",
    relativeDate: "3 days ago",
  },
  {
    id: "review-02",
    author: "Phúc Nguyễn",
    rating: 5,
    text: "I'm very satisfied with my experience here. The staff are extremely friendly and enthusiastic, and their advice was very thoughtful, so I felt at ease right from the start. The prices are reasonable and commensurate with the quality. The space is clean, and the work is done carefully and professionally. The tattoo turned out beautifully, exactly as expected.",
    relativeDate: "4 days ago",
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
    alt: "Founder with a customer in the studio",
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
