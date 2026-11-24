import { Schema, model } from "mongoose";
import { BOOKING_STATUSES, BOOKING_TIME_PERIOD_KEYS } from "../constants/booking.js";

const referenceImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String, required: true },
    format: String,
    deliveryType: { type: String, enum: ["authenticated"] },
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

const bookingEmailSchema = new Schema(
  {
    state: { type: String, enum: ["queued", "sending", "accepted", "failed"], required: true },
    payload: String,
    attempts: { type: Number, required: true },
    nextAttemptAt: Date,
    expiresAt: Date,
    acceptedAt: Date,
    resendId: String,
    failure: String,
  },
  { _id: false },
);

const bookingSchema = new Schema(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    preferredDate: Date, // Historical bookings only.
    preferredDateLocal: String,
    preferredTimePeriods: [{ type: String, enum: BOOKING_TIME_PERIOD_KEYS, required: true }],
    referenceImages: { type: [referenceImageSchema], default: [] },
    description: { type: String, trim: true },
    instagram: String,
    contactMethods: { type: [String], enum: ["whatsapp", "zalo"], default: undefined },
    sourceStyle: {
      id: { type: Schema.Types.ObjectId, ref: "TattooStyle" },
      name: String,
      slug: String,
    },
    consent: { type: Boolean, required: true },
    consentAt: Date,
    submissionKey: { type: String, unique: true, sparse: true, select: false },
    submissionFingerprint: { type: String, select: false },
    bookingEmail: { type: bookingEmailSchema, select: false },
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

bookingSchema.index(
  { submissionFingerprint: 1, createdAt: -1 },
  {
    partialFilterExpression: { submissionFingerprint: { $exists: true } },
  },
);
bookingSchema.index(
  { "bookingEmail.state": 1, "bookingEmail.nextAttemptAt": 1 },
  { partialFilterExpression: { "bookingEmail.nextAttemptAt": { $exists: true } } },
);
export const BookingModel = model("Booking", bookingSchema);
