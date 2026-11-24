import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import { cloudinary } from "../config/cloudinary.js";

function getBrowserCompatibleUrl(url: string) {
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

export function uploadBookingImage(file: Express.Multer.File) {
  return new Promise<{
    url: string;
    publicId: string;
    originalName: string;
    format: string;
    deliveryType: "authenticated";
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "local-small-tattoo/bookings",
        public_id: randomUUID(),
        overwrite: false,
        resource_type: "image",
        type: "authenticated",
        format: "jpg",
        timeout: 25_000,
        transformation: [{ width: 2400, height: 2400, crop: "limit" }],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed."));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          originalName:
            file.originalname.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 200) || "Reference image",
          format: result.format,
          deliveryType: "authenticated",
        });
      },
    );
    Readable.from(file.buffer).pipe(stream);
  });
}

export async function deleteBookingImages(publicIds: string[]) {
  await Promise.allSettled(
    publicIds.map((publicId) => cloudinary.uploader.destroy(publicId, { type: "authenticated" })),
  );
}

export function bookingImageUrl(image: {
  publicId: string;
  url: string;
  format?: string | null;
  deliveryType?: string | null;
}) {
  if (image.deliveryType !== "authenticated" || !image.format) return image.url;
  return cloudinary.utils.private_download_url(image.publicId, image.format, {
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 1800,
    attachment: false,
  });
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

export function uploadPageSectionImage(file: Express.Multer.File, section: string) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const safeSection = section.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const stream = cloudinary.uploader.upload_stream(
      { folder: `local-small-tattoo/page-sections/${safeSection}`, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed."));
        resolve({ url: getBrowserCompatibleUrl(result.secure_url), publicId: result.public_id });
      },
    );
    Readable.from(file.buffer).pipe(stream);
  });
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
