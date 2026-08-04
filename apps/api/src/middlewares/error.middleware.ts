import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({ success: false, message: "Invalid booking request.", errors: error.flatten().fieldErrors });
    return;
  }
  if (error instanceof multer.MulterError) {
    response.status(400).json({ success: false, message: error.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MB or smaller." : "Upload no more than 5 valid JPG, PNG, or WebP images." });
    return;
  }
  console.error(error);
  response.status(500).json({ success: false, message: "Unable to submit booking request." });
};

