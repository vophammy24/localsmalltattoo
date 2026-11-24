import { Schema, model } from "mongoose";

const rateSchema = new Schema(
  {
    _id: String,
    count: Number,
    expiresAt: { type: Date, expires: 0 },
  },
  { versionKey: false },
);

const claimSchema = new Schema(
  {
    _id: String,
    submissionKey: { type: String, required: true, unique: true },
    expiresAt: { type: Date, expires: 0 },
  },
  { versionKey: false },
);

export const BookingRate = model("BookingRate", rateSchema);
export const BookingClaim = model("BookingClaim", claimSchema);
