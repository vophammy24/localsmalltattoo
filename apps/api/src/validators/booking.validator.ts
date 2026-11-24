import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { z } from "zod";

const studioDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function studioToday() {
  const { year, month, day } = Object.fromEntries(
    studioDate.formatToParts(new Date()).map(({ type, value }) => [type, value]),
  );
  return `${year}-${month}-${day}`;
}

const singleLine = /^[^\p{Cc}\p{Zl}\p{Zp}]*$/u;
const multiline = /^[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]*$/;
const optionalText = (schema: z.ZodType<string>) =>
  z.preprocess(
    (value) => (typeof value === "string" && !value.trim() ? undefined : value),
    schema.optional(),
  );

export const createBookingSchema = z.object({
  fullName: z
    .string({ error: "Enter your full name." })
    .trim()
    .min(1, "Enter your full name.")
    .max(120, "Use 120 characters or fewer.")
    .regex(singleLine, "Enter a valid name."),
  phoneNumber: z
    .string({ error: "Enter your phone number." })
    .trim()
    .max(40)
    .transform((value, context) => {
      const phone = value.startsWith("+")
        ? parsePhoneNumberFromString(value, { extract: false })
        : undefined;
      if (!phone?.isValid() || phone.ext) {
        context.addIssue({ code: "custom", message: "Enter a valid international phone number." });
        return z.NEVER;
      }
      return phone.number;
    }),
  email: z
    .string({ error: "Enter your email address." })
    .trim()
    .max(254)
    .toLowerCase()
    .pipe(z.email({ error: "Enter a valid email address." })),
  instagram: optionalText(
    z
      .string()
      .trim()
      .regex(/^@?[a-zA-Z0-9._]{1,30}$/, "Enter an Instagram username.")
      .transform((value) => value.replace(/^@/, "").toLowerCase()),
  ),
  preferredDate: optionalText(
    z.iso
      .date({ error: "Enter a valid preferred date." })
      .refine(
        (value) => value >= studioToday(),
        "Preferred date cannot be in the past in Da Nang.",
      ),
  ),
  description: optionalText(
    z
      .string()
      .trim()
      .max(2000, "Use 2,000 characters or fewer.")
      .regex(multiline, "Remove unsupported characters from the description."),
  ),
  contactMethods: z.preprocess(
    (value) => (typeof value === "string" ? [value] : value),
    z
      .array(z.enum(["whatsapp", "zalo"]))
      .max(2)
      .transform((values) => [...new Set(values)].sort())
      .optional(),
  ),
  sourceStyleSlug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  consent: z
    .literal("true", { error: "Agree to the booking consent to continue." })
    .transform(() => true),
  website: z.literal("").optional(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
