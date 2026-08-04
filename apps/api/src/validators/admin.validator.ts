import { z } from "zod";
import { BOOKING_STATUSES } from "../constants/booking.js";

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
  rememberMe: z.boolean().default(false),
});
export const bookingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(BOOKING_STATUSES).optional(),
  search: z.string().trim().max(100).optional(),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
export const updateStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
  note: z.string().trim().max(1000).default(""),
});
export const scheduleSchema = z.object({
  startAt: z.iso.datetime({ offset: true }),
  endAt: z.iso.datetime({ offset: true }),
  note: z.string().trim().max(1000).default(""),
});
export const noteSchema = z.object({ content: z.string().trim().min(1).max(2000) });
