import { z } from "zod";

const optionalId = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
);
const optionalText = (max: number) => z.string().trim().max(max).optional().default("");
const safeUrl = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (value) => value.startsWith("/") || value.startsWith("https://"),
    "URL must be an internal path or use HTTPS.",
  );

export const aboutContentSchema = z.object({
  version: z.number().int().min(1).optional(),
  hero: z.object({
    isVisible: z.boolean().default(true),
    heading: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1).max(1500),
    imageId: optionalId,
    primaryCtaLabel: optionalText(80),
    primaryCtaUrl: z.union([safeUrl, z.literal("")]).default(""),
  }),
  story: z.object({
    isVisible: z.boolean().default(true),
    label: optionalText(100),
    heading: z.string().trim().min(1).max(150),
    paragraphs: z.array(z.string().trim().min(1).max(5000)).min(1).max(10),
    primaryImageId: optionalId,
    secondaryImageId: optionalId,
  }),
  mission: z.object({
    isVisible: z.boolean().default(true),
    heading: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1).max(5000),
    values: z
      .array(
        z.object({
          title: z.string().trim().min(1).max(80),
          description: z.string().trim().min(1).max(1000),
          displayOrder: z.number().int().min(0),
        }),
      )
      .max(12)
      .superRefine((values, context) => {
        const seen = new Set<string>();
        values.forEach((value, index) => {
          const key = value.title.toLowerCase();
          if (seen.has(key))
            context.addIssue({
              code: "custom",
              message: "Core value titles must be unique.",
              path: [index, "title"],
            });
          seen.add(key);
        });
      }),
    imageId: optionalId,
  }),
  studioSpace: z.object({
    isVisible: z.boolean().default(true),
    heading: z.string().trim().min(1).max(150),
    description: optionalText(2000),
    galleryItemIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(20),
  }),
  artistSection: z.object({
    isVisible: z.boolean().default(true),
    heading: z.string().trim().min(1).max(150),
    description: optionalText(2000),
    artistIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(12),
  }),
  finalCta: z.object({
    isVisible: z.boolean().default(true),
    heading: z.string().trim().min(1).max(150),
    description: optionalText(1500),
    buttonLabel: z.string().trim().min(1).max(80),
    buttonUrl: safeUrl,
    imageId: optionalId,
  }),
});

export type AboutContentFields = z.infer<typeof aboutContentSchema>;
