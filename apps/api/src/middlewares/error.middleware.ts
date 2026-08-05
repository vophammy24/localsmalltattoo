import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: error.issues[0]?.message ?? "Invalid request.",
      errors: error.flatten().fieldErrors,
    });
    return;
  }
  if (error instanceof multer.MulterError) {
    response.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Each image must be smaller than 20 MB."
          : "Upload only valid JPG, JPEG, PNG, WebP, HEIC, or HEIF images.",
    });
    return;
  }
  if (
    error instanceof Error &&
    ["MongoServerSelectionError", "MongoNetworkError", "MongooseServerSelectionError"].includes(
      error.name,
    )
  ) {
    console.error("Database unavailable.", error.message);
    response.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please try again shortly.",
    });
    return;
  }
  console.error(error);
  response.status(500).json({ success: false, message: "An unexpected server error occurred." });
};
