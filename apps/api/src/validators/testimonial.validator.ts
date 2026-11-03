import { z } from "zod";

export function isGoogleMapsSource(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
    return (
      ((url.hostname === "www.google.com" || url.hostname === "google.com") &&
        (url.pathname === "/maps" || url.pathname.startsWith("/maps/"))) ||
      url.hostname === "maps.google.com" ||
      url.hostname === "maps.app.goo.gl" ||
      (url.hostname === "goo.gl" && url.pathname.startsWith("/maps/"))
    );
  } catch {
    return false;
  }
}

const timestamp = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value))
  .nullable();
export const testimonialFieldsSchema = z
  .object({
    customerName: z.string().trim().min(1).max(120),
    rating: z.number().int().min(1).max(5),
    content: z
      .string()
      .trim()
      .min(1)
      .max(5000)
      .refine((value) => !/<\/?[a-z][^>]*>/i.test(value), "Use plain text without HTML."),
    reviewDate: z
      .string()
      .datetime({ offset: true })
      .transform((value) => new Date(value)),
    sourceType: z.enum(["DIRECT_CUSTOMER", "CUSTOMER_AUTHORIZED"]).default("DIRECT_CUSTOMER"),
    sourceUrl: z
      .string()
      .trim()
      .max(2000)
      .refine((value) => !value || isGoogleMapsSource(value), "Use an HTTPS Google Maps URL.")
      .default(""),
    isPublic: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    displayOrder: z.number().int().min(0).max(2147483647).default(0),
    publishFrom: timestamp.default(null),
    publishUntil: timestamp.default(null),
    permissionConfirmed: z.boolean().default(false),
    adminNote: z.string().trim().max(5000).default(""),
  })
  .strict();

export const createTestimonialSchema = testimonialFieldsSchema.superRefine((value, ctx) => {
  if (value.isPublic && !value.permissionConfirmed)
    ctx.addIssue({
      code: "custom",
      path: ["permissionConfirmed"],
      message: "Confirm permission before publishing.",
    });
  if (value.publishFrom && value.publishUntil && value.publishFrom >= value.publishUntil)
    ctx.addIssue({
      code: "custom",
      path: ["publishUntil"],
      message: "Publication end must be after publication start.",
    });
});
// PATCH merges with the stored document before applying the complete schema.
export const patchTestimonialSchema = testimonialFieldsSchema.partial();

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  featured: z.enum(["true", "false"]).optional(),
  status: z.enum(["all", "published", "draft", "scheduled", "expired", "featured"]).default("all"),
  search: z.string().trim().max(200).default(""),
  sort: z.enum(["order", "date", "name"]).default("order"),
});
