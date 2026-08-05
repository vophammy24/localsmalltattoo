import { z } from "zod";
import { BUSINESS_DAYS } from "../models/business-settings.model.js";
const httpsUrl = z.union([z.literal(""), z.url().startsWith("https://")]);
const phone = z
  .string()
  .trim()
  .min(7)
  .max(25)
  .regex(/^\+?[0-9 ()-]+$/);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
function extractEmbedUrl(input: unknown) {
  if (typeof input !== "string") return input;
  const value = input.trim();
  if (!value.toLowerCase().startsWith("<iframe")) return value;
  return value.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? value;
}
export const businessSettingsSchema = z.object({
  businessName: z.string().trim().min(2).max(100),
  shortName: z.string().trim().max(60).default(""),
  description: z.string().trim().max(500).default(""),
  logoAlt: z.string().trim().max(160).default(""),
  contact: z.object({
    phoneNumber: phone,
    secondaryPhoneNumber: z.union([phone, z.literal("")]).default(""),
    email: z.email(),
  }),
  address: z.object({
    addressLine: z.string().trim().min(1).max(200),
    ward: z.string().trim().max(100).default(""),
    district: z.string().trim().max(100).default(""),
    city: z.string().trim().min(1).max(100),
    country: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().max(20).default(""),
  }),
  location: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    googleMapsUrl: z.url().startsWith("https://"),
    googleMapsEmbedUrl: z.preprocess(
      extractEmbedUrl,
      z
        .url()
        .startsWith("https://")
        .refine((url) => {
          try {
            const parsed = new URL(url);
            return (
              ["www.google.com", "google.com", "maps.google.com"].includes(parsed.hostname) &&
              parsed.pathname.startsWith("/maps/embed")
            );
          } catch {
            return false;
          }
        }, "Embed URL must be a Google Maps embed URL."),
    ),
  }),
  openingHours: z
    .array(
      z
        .object({
          day: z.enum(BUSINESS_DAYS),
          isOpen: z.boolean(),
          openTime: z.union([time, z.literal("")]).default(""),
          closeTime: z.union([time, z.literal("")]).default(""),
        })
        .superRefine((value, context) => {
          if (
            value.isOpen &&
            (!value.openTime || !value.closeTime || value.openTime >= value.closeTime)
          )
            context.addIssue({
              code: "custom",
              message: "Open time must be earlier than close time.",
            });
        }),
    )
    .length(7)
    .superRefine((hours, context) => {
      if (new Set(hours.map((item) => item.day)).size !== 7)
        context.addIssue({ code: "custom", message: "Each day must appear exactly once." });
    }),
  socialLinks: z.object({
    instagram: httpsUrl.default(""),
    facebook: httpsUrl.default(""),
    tiktok: httpsUrl.default(""),
    messenger: httpsUrl.default(""),
    whatsapp: httpsUrl.default(""),
    zalo: httpsUrl.default(""),
  }),
  bookingNotice: z.string().trim().max(1000).default(""),
});
