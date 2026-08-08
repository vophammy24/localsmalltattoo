import { z } from "zod";

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
const sectionImage = z.object({
  url: z.url(),
  publicId: z.string().min(1),
  alt: optionalText(200),
});

export const aboutContentSchema = z.object({
  version: z.number().int().min(1).optional(),
  home: z.object({
    hero: z.object({
      isVisible: z.boolean().default(true),
      headingLines: z.array(z.string().trim().min(1).max(80)).min(1).max(4),
      subtitle: optionalText(150),
      buttonLabel: optionalText(80),
      buttonUrl: z.union([safeUrl, z.literal("")]).default(""),
      image: sectionImage.optional(),
    }),
    location: z.object({
      isVisible: z.boolean().default(true),
      heading: z.string().trim().min(1).max(150),
      description: optionalText(2000),
      image: sectionImage.optional(),
    }),
  }),
  hero: z.object({
    isVisible: z.boolean().default(true),
    heading: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1).max(1500),
    image: sectionImage.optional(),
    primaryCtaLabel: optionalText(80),
    primaryCtaUrl: z.union([safeUrl, z.literal("")]).default(""),
  }),
  story: z.object({
    isVisible: z.boolean().default(true),
    label: optionalText(100),
    heading: z.string().trim().min(1).max(150),
    paragraphs: z.array(z.string().trim().min(1).max(5000)).min(1).max(10),
    signature: optionalText(150),
    primaryImage: sectionImage.optional(),
    secondaryImage: sectionImage.optional(),
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
    image: sectionImage.optional(),
  }),
  studioSpace: z.object({
    isVisible: z.boolean().default(true),
    heading: z.string().trim().min(1).max(150),
    description: optionalText(2000),
    images: z.array(sectionImage).max(20).default([]),
  }),
  founderSection: z.object({
    isVisible: z.boolean().default(true),
    name: z.string().trim().min(1).max(120),
    role: optionalText(120),
    heading: z.string().trim().min(1).max(150),
    paragraphs: z.array(z.string().trim().min(1).max(5000)).min(1).max(12),
    signature: optionalText(150),
    image: sectionImage.optional(),
  }),
  finalCta: z.object({
    isVisible: z.boolean().default(true),
    heading: z.string().trim().min(1).max(150),
    description: optionalText(1500),
    buttonLabel: z.string().trim().min(1).max(80),
    buttonUrl: safeUrl,
    image: sectionImage.optional(),
  }),
});

export type AboutContentFields = z.infer<typeof aboutContentSchema>;
