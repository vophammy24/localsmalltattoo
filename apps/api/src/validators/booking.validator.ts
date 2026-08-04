import { z } from "zod";
import { BOOKING_TIME_PERIOD_KEYS } from "../constants/booking.js";

const phonePattern = /^[+0-9][0-9\s().-]{7,19}$/;

function toArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",");
  return value;
}

export const createBookingSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phoneNumber: z.string().trim().regex(phonePattern),
  email: z.email().trim().toLowerCase(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const selected = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(selected.getTime()) && selected >= today;
  }, "Preferred date cannot be in the past."),
  preferredTimePeriods: z.preprocess(toArray, z.array(z.enum(BOOKING_TIME_PERIOD_KEYS)).min(1).max(4)),
  description: z.string().trim().min(1).max(5000),
  consent: z.enum(["true", "false"]).transform((value) => value === "true").refine(Boolean),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

