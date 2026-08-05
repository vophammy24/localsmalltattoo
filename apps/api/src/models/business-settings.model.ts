import { Schema, model } from "mongoose";
export const BUSINESS_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;
const openingHourSchema = new Schema(
  {
    day: { type: String, enum: BUSINESS_DAYS, required: true },
    isOpen: { type: Boolean, default: true },
    openTime: String,
    closeTime: String,
  },
  { _id: false },
);
const businessSettingsSchema = new Schema(
  {
    settingsKey: { type: String, unique: true, default: "business", immutable: true },
    businessName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    shortName: { type: String, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 500 },
    logo: { url: String, publicId: String, alt: String },
    contact: {
      phoneNumber: { type: String, required: true },
      secondaryPhoneNumber: String,
      email: { type: String, required: true, lowercase: true },
    },
    address: {
      addressLine: { type: String, required: true },
      ward: String,
      district: String,
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: String,
    },
    location: {
      latitude: Number,
      longitude: Number,
      googleMapsUrl: { type: String, required: true },
      googleMapsEmbedUrl: { type: String, required: true },
    },
    openingHours: { type: [openingHourSchema], default: [] },
    socialLinks: {
      instagram: String,
      facebook: String,
      tiktok: String,
      messenger: String,
      whatsapp: String,
      zalo: String,
    },
    bookingNotice: { type: String, maxlength: 1000 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);
export const BusinessSettingsModel = model("BusinessSettings", businessSettingsSchema);
