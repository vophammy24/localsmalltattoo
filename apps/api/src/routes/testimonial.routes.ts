import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import {
  createAdminReview,
  deleteAdminReview,
  getAdminReview,
  listAdminReviews,
  listPublicReviews,
  updateAdminReview,
} from "../controllers/testimonial.controller.js";
export const publicReviewRouter = Router();
publicReviewRouter.get("/", listPublicReviews);
export const adminReviewRouter = Router();
adminReviewRouter.use(requireAdmin);
adminReviewRouter.get("/", listAdminReviews);
adminReviewRouter.post("/", createAdminReview);
adminReviewRouter.get("/:id", getAdminReview);
adminReviewRouter.patch("/:id", updateAdminReview);
adminReviewRouter.delete("/:id", deleteAdminReview);
