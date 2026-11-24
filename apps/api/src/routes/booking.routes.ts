import { Router } from "express";
import { createBookingController } from "../controllers/booking.controller.js";
import { bookingImageUpload } from "../middlewares/upload.middleware.js";
import {
  bookingIndexes,
  limitBooking,
  verifyBookingTurnstile,
} from "../services/booking-protection.service.js";
import { HttpError } from "../utils/http-error.js";
import multer from "multer";

export const bookingRouter = Router();
const parseImages = bookingImageUpload.array("referenceImages", 5);
const maxBodyBytes = 5 * 20 * 1024 * 1024 + 64 * 1024;
let largeUploadInProgress = false;

bookingRouter.post("/", async (request, response, next) => {
  const size = Number(request.get("content-length") ?? NaN);
  if (!request.is("multipart/form-data"))
    throw new HttpError(415, "Send the booking form as multipart data.");
  if (!Number.isSafeInteger(size) || size <= 0)
    throw new HttpError(411, "The booking request size is missing.");
  if (size > maxBodyBytes)
    throw new HttpError(413, "Upload up to five images, 20 MB each.", "referenceImages");
  const key = request.get("Idempotency-Key");
  if (!key || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
    throw new HttpError(400, "Refresh the booking form and try again.");
  }
  const ip = request.ip ?? request.socket.remoteAddress ?? "unknown";
  await bookingIndexes();
  await limitBooking("ip", ip);
  await verifyBookingTurnstile(request.get("X-Turnstile-Token"), ip);
  response.locals.bookingKey = key.toLowerCase();
  if (response.destroyed) return;
  const largeUpload = size > 1024 * 1024;
  if (largeUpload && largeUploadInProgress) {
    throw new HttpError(503, "Uploads are busy. Please try again shortly.");
  }
  if (largeUpload) largeUploadInProgress = true;
  try {
    await new Promise<void>((resolve, reject) =>
      parseImages(request, response, (error: unknown) => {
        if (!error) return resolve();
        if (error instanceof multer.MulterError) {
          const message =
            error.code === "LIMIT_FILE_SIZE"
              ? "Each image must be 20 MB or less."
              : error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE"
                ? "Upload up to five supported images."
                : undefined;
          if (message) return reject(new HttpError(400, message, "referenceImages"));
        }
        reject(new HttpError(400, "The booking form could not be read. Please try again."));
      }),
    );
    if (!request.aborted) await createBookingController(request, response, next);
  } finally {
    if (largeUpload) largeUploadInProgress = false;
  }
});
