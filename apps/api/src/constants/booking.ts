export const BOOKING_TIME_PERIODS = {
  MORNING: { startTime: "10:00", endTime: "12:00" },
  NOON: { startTime: "12:00", endTime: "13:00" },
  AFTERNOON: { startTime: "13:00", endTime: "18:00" },
  EVENING: { startTime: "18:00", endTime: "20:00" },
} as const;

export const BOOKING_TIME_PERIOD_KEYS = Object.keys(BOOKING_TIME_PERIODS) as BookingTimePeriod[];
export type BookingTimePeriod = keyof typeof BOOKING_TIME_PERIODS;

export const BOOKING_STATUSES = [
  "PENDING",
  "CONTACTED",
  "CONFIRMED",
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
