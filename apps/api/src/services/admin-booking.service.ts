import { Types } from "mongoose";
import { BOOKING_TIME_PERIODS, type BookingStatus } from "../constants/booking.js";
import { BookingModel } from "../models/booking.model.js";
import { HttpError } from "../utils/http-error.js";

const transitions: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONTACTED", "CANCELLED"],
  CONTACTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export async function changeBookingStatus(
  id: string,
  nextStatus: BookingStatus,
  note: string,
  adminId: Types.ObjectId,
) {
  const booking = await BookingModel.findById(id);
  if (!booking) throw new HttpError(404, "Booking not found.");
  const current = booking.status as BookingStatus;
  if (!transitions[current].includes(nextStatus))
    throw new HttpError(409, `Cannot change status from ${current} to ${nextStatus}.`);
  if (nextStatus === "SCHEDULED" && !booking.scheduledAppointment?.startAt)
    throw new HttpError(409, "Use the schedule action to set an official appointment.");
  booking.status = nextStatus;
  booking.statusHistory.push({
    fromStatus: current,
    toStatus: nextStatus,
    changedBy: adminId,
    note,
    changedAt: new Date(),
  });
  await booking.save();
  return booking;
}

function timePart(value: string) {
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "";
}

export async function scheduleBooking(
  id: string,
  startValue: string,
  endValue: string,
  note: string,
  adminId: Types.ObjectId,
) {
  const booking = await BookingModel.findById(id);
  if (!booking) throw new HttpError(404, "Booking not found.");
  if (booking.status !== "CONFIRMED")
    throw new HttpError(409, "Only confirmed bookings can be scheduled.");
  const startAt = new Date(startValue);
  const endAt = new Date(endValue);
  if (startAt >= endAt || startAt <= new Date())
    throw new HttpError(400, "Appointment times are invalid or in the past.");
  if (startValue.slice(0, 10) !== endValue.slice(0, 10))
    throw new HttpError(400, "Appointment must start and end on the same day.");
  if (
    timePart(startValue) < BOOKING_TIME_PERIODS.MORNING.startTime ||
    timePart(endValue) > BOOKING_TIME_PERIODS.EVENING.endTime
  )
    throw new HttpError(400, "Appointment must be within studio hours (10:00-20:00).");
  const conflict = await BookingModel.exists({
    _id: { $ne: booking._id },
    status: "SCHEDULED",
    "scheduledAppointment.startAt": { $lt: endAt },
    "scheduledAppointment.endAt": { $gt: startAt },
  });
  if (conflict) throw new HttpError(409, "This appointment overlaps another scheduled booking.");
  booking.scheduledAppointment = { startAt, endAt };
  booking.statusHistory.push({
    fromStatus: "CONFIRMED",
    toStatus: "SCHEDULED",
    changedBy: adminId,
    note,
    changedAt: new Date(),
  });
  booking.status = "SCHEDULED";
  await booking.save();
  return booking;
}
