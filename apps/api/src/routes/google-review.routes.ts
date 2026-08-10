import { Router } from "express";
import {
  connectGoogleBusiness,
  disconnectGoogleBusiness,
  googleBusinessCallback,
  googleBusinessStatus,
  listAdminGoogleReviews,
  listPublicGoogleReviews,
  moderateGoogleReview,
  syncReviews,
} from "../controllers/google-review.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
export const googleReviewAdminRouter = Router();
googleReviewAdminRouter.get("/google-business/connect", requireAdmin, connectGoogleBusiness);
googleReviewAdminRouter.get("/google-business/callback", requireAdmin, googleBusinessCallback);
googleReviewAdminRouter.get("/google-business/status", requireAdmin, googleBusinessStatus);
googleReviewAdminRouter.post("/google-business/disconnect", requireAdmin, disconnectGoogleBusiness);
googleReviewAdminRouter.post("/google-reviews/sync", requireAdmin, syncReviews);
googleReviewAdminRouter.get("/google-reviews", requireAdmin, listAdminGoogleReviews);
googleReviewAdminRouter.patch("/google-reviews/:id/moderation", requireAdmin, moderateGoogleReview);
export const publicGoogleReviewRouter = Router();
publicGoogleReviewRouter.get("/", listPublicGoogleReviews);
