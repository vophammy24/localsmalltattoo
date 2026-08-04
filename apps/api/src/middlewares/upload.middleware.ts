import multer from "multer";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const bookingImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 5, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (acceptedTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
  },
});
