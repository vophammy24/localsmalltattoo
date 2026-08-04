import mongoose from "mongoose";
import { TattooStyleModel } from "../models/tattoo-style.model.js";
import { HttpError } from "../utils/http-error.js";
import type { TattooStyleFields } from "../validators/tattoo-style.validator.js";
import { deleteCloudinaryImages, uploadTattooStyleImage } from "./image.service.js";

function ensurePublishable(isPublished: boolean, coverImage?: { url?: string | null } | null) {
  if (isPublished && !coverImage?.url) {
    throw new HttpError(400, "A cover image is required before publishing.");
  }
}

export async function createTattooStyle(fields: TattooStyleFields, cover?: Express.Multer.File) {
  let uploadedCover: { url: string; publicId: string } | undefined;
  try {
    if (cover) uploadedCover = await uploadTattooStyleImage(cover, fields.slug);
    ensurePublishable(fields.isPublished, uploadedCover);
    return await TattooStyleModel.create({
      ...fields,
      status: fields.isPublished ? "PUBLISHED" : "DRAFT",
      coverImage: uploadedCover
        ? { ...uploadedCover, alt: fields.coverAlt || `${fields.name} tattoo style` }
        : undefined,
    });
  } catch (error) {
    if (uploadedCover) await deleteCloudinaryImages([uploadedCover.publicId]);
    if (
      error instanceof mongoose.Error.ValidationError ||
      (error as { code?: number }).code === 11000
    ) {
      throw new HttpError(409, "A tattoo style with this slug already exists.");
    }
    throw error;
  }
}

export async function updateTattooStyle(
  id: string,
  fields: TattooStyleFields,
  cover?: Express.Multer.File,
) {
  const existing = await TattooStyleModel.findById(id);
  if (!existing) throw new HttpError(404, "Tattoo style not found.");
  const previousCoverPublicId = existing.coverImage?.publicId;
  let uploadedCover: { url: string; publicId: string } | undefined;
  try {
    if (cover) uploadedCover = await uploadTattooStyleImage(cover, fields.slug);
    const nextCover = uploadedCover
      ? { ...uploadedCover, alt: fields.coverAlt || `${fields.name} tattoo style` }
      : existing.coverImage;
    ensurePublishable(fields.isPublished, nextCover);
    existing.set({
      ...fields,
      status: fields.isPublished ? "PUBLISHED" : "DRAFT",
      coverImage: nextCover,
      archivedAt: undefined,
    });
    await existing.save();
    if (uploadedCover && previousCoverPublicId) {
      await deleteCloudinaryImages([previousCoverPublicId]);
    }
    return existing;
  } catch (error) {
    if (uploadedCover) await deleteCloudinaryImages([uploadedCover.publicId]);
    if ((error as { code?: number }).code === 11000) {
      throw new HttpError(409, "A tattoo style with this slug already exists.");
    }
    throw error;
  }
}

export async function addGalleryImages(id: string, files: Express.Multer.File[], alts: string[]) {
  const style = await TattooStyleModel.findById(id);
  if (!style) throw new HttpError(404, "Tattoo style not found.");
  if (files.length === 0) throw new HttpError(400, "Select at least one gallery image.");
  if (style.galleryImages.length + files.length > 20) {
    throw new HttpError(400, "A style can contain no more than 20 gallery images.");
  }
  const uploaded: { url: string; publicId: string }[] = [];
  try {
    for (const file of files) uploaded.push(await uploadTattooStyleImage(file, style.slug));
    const startOrder = style.galleryImages.length;
    style.galleryImages.push(
      ...uploaded.map((image, index) => ({
        ...image,
        alt: alts[index] || `${style.name} gallery image ${startOrder + index + 1}`,
        displayOrder: startOrder + index,
      })),
    );
    await style.save();
    return style;
  } catch (error) {
    await deleteCloudinaryImages(uploaded.map((image) => image.publicId));
    throw error;
  }
}

export async function removeGalleryImage(styleId: string, imageId: string) {
  const style = await TattooStyleModel.findById(styleId);
  if (!style) throw new HttpError(404, "Tattoo style not found.");
  const image = style.galleryImages.id(imageId);
  if (!image) throw new HttpError(404, "Gallery image not found.");
  const publicId = image.publicId;
  image.deleteOne();
  await style.save();
  await deleteCloudinaryImages([publicId]);
  return style;
}
