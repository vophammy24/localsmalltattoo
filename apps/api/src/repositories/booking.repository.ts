import { BookingModel } from "../models/booking.model.js";

export function createBooking(data: Record<string, unknown>) {
  return BookingModel.create(data);
}
