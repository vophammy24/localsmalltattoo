import { Schema, model } from "mongoose";

const bookingCounterSchema = new Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, required: true, default: 0 },
});

export const BookingCounterModel = model("BookingCounter", bookingCounterSchema);

