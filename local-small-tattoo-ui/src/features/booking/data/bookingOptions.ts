import type { BookingTimePeriod } from "../types/booking";

export type BookingTimeOption = {
  value: BookingTimePeriod;
  label: string;
  range: string;
};

export const BOOKING_TIME_OPTIONS: BookingTimeOption[] = [
  {
    value: "morning",
    label: "Morning",
    range: "10:00 – 12:00",
  },
  {
    value: "noon",
    label: "Noon",
    range: "12:00 – 13:00",
  },
  {
    value: "afternoon",
    label: "Afternoon",
    range: "13:00 – 18:00",
  },
  {
    value: "evening",
    label: "Evening",
    range: "18:00 – 20:00",
  },
];

export const BOOKING_IMAGE_RULES = {
  maxFiles: 5,
  maxFileSizeBytes: 5 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;
