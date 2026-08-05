import { Schema, model } from "mongoose";
import { BOOKING_STATUSES, BOOKING_TIME_PERIOD_KEYS } from "../constants/booking.js";

const referenceImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String, required: true },
  },
  { _id: false },
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: BOOKING_STATUSES },
    fromStatus: { type: String, enum: BOOKING_STATUSES },
    toStatus: { type: String, enum: BOOKING_STATUSES, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    note: { type: String, default: "" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const adminNoteSchema = new Schema({
  content: { type: String, required: true, trim: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  createdAt: { type: Date, default: Date.now },
});

const bookingSchema = new Schema(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    preferredDate: { type: Date, required: true },
    preferredTimePeriods: [{ type: String, enum: BOOKING_TIME_PERIOD_KEYS, required: true }],
    referenceImages: { type: [referenceImageSchema], default: [] },
    description: { type: String, required: true, trim: true },
    sourceStyle: {
      id: { type: Schema.Types.ObjectId, ref: "TattooStyle" },
      name: String,
      slug: String,
    },
    sourceArtist: {
      id: { type: Schema.Types.ObjectId, ref: "Artist" },
      name: String,
      slug: String,
    },
    consent: { type: Boolean, required: true },
    status: { type: String, enum: BOOKING_STATUSES, default: "PENDING", index: true },
    scheduledAppointment: {
      startAt: Date,
      endAt: Date,
    },
    adminNotes: { type: [adminNoteSchema], default: [] },
    statusHistory: { type: [statusHistorySchema], default: () => [{ toStatus: "PENDING" }] },
  },
  { timestamps: true },
);

export const BookingModel = model("Booking", bookingSchema);
