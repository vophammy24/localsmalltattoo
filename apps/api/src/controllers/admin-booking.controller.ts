import type { RequestHandler } from "express";
import { BOOKING_TIME_PERIODS } from "../constants/booking.js";
import { BookingModel } from "../models/booking.model.js";
import { changeBookingStatus, scheduleBooking } from "../services/admin-booking.service.js";
import { HttpError } from "../utils/http-error.js";
import {
  bookingQuerySchema,
  noteSchema,
  scheduleSchema,
  updateStatusSchema,
} from "../validators/admin.validator.js";

export const listBookings: RequestHandler = async (request, response, next) => {
  try {
    const query = bookingQuerySchema.parse(request.query);
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      const safe = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { fullName: { $regex: safe, $options: "i" } },
        { phoneNumber: { $regex: safe, $options: "i" } },
        { bookingCode: { $regex: safe, $options: "i" } },
      ];
    }
    if (query.preferredDate) {
      const start = new Date(`${query.preferredDate}T00:00:00`);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.preferredDate = { $gte: start, $lt: end };
    }
    const [items, totalItems] = await Promise.all([
      BookingModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      BookingModel.countDocuments(filter),
    ]);
    response.json({
      success: true,
      data: {
        items,
        timePeriods: BOOKING_TIME_PERIODS,
        pagination: {
          page: query.page,
          limit: query.limit,
          totalItems,
          totalPages: Math.ceil(totalItems / query.limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBooking: RequestHandler = async (request, response, next) => {
  try {
    const booking = await BookingModel.findById(request.params.bookingId)
      .populate("adminNotes.createdBy", "fullName")
      .populate("statusHistory.changedBy", "fullName")
      .lean();
    if (!booking) throw new HttpError(404, "Booking not found.");
    response.json({ success: true, data: { booking, timePeriods: BOOKING_TIME_PERIODS } });
  } catch (error) {
    next(error);
  }
};
export const updateStatus: RequestHandler = async (request, response, next) => {
  try {
    const input = updateStatusSchema.parse(request.body);
    const booking = await changeBookingStatus(
      String(request.params.bookingId),
      input.status,
      input.note,
      request.admin!.id,
    );
    response.json({ success: true, data: { booking } });
  } catch (error) {
    next(error);
  }
};
export const updateSchedule: RequestHandler = async (request, response, next) => {
  try {
    const input = scheduleSchema.parse(request.body);
    const booking = await scheduleBooking(
      String(request.params.bookingId),
      input.startAt,
      input.endAt,
      input.note,
      request.admin!.id,
    );
    response.json({ success: true, data: { booking } });
  } catch (error) {
    next(error);
  }
};
export const addNote: RequestHandler = async (request, response, next) => {
  try {
    const input = noteSchema.parse(request.body);
    const booking = await BookingModel.findByIdAndUpdate(
      request.params.bookingId,
      { $push: { adminNotes: { content: input.content, createdBy: request.admin!.id } } },
      { new: true },
    );
    if (!booking) throw new HttpError(404, "Booking not found.");
    response.status(201).json({ success: true, data: { notes: booking.adminNotes } });
  } catch (error) {
    next(error);
  }
};
export const deleteNote: RequestHandler = async (request, response, next) => {
  try {
    const booking = await BookingModel.findByIdAndUpdate(
      request.params.bookingId,
      { $pull: { adminNotes: { _id: request.params.noteId } } },
      { new: true },
    );
    if (!booking) throw new HttpError(404, "Booking not found.");
    response.json({ success: true, data: { notes: booking.adminNotes } });
  } catch (error) {
    next(error);
  }
};
