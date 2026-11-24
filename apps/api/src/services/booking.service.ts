import { createBooking } from "../repositories/booking.repository.js";
import type { CreateBookingInput } from "../validators/booking.validator.js";
import { createBookingCode } from "../utils/booking-code.js";
import { TattooStyleModel } from "../models/tattoo-style.model.js";
import { deleteBookingImages, uploadBookingImage } from "./image.service.js";
import { BookingModel } from "../models/booking.model.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";
import { Types } from "mongoose";
import {
  bookingFingerprint,
  bookingSubmissionKey,
  claimBooking,
  limitBooking,
} from "./booking-protection.service.js";
import { queueBookingEmail } from "./booking-notification.service.js";

export async function submitBooking(
  input: CreateBookingInput,
  files: Express.Multer.File[],
  requestKey: string,
) {
  const submissionKey = bookingSubmissionKey(requestKey);
  const submissionFingerprint = bookingFingerprint(input, files);
  const findExisting = () =>
    BookingModel.findOne({ submissionKey })
      .select("bookingCode status +submissionFingerprint")
      .lean();
  const replay = (booking: NonNullable<Awaited<ReturnType<typeof findExisting>>>) => {
    if (booking.submissionFingerprint !== submissionFingerprint) {
      throw new HttpError(
        409,
        "This request was already used for a different booking. Refresh and try again.",
      );
    }
    return { replay: true, data: { bookingCode: booking.bookingCode, status: booking.status } };
  };
  const existing = await findExisting();
  if (existing) return replay(existing);

  const release = await claimBooking(submissionKey, submissionFingerprint);
  const uploadedImages: Awaited<ReturnType<typeof uploadBookingImage>>[] = [];
  let saving = false;

  try {
    const completed = await findExisting();
    if (completed) return replay(completed);
    const duplicate = await BookingModel.exists({
      submissionFingerprint,
      createdAt: { $gte: new Date(Date.now() - env.BOOKING_DUPLICATE_WINDOW_MINUTES * 60_000) },
    });
    if (duplicate) throw new HttpError(409, "This booking request has already been received.");
    await limitBooking("phone", input.phoneNumber);
    await limitBooking("email", input.email);

    for (const file of files) {
      try {
        uploadedImages.push(await uploadBookingImage(file));
      } catch (error) {
        if (typeof error === "object" && error && "http_code" in error && error.http_code === 400) {
          throw new HttpError(
            422,
            "An image could not be read. Replace it and try again.",
            "referenceImages",
          );
        }
        throw new HttpError(503, "Reference images could not be saved. Please try again.");
      }
    }

    const bookingCode = await createBookingCode();
    const { preferredDate, sourceStyleSlug, website: _website, ...fields } = input;
    const sourceStyle = sourceStyleSlug
      ? await TattooStyleModel.findOne({
          slug: sourceStyleSlug,
          isPublished: true,
          status: "PUBLISHED",
        }).lean()
      : null;
    const _id = new Types.ObjectId();
    const submittedAt = new Date();
    const bookingEmail = queueBookingEmail(input, {
      id: _id.toHexString(),
      code: bookingCode,
      submittedAt,
      imageCount: uploadedImages.length,
      status: "PENDING",
    });
    saving = true;
    const booking = await createBooking({
      ...fields,
      _id,
      createdAt: submittedAt,
      bookingEmail,
      sourceStyle: sourceStyle
        ? { id: sourceStyle._id, name: sourceStyle.name, slug: sourceStyle.slug }
        : undefined,
      preferredDateLocal: preferredDate,
      consentAt: new Date(),
      submissionKey,
      submissionFingerprint,
      bookingCode,
      referenceImages: uploadedImages,
    });
    return { replay: false, data: { bookingCode: booking.bookingCode, status: booking.status } };
  } catch (error) {
    // A lost database response may follow a successful insert. Preserve its assets.
    const saved = saving ? await findExisting().catch(() => undefined) : null;
    if (saved) return replay(saved);
    if (saved === null) await deleteBookingImages(uploadedImages.map((image) => image.publicId));
    throw error;
  } finally {
    await release().catch(() => console.warn("Booking request lock will expire automatically."));
  }
}
