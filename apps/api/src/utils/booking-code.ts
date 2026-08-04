import { randomInt } from "node:crypto";
import { BookingModel } from "../models/booking.model.js";

const BOOKING_CODE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const BOOKING_CODE_LENGTH = 10;

function generateRandomCode() {
  return Array.from(
    { length: BOOKING_CODE_LENGTH },
    () => BOOKING_CODE_CHARACTERS[randomInt(BOOKING_CODE_CHARACTERS.length)],
  ).join("");
}

export async function createBookingCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const bookingCode = generateRandomCode();
    const alreadyExists = await BookingModel.exists({ bookingCode });

    if (!alreadyExists) {
      return bookingCode;
    }
  }

  throw new Error("Unable to generate a unique booking code.");
}
