import type { RequestHandler } from "express";
import { BookingModel } from "../models/booking.model.js";

export const dashboardSummary: RequestHandler = async (_request, response, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const [counts, completedThisMonth, appointmentsToday, recentBookings, upcomingAppointments] =
      await Promise.all([
        BookingModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        BookingModel.countDocuments({ status: "COMPLETED", updatedAt: { $gte: monthStart } }),
        BookingModel.countDocuments({
          status: "SCHEDULED",
          "scheduledAppointment.startAt": { $gte: todayStart, $lt: todayEnd },
        }),
        BookingModel.find().sort({ createdAt: -1 }).limit(5).lean(),
        BookingModel.find({ status: "SCHEDULED", "scheduledAppointment.startAt": { $gte: now } })
          .sort({ "scheduledAppointment.startAt": 1 })
          .limit(5)
          .lean(),
      ]);
    const totals = Object.fromEntries(
      counts.map((item) => [String(item._id).toLowerCase(), item.count]),
    );
    response.json({
      success: true,
      data: {
        pending: totals.pending ?? 0,
        contacted: totals.contacted ?? 0,
        confirmed: totals.confirmed ?? 0,
        scheduled: totals.scheduled ?? 0,
        cancelled: totals.cancelled ?? 0,
        completedThisMonth,
        appointmentsToday,
        recentBookings,
        upcomingAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};
