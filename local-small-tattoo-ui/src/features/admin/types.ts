export type Admin = { id: string; fullName: string; email: string; role: "OWNER" | "STAFF" };
export type BookingStatus =
  "PENDING" | "CONTACTED" | "CONFIRMED" | "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type Booking = {
  _id: string;
  bookingCode: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  preferredDate: string;
  preferredTimePeriods: string[];
  description: string;
  consent: boolean;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  referenceImages: { url: string; publicId: string; originalName: string }[];
  sourceStyle?: { id: string; name: string; slug: string };
  sourceArtist?: { id: string; name: string; slug: string };
  scheduledAppointment?: { startAt: string; endAt: string };
  adminNotes: {
    _id: string;
    content: string;
    createdAt: string;
    createdBy?: { fullName: string };
  }[];
  statusHistory: {
    status?: BookingStatus;
    fromStatus?: BookingStatus;
    toStatus?: BookingStatus;
    note: string;
    changedAt: string;
    changedBy?: { fullName: string };
  }[];
};
export type TimePeriods = Record<string, { startTime: string; endTime: string }>;
