import { adminRequest } from "../../admin/adminApi";
import type {
  AdminReviewResult,
  AdminTestimonial,
  ReviewResult,
  TestimonialValues,
} from "../types/testimonial";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export async function getPublicReviews(page = 1, signal?: AbortSignal): Promise<ReviewResult> {
  const response = await fetch(`${API_URL}/api/public/reviews?limit=12&page=${page}`, {
    signal,
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok || !result.data)
    throw new Error(result.message ?? "Unable to load testimonials.");
  return result.data;
}
export const getAdminReviews = (query: string) =>
  adminRequest<AdminReviewResult>(`/reviews?${query}`);
export const saveTestimonial = (values: TestimonialValues, id?: string) =>
  adminRequest<{ item: AdminTestimonial }>(id ? `/reviews/${id}` : "/reviews", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(values),
  });
export const updateTestimonial = (id: string, values: Partial<TestimonialValues>) =>
  adminRequest<{ item: AdminTestimonial }>(`/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
export const deleteTestimonial = (id: string) =>
  adminRequest<{ deleted: boolean }>(`/reviews/${id}`, { method: "DELETE" });
