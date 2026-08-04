import type { RequestHandler } from "express";
import { TattooStyleModel } from "../models/tattoo-style.model.js";
import {
  addGalleryImages,
  createTattooStyle,
  removeGalleryImage,
  updateTattooStyle,
} from "../services/tattoo-style.service.js";
import { HttpError } from "../utils/http-error.js";
import {
  adminStyleQuerySchema,
  galleryMetadataSchema,
  reorderGallerySchema,
  reorderStylesSchema,
  tattooStyleFieldsSchema,
} from "../validators/tattoo-style.validator.js";

export const listPublicStyles: RequestHandler = async (request, response, next) => {
  try {
    const filter: Record<string, unknown> = { isPublished: true, status: "PUBLISHED" };
    if (request.query.featured === "true") filter.isFeatured = true;
    const styles = await TattooStyleModel.find(filter).sort({ displayOrder: 1, name: 1 }).lean();
    response.json({ success: true, data: { items: styles } });
  } catch (error) {
    next(error);
  }
};

export const getPublicStyle: RequestHandler = async (request, response, next) => {
  try {
    const style = await TattooStyleModel.findOne({
      slug: request.params.slug,
      isPublished: true,
      status: "PUBLISHED",
    }).lean();
    if (!style) throw new HttpError(404, "Tattoo style not found.");
    response.json({ success: true, data: { style } });
  } catch (error) {
    next(error);
  }
};

export const listAdminStyles: RequestHandler = async (request, response, next) => {
  try {
    const query = adminStyleQuerySchema.parse(request.query);
    const filter: Record<string, unknown> = {};
    if (query.search)
      filter.name = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (query.publication === "published") filter.isPublished = true;
    if (query.publication === "draft") {
      filter.isPublished = false;
      filter.status = { $ne: "ARCHIVED" };
    }
    if (query.publication === "archived") filter.status = "ARCHIVED";
    const items = await TattooStyleModel.find(filter).sort({ displayOrder: 1, name: 1 }).lean();
    response.json({ success: true, data: { items } });
  } catch (error) {
    next(error);
  }
};

export const getAdminStyle: RequestHandler = async (request, response, next) => {
  try {
    const style = await TattooStyleModel.findById(request.params.id).lean();
    if (!style) throw new HttpError(404, "Tattoo style not found.");
    response.json({ success: true, data: { style } });
  } catch (error) {
    next(error);
  }
};
export const createAdminStyle: RequestHandler = async (request, response, next) => {
  try {
    const fields = tattooStyleFieldsSchema.parse(request.body);
    const style = await createTattooStyle(fields, request.file);
    response.status(201).json({ success: true, data: { style } });
  } catch (error) {
    next(error);
  }
};
export const updateAdminStyle: RequestHandler = async (request, response, next) => {
  try {
    const fields = tattooStyleFieldsSchema.parse(request.body);
    const style = await updateTattooStyle(String(request.params.id), fields, request.file);
    response.json({ success: true, data: { style } });
  } catch (error) {
    next(error);
  }
};
export const archiveAdminStyle: RequestHandler = async (request, response, next) => {
  try {
    const style = await TattooStyleModel.findByIdAndUpdate(
      request.params.id,
      { isPublished: false, status: "ARCHIVED", archivedAt: new Date() },
      { new: true },
    );
    if (!style) throw new HttpError(404, "Tattoo style not found.");
    response.json({ success: true, data: { style } });
  } catch (error) {
    next(error);
  }
};
export const reorderAdminStyles: RequestHandler = async (request, response, next) => {
  try {
    const { items } = reorderStylesSchema.parse(request.body);
    await TattooStyleModel.bulkWrite(
      items.map((item) => ({
        updateOne: { filter: { _id: item.id }, update: { displayOrder: item.displayOrder } },
      })),
    );
    response.json({ success: true, data: { updated: items.length } });
  } catch (error) {
    next(error);
  }
};
export const addAdminGalleryImages: RequestHandler = async (request, response, next) => {
  try {
    const { alts } = galleryMetadataSchema.parse(request.body);
    const style = await addGalleryImages(
      String(request.params.id),
      (request.files as Express.Multer.File[]) ?? [],
      alts,
    );
    response.status(201).json({ success: true, data: { style } });
  } catch (error) {
    next(error);
  }
};
export const deleteAdminGalleryImage: RequestHandler = async (request, response, next) => {
  try {
    const style = await removeGalleryImage(
      String(request.params.id),
      String(request.params.imageId),
    );
    response.json({ success: true, data: { style } });
  } catch (error) {
    next(error);
  }
};
export const reorderAdminGalleryImages: RequestHandler = async (request, response, next) => {
  try {
    const { items } = reorderGallerySchema.parse(request.body);
    const style = await TattooStyleModel.findById(request.params.id);
    if (!style) throw new HttpError(404, "Tattoo style not found.");
    for (const item of items) {
      const image = style.galleryImages.id(item.imageId);
      if (image) image.displayOrder = item.displayOrder;
    }
    style.galleryImages.sort((a, b) => a.displayOrder - b.displayOrder);
    await style.save();
    response.json({ success: true, data: { style } });
  } catch (error) {
    next(error);
  }
};
