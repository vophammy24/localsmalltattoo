import type { RequestHandler } from "express";
import { BusinessSettingsModel, BUSINESS_DAYS } from "../models/business-settings.model.js";
import { deleteCloudinaryImage, uploadBusinessLogo } from "../services/image.service.js";
import { businessSettingsSchema } from "../validators/business-settings.validator.js";
import { isDatabaseConnected } from "../config/database.js";
const BUSINESS_EMAIL = "booking.localsmalltattoo@gmail.com";
export const DEFAULT_SETTINGS = {
  businessName: "Local Small Tattoo",
  shortName: "LOCAL SMALL",
  description: "A private tattoo studio in Da Nang.",
  contact: {
    phoneNumber: "+84 946 752 336",
    secondaryPhoneNumber: "",
    email: BUSINESS_EMAIL,
  },
  address: {
    addressLine: "52-54 Tran Thanh Mai",
    ward: "An Hai",
    district: "Son Tra",
    city: "Da Nang",
    country: "Vietnam",
    postalCode: "",
  },
  location: {
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=52-54+Tran+Thanh+Mai+Da+Nang+Vietnam",
    googleMapsEmbedUrl:
      "https://www.google.com/maps?q=52-54+Tran+Thanh+Mai+Da+Nang+Vietnam&output=embed",
  },
  openingHours: BUSINESS_DAYS.map((day) => ({
    day,
    isOpen: true,
    openTime: "10:00",
    closeTime: "20:00",
  })),
  socialLinks: {
    instagram: "",
    facebook: "",
    tiktok: "",
    messenger: "",
    whatsapp: "",
    zalo: "",
  },
  bookingNotice: "Appointments are confirmed after our team contacts you.",
};
async function getSettings() {
  if (!isDatabaseConnected()) return DEFAULT_SETTINGS;
  try {
    const settings =
      (await BusinessSettingsModel.findOne({ settingsKey: "business" }).lean()) ?? DEFAULT_SETTINGS;
    return {
      ...settings,
      contact: { ...settings.contact, email: BUSINESS_EMAIL },
    };
  } catch (error) {
    console.warn(
      "Business settings database lookup failed; using defaults.",
      error instanceof Error ? error.message : error,
    );
    return DEFAULT_SETTINGS;
  }
}
export const getPublicBusinessSettings: RequestHandler = async (_req, res, next) => {
  try {
    res.json({ success: true, data: { settings: await getSettings() } });
  } catch (error) {
    next(error);
  }
};
export const getAdminBusinessSettings: RequestHandler = getPublicBusinessSettings;
export const updateAdminBusinessSettings: RequestHandler = async (req, res, next) => {
  try {
    const fields = businessSettingsSchema.parse(req.body);
    fields.contact.email = BUSINESS_EMAIL;
    const settings =
      (await BusinessSettingsModel.findOne({ settingsKey: "business" })) ??
      new BusinessSettingsModel({ settingsKey: "business" });
    const logo = settings.logo
      ? {
          url: settings.logo.url,
          publicId: settings.logo.publicId,
          alt: fields.logoAlt || settings.logo.alt,
        }
      : undefined;
    settings.set(fields);
    if (logo) settings.logo = logo;
    settings.updatedBy = req.admin?.id;
    await settings.save();
    res.json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
};
export const updateAdminBusinessLogo: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Select a logo image." });
    const settings =
      (await BusinessSettingsModel.findOne({ settingsKey: "business" })) ??
      new BusinessSettingsModel({ settingsKey: "business", ...DEFAULT_SETTINGS });
    const uploaded = await uploadBusinessLogo(req.file);
    const oldPublicId = settings.logo?.publicId;
    settings.logo = { ...uploaded, alt: String(req.body.alt || settings.businessName) };
    settings.updatedBy = req.admin?.id;
    await settings.save();
    if (oldPublicId) await deleteCloudinaryImage(oldPublicId);
    res.json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
};
export const deleteAdminBusinessLogo: RequestHandler = async (_req, res, next) => {
  try {
    const settings = await BusinessSettingsModel.findOne({ settingsKey: "business" });
    if (settings?.logo?.publicId) {
      await deleteCloudinaryImage(settings.logo.publicId);
      settings.logo = undefined;
      await settings.save();
    }
    res.json({ success: true, data: { settings: settings ?? DEFAULT_SETTINGS } });
  } catch (error) {
    next(error);
  }
};
