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
import {
  bulkAdminGallery,
  createAdminGalleryBulk,
  createAdminGalleryItem,
  deleteAdminGalleryItem,
  featureAdminGalleryItem,
  getAdminGalleryItem,
  listAdminGallery,
  publishAdminGalleryItem,
  reorderAdminGallery,
  updateAdminGalleryItem,
  getAdminGalleryMediaLibrary,
  linkAdminGalleryMedia,
} from "../controllers/gallery.controller.js";
import {
  archiveAdminArtist,
  createAdminArtist,
  getAdminArtist,
  listAdminArtists,
  publishAdminArtist,
  reorderAdminArtists,
  updateAdminArtist,
} from "../controllers/artist.controller.js";
import {
  getAdminAbout,
  publishAdminAbout,
  updateAdminAbout,
} from "../controllers/about.controller.js";
import {
  deleteAdminBusinessLogo,
  getAdminBusinessSettings,
  updateAdminBusinessLogo,
  updateAdminBusinessSettings,
} from "../controllers/business-settings.controller.js";

export const adminRouter = Router();
adminRouter.post("/auth/login", login);
adminRouter.get("/auth/me", me);
adminRouter.use(requireAdmin);
adminRouter.post("/auth/logout", logout);
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
adminRouter.get("/artists", listAdminArtists);
adminRouter.post(
  "/artists",
  styleImageUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  createAdminArtist,
);
adminRouter.patch("/artists/reorder", reorderAdminArtists);
adminRouter.get("/artists/:artistId", getAdminArtist);
adminRouter.patch(
  "/artists/:artistId",
  styleImageUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateAdminArtist,
);
adminRouter.patch("/artists/:artistId/publish", publishAdminArtist);
adminRouter.delete("/artists/:artistId", archiveAdminArtist);
adminRouter.get("/gallery", listAdminGallery);
adminRouter.get("/gallery/media-library", getAdminGalleryMediaLibrary);
adminRouter.post("/gallery/link-media", linkAdminGalleryMedia);
adminRouter.post("/gallery", styleImageUpload.single("image"), createAdminGalleryItem);
adminRouter.post(
  "/gallery/bulk-upload",
  styleImageUpload.array("images", 20),
  createAdminGalleryBulk,
);
adminRouter.patch("/gallery/bulk", bulkAdminGallery);
adminRouter.patch("/gallery/reorder", reorderAdminGallery);
adminRouter.get("/gallery/:galleryItemId", getAdminGalleryItem);
adminRouter.patch("/gallery/:galleryItemId", updateAdminGalleryItem);
adminRouter.delete("/gallery/:galleryItemId", deleteAdminGalleryItem);
adminRouter.patch("/gallery/:galleryItemId/publish", publishAdminGalleryItem);
adminRouter.patch("/gallery/:galleryItemId/featured", featureAdminGalleryItem);
adminRouter.get("/pages/about", getAdminAbout);
adminRouter.patch("/pages/about", updateAdminAbout);
adminRouter.patch("/pages/about/publish", publishAdminAbout);
adminRouter.get("/business-settings", getAdminBusinessSettings);
adminRouter.patch("/business-settings", updateAdminBusinessSettings);
adminRouter.patch(
  "/business-settings/logo",
  styleImageUpload.single("logo"),
  updateAdminBusinessLogo,
);
adminRouter.delete("/business-settings/logo", deleteAdminBusinessLogo);
