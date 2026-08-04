import { z } from "zod";

const booleanFromForm = z.preprocess((value) => value === true || value === "true", z.boolean());

export const tattooStyleFieldsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(3000),
  coverAlt: z.string().trim().max(160).default(""),
  isFeatured: booleanFromForm.default(false),
  isPublished: booleanFromForm.default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const adminStyleQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  publication: z.enum(["published", "draft", "archived"]).optional(),
});

export const reorderStylesSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), displayOrder: z.number().int().min(0) })).min(1),
});

export const galleryMetadataSchema = z.object({
  alts: z.preprocess(
    (value) => (Array.isArray(value) ? value : value ? [value] : []),
    z.array(z.string().trim().max(160)),
  ),
});

export const reorderGallerySchema = z.object({
  items: z
    .array(z.object({ imageId: z.string().min(1), displayOrder: z.number().int().min(0) }))
    .min(1),
});

export type TattooStyleFields = z.infer<typeof tattooStyleFieldsSchema>;
