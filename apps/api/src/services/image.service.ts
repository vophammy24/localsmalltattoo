import { Readable } from "node:stream";
import { cloudinary } from "../config/cloudinary.js";

function getBrowserCompatibleUrl(url: string) {
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

export function uploadBookingImage(file: Express.Multer.File) {
  return new Promise<{ url: string; publicId: string; originalName: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "local-small-tattoo/bookings", resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed."));
        resolve({
          url: getBrowserCompatibleUrl(result.secure_url),
          publicId: result.public_id,
          originalName: file.originalname,
        });
      },
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

export async function deleteBookingImages(publicIds: string[]) {
  await Promise.allSettled(publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)));
}

export function uploadTattooStyleImage(file: Express.Multer.File, folder: string) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `local-small-tattoo/tattoo-styles/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve({ url: getBrowserCompatibleUrl(result.secure_url), publicId: result.public_id });
      },
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

export function uploadArtistImage(file: Express.Multer.File, folder: string) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `local-small-tattoo/artists/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed."));
        resolve({ url: getBrowserCompatibleUrl(result.secure_url), publicId: result.public_id });
      },
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

export function uploadGalleryImage(file: Express.Multer.File, folder: string) {
  return new Promise<{ url: string; publicId: string; width?: number; height?: number }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `local-small-tattoo/gallery/${folder}`, resource_type: "image" },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Cloudinary upload failed."));
          resolve({
            url: getBrowserCompatibleUrl(result.secure_url),
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        },
      );
      Readable.from(file.buffer).pipe(stream);
    },
  );
}
export function uploadBusinessLogo(file: Express.Multer.File) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "local-small-tattoo/business", resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed."));
        resolve({ url: getBrowserCompatibleUrl(result.secure_url), publicId: result.public_id });
      },
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

export async function deleteCloudinaryImage(publicId: string) {
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary could not delete ${publicId}.`);
  }
}

export async function deleteCloudinaryImages(publicIds: string[]) {
  await Promise.allSettled(publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)));
}
