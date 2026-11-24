import type { RequestHandler } from "express";
import { submitBooking } from "../services/booking.service.js";
import { createBookingSchema } from "../validators/booking.validator.js";
import { fileTypeFromBuffer } from "file-type";
import { HttpError } from "../utils/http-error.js";

const acceptedImageFormats = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

export const createBookingController: RequestHandler = async (request, response, next) => {
  try {
    const input = createBookingSchema.parse(request.body);
    const files = (request.files as Express.Multer.File[]) ?? [];
    for (const file of files) {
      const detected = await fileTypeFromBuffer(file.buffer).catch(() => undefined);
      if (!detected || !acceptedImageFormats.has(detected.mime)) {
        throw new HttpError(
          400,
          "Upload a valid JPG, PNG, WebP, HEIC or HEIF image.",
          "referenceImages",
        );
      }
    }
    const { data, replay } = await submitBooking(input, files, response.locals.bookingKey);
    response
      .status(replay ? 200 : 201)
      .json({ success: true, message: "Booking request submitted successfully.", data });
  } catch (error) {
    next(error);
  }
};
