import { z } from "zod";

const booleanFromForm = z.preprocess((value) => value === true || value === "true", z.boolean());
const optionalHttpsUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.url().startsWith("https://").optional(),
);
const optionalInteger = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().int().min(0).optional(),
);
const styleIds = z.preprocess(
  (value) => (Array.isArray(value) ? value : value ? [value] : []),
  z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1),
);

export const artistFieldsSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  displayName: z.string().trim().max(100).default(""),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  role: z.string().trim().min(1).max(100),
  shortBio: z.string().trim().min(1).max(250),
  biography: z.string().trim().min(1).max(5000),
  profileAlt: z.string().trim().max(160).default(""),
  coverAlt: z.string().trim().max(160).default(""),
  tattooStyleIds: styleIds,
  yearsOfExperience: optionalInteger,
  instagram: optionalHttpsUrl,
  facebook: optionalHttpsUrl,
  tiktok: optionalHttpsUrl,
  isFeatured: booleanFromForm.default(false),
  isPublished: booleanFromForm.default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const adminArtistQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  publication: z.enum(["published", "draft", "archived"]).optional(),
  styleId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
});

export const reorderArtistsSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), displayOrder: z.number().int().min(0) })).min(1),
});

export const publishArtistSchema = z.object({ isPublished: z.boolean() });
export type ArtistFields = z.infer<typeof artistFieldsSchema>;
