import { createBooking } from "../repositories/booking.repository.js";
import type { CreateBookingInput } from "../validators/booking.validator.js";
import { createBookingCode } from "../utils/booking-code.js";
import { deleteBookingImages, uploadBookingImage } from "./image.service.js";

export async function submitBooking(input: CreateBookingInput, files: Express.Multer.File[]) {
  const uploadedImages: Awaited<ReturnType<typeof uploadBookingImage>>[] = [];

  try {
    for (const file of files) {
      uploadedImages.push(await uploadBookingImage(file));
    }

    const bookingCode = await createBookingCode();
    const booking = await createBooking({
      ...input,
      preferredDate: new Date(`${input.preferredDate}T00:00:00`),
      bookingCode,
      referenceImages: uploadedImages,
    });
    return { bookingCode: booking.bookingCode, status: booking.status };
  } catch (error) {
    await deleteBookingImages(uploadedImages.map((image) => image.publicId));
    throw error;
  }
}
