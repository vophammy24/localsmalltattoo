import { Router } from "express";
import { createBookingController } from "../controllers/booking.controller.js";
import { bookingImageUpload } from "../middlewares/upload.middleware.js";

export const bookingRouter = Router();
bookingRouter.post("/", bookingImageUpload.array("referenceImages", 5), createBookingController);
