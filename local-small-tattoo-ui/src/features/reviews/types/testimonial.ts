export type Testimonial = {
  _id: string;
  customerName: string;
  rating: number;
  content: string;
  reviewDate: string;
  sourceType: "DIRECT_CUSTOMER" | "CUSTOMER_AUTHORIZED";
  sourceUrl: string;
  isFeatured: boolean;
  displayOrder: number;
};
export type AdminTestimonial = Testimonial & {
  isPublic: boolean;
  publishFrom: string | null;
  publishUntil: string | null;
  permissionConfirmed: boolean;
  adminNote: string;
};
export type TestimonialValues = Omit<AdminTestimonial, "_id">;
export type ReviewResult<T = Testimonial> = {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
export type PublicReviewResult = ReviewResult & {
  summary: { averageRating: number | null; totalReviews: number };
};
export type AdminReviewResult = ReviewResult<AdminTestimonial> & {
  counts: { total: number; published: number; draft: number; scheduled: number; expired: number };
};
