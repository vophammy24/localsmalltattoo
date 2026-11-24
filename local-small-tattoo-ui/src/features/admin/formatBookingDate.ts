import type { Booking } from "./types";

export function formatBookingDate({ preferredDateLocal, preferredDate }: Booking) {
  if (preferredDateLocal) return preferredDateLocal;
  return preferredDate ? new Date(preferredDate).toLocaleDateString() : "—";
}
