import { BookingCounterModel } from "../models/booking-counter.model.js";

export async function createBookingCode(date = new Date()) {
  const datePart = [String(date.getFullYear()).slice(-2), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("");
  const counter = await BookingCounterModel.findByIdAndUpdate(
    datePart,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

  return `LST-${datePart}-${String(counter.sequence).padStart(3, "0")}`;
}

