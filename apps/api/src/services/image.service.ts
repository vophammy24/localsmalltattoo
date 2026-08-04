import { Readable } from "node:stream";
import { cloudinary } from "../config/cloudinary.js";

export function uploadBookingImage(file: Express.Multer.File) {
  return new Promise<{ url: string; publicId: string; originalName: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "local-small-tattoo/bookings", resource_type: "image" }, (error, result) => {
      if (error || !result) return reject(error ?? new Error("Cloudinary upload failed."));
      resolve({ url: result.secure_url, publicId: result.public_id, originalName: file.originalname });
    });
    Readable.from(file.buffer).pipe(stream);
  });
}

export async function deleteBookingImages(publicIds: string[]) {
  await Promise.allSettled(publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)));
}

