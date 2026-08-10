import { adminAction, adminRequest } from "../../admin/adminApi";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export type GoogleReview = {
  _id: string;
  reviewer: { displayName?: string; profilePhotoUrl?: string };
  starRating: number;
  comment: string;
  reviewCreatedAt?: string;
  resourceName?: string;
  moderation: { isPublic: boolean; isFeatured: boolean; displayOrder: number; adminNote?: string };
};
export type ReviewSummary = { averageRating: number; totalReviewCount: number } | null;
export const getPublicGoogleReviews = async (featured = true) => {
  const response = await fetch(`${API_URL}/api/public/reviews?featured=${featured}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? "Unable to load Google reviews.");
  return result.data as {
    reviews: GoogleReview[];
    summary: ReviewSummary;
    lastSyncedAt: string | null;
  };
};
export const getGoogleBusinessStatus = () =>
  adminRequest<{
    configured: boolean;
    connection: {
      accountName: string;
      locationName: string;
      lastSyncedAt?: string;
      reviewSummary?: ReviewSummary;
    } | null;
  }>("/google-business/status");
export const getAdminGoogleReviews = () =>
  adminRequest<{ reviews: GoogleReview[] }>("/google-reviews");
export const syncGoogleReviews = () =>
  adminRequest<{ created: number; updated: number; fetched: number }>("/google-reviews/sync", {
    method: "POST",
  });
export const saveGoogleReviewModeration = (
  id: string,
  moderation: Partial<GoogleReview["moderation"]>,
) =>
  adminRequest<{ review: GoogleReview }>(`/google-reviews/${id}/moderation`, {
    method: "PATCH",
    body: JSON.stringify(moderation),
  });
export const disconnectGoogleBusiness = () =>
  adminAction("/google-business/disconnect", { method: "POST" });
export const googleBusinessConnectUrl = `${API_URL}/api/admin/google-business/connect`;
