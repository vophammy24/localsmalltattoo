import type { RequestHandler } from "express";
import { submitBooking } from "../services/booking.service.js";
import { createBookingSchema } from "../validators/booking.validator.js";

export const createBookingController: RequestHandler = async (request, response, next) => {
  try {
    const input = createBookingSchema.parse(request.body);
    const data = await submitBooking(input, (request.files as Express.Multer.File[]) ?? []);
    response
      .status(201)
      .json({ success: true, message: "Booking request submitted successfully.", data });
  } catch (error) {
    next(error);
  }
};
