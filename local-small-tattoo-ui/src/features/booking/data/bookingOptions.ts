import type { BookingTimePeriod } from "../types/booking";
import { IMAGE_UPLOAD_RULES } from "../../../utils/imageUpload";

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
  ...IMAGE_UPLOAD_RULES,
} as const;
