import { Router } from "express";
import { login, logout, me } from "../controllers/auth.controller.js";
import {
  addNote,
  deleteNote,
  getBooking,
  listBookings,
  updateSchedule,
  updateStatus,
} from "../controllers/admin-booking.controller.js";
import { dashboardSummary } from "../controllers/dashboard.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import {
  addAdminGalleryImages,
  archiveAdminStyle,
  createAdminStyle,
  deleteAdminGalleryImage,
  getAdminStyle,
  listAdminStyles,
  reorderAdminGalleryImages,
  reorderAdminStyles,
  updateAdminStyle,
} from "../controllers/tattoo-style.controller.js";
import { styleImageUpload } from "../middlewares/upload.middleware.js";

export const adminRouter = Router();
adminRouter.post("/auth/login", login);
adminRouter.use(requireAdmin);
adminRouter.post("/auth/logout", logout);
adminRouter.get("/auth/me", me);
adminRouter.get("/dashboard/summary", dashboardSummary);
adminRouter.get("/bookings", listBookings);
adminRouter.get("/bookings/:bookingId", getBooking);
adminRouter.patch("/bookings/:bookingId/status", updateStatus);
adminRouter.patch("/bookings/:bookingId/schedule", updateSchedule);
adminRouter.post("/bookings/:bookingId/notes", addNote);
adminRouter.delete("/bookings/:bookingId/notes/:noteId", deleteNote);
adminRouter.get("/tattoo-styles", listAdminStyles);
adminRouter.post("/tattoo-styles", styleImageUpload.single("coverImage"), createAdminStyle);
adminRouter.patch("/tattoo-styles/reorder", reorderAdminStyles);
adminRouter.get("/tattoo-styles/:id", getAdminStyle);
adminRouter.patch("/tattoo-styles/:id", styleImageUpload.single("coverImage"), updateAdminStyle);
adminRouter.delete("/tattoo-styles/:id", archiveAdminStyle);
adminRouter.post(
  "/tattoo-styles/:id/images",
  styleImageUpload.array("galleryImages", 20),
  addAdminGalleryImages,
);
adminRouter.delete("/tattoo-styles/:id/images/:imageId", deleteAdminGalleryImage);
adminRouter.patch("/tattoo-styles/:id/images/reorder", reorderAdminGalleryImages);
