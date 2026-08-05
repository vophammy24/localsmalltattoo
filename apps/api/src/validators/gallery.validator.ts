import { z } from "zod";
import { GALLERY_TYPES } from "../models/gallery-item.model.js";

const booleanValue = z.preprocess((value) => value === true || value === "true", z.boolean());
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const galleryFieldsSchema = z.object({
  title: optionalText(160),
  caption: optionalText(500),
  alt: z.string().trim().max(200).default(""),
  type: z.enum(GALLERY_TYPES),
  artistId: optionalText(50),
  tattooStyleIds: z.preprocess(
    (value) => (Array.isArray(value) ? value : value ? [value] : []),
    z.array(z.string().min(1)),
  ),
  isFeatured: booleanValue.default(false),
  isPublished: booleanValue.default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  photographedAt: optionalText(40),
});

export const galleryListQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.enum(GALLERY_TYPES).optional(),
  artist: z.string().trim().optional(),
  artistId: z.string().trim().optional(),
  style: z.string().trim().optional(),
  styleId: z.string().trim().optional(),
  featured: z.enum(["true", "false"]).optional(),
  publication: z.enum(["all", "published", "draft"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const galleryReorderSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), displayOrder: z.number().int().min(0) })).min(1),
});

export const galleryToggleSchema = z.object({ value: z.boolean() });

export const galleryBulkActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  action: z.enum([
    "PUBLISH",
    "UNPUBLISH",
    "FEATURE",
    "UNFEATURE",
    "DELETE",
    "SET_TYPE",
    "SET_ARTIST",
    "ADD_STYLE",
  ]),
  value: z.string().optional(),
});
