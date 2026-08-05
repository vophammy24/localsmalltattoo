import multer from "multer";
import path from "node:path";

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024 - 1;
const acceptedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const acceptedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"]);

function acceptImage(file: Express.Multer.File) {
  return (
    acceptedTypes.has(file.mimetype.toLowerCase()) ||
    acceptedExtensions.has(path.extname(file.originalname).toLowerCase())
  );
}

export const bookingImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 5, fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_request, file, callback) => {
    if (acceptImage(file)) {
      callback(null, true);
      return;
    }
    callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
  },
});

export const styleImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 20, fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_request, file, callback) => {
    if (acceptImage(file)) {
      callback(null, true);
      return;
    }
    callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
  },
});
