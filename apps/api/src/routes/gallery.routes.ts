import { Router } from "express";
import { getPublicGalleryItem, listPublicGallery } from "../controllers/gallery.controller.js";

export const publicGalleryRouter = Router();
publicGalleryRouter.get("/", listPublicGallery);
publicGalleryRouter.get("/:galleryItemId", getPublicGalleryItem);
