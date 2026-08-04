import { Schema, model } from "mongoose";
import { BOOKING_STATUSES, BOOKING_TIME_PERIOD_KEYS } from "../constants/booking.js";

const referenceImageSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  originalName: { type: String, required: true },
}, { _id: false });

const statusHistorySchema = new Schema({
  status: { type: String, enum: BOOKING_STATUSES, required: true },
  note: { type: String, default: "" },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const bookingSchema = new Schema({
  bookingCode: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  preferredDate: { type: Date, required: true },
  preferredTimePeriods: [{ type: String, enum: BOOKING_TIME_PERIOD_KEYS, required: true }],
  referenceImages: { type: [referenceImageSchema], default: [] },
  description: { type: String, required: true, trim: true },
  consent: { type: Boolean, required: true },
  status: { type: String, enum: BOOKING_STATUSES, default: "PENDING", index: true },
  adminNote: { type: String, default: "" },
  statusHistory: { type: [statusHistorySchema], default: () => [{ status: "PENDING" }] },
}, { timestamps: true });

export const BookingModel = model("Booking", bookingSchema);

