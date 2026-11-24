import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { z } from "zod";
import { SITE_CONFIG } from "../../../config/siteConfig";
import { isSupportedImageFile, IMAGE_UPLOAD_RULES } from "../../../utils/imageUpload";
import type { BookingFieldName, BookingFormValues } from "../types/booking";

export const MAX_BOOKING_IMAGES = 5;
export const MAX_BOOKING_DESCRIPTION = 2000;
const studioDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: SITE_CONFIG.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getStudioDate() {
  const { year, month, day } = Object.fromEntries(
    studioDate.formatToParts(new Date()).map(({ type, value }) => [type, value]),
  );
  return `${year}-${month}-${day}`;
}

export function bookingPhone({ phoneNumber, country }: BookingFormValues) {
  const phone = parsePhoneNumberFromString(phoneNumber.trim(), {
    defaultCountry: country,
    extract: false,
  });
  return phone?.isValid() && !phone.ext ? phone.number : undefined;
}

export function bookingFileError(file: File) {
  if (!file.size) return "Choose an image that is not empty.";
  if (file.size > IMAGE_UPLOAD_RULES.maxFileSizeBytes) return "Each image must be 20 MB or less.";
  if (!isSupportedImageFile(file)) return "Choose a JPG, PNG, WebP, HEIC or HEIF image.";
}

export function validateBookingField(
  field: BookingFieldName,
  values: BookingFormValues,
  token: string,
) {
  switch (field) {
    case "fullName":
      if (!values.fullName.trim()) return "Enter your full name.";
      if (values.fullName.trim().length > 120) return "Use 120 characters or fewer.";
      break;
    case "phoneNumber":
      if (!values.phoneNumber.trim()) return "Enter your phone number.";
      if (!bookingPhone(values)) return "Enter a valid phone number.";
      break;
    case "email":
      if (!z.email().max(254).safeParse(values.email.trim()).success)
        return "Enter a valid email address.";
      break;
    case "instagram":
      if (values.instagram.trim() && !/^@?[a-zA-Z0-9._]{1,30}$/.test(values.instagram.trim()))
        return "Enter an Instagram username.";
      break;
    case "preferredDate":
      if (
        values.preferredDate &&
        (!z.iso.date().safeParse(values.preferredDate).success ||
          values.preferredDate < getStudioDate())
      )
        return "Choose today or a future date in Da Nang.";
      break;
    case "description":
      if (values.description.trim().length > MAX_BOOKING_DESCRIPTION)
        return "Use 2,000 characters or fewer.";
      break;
    case "consent":
      if (!values.consent) return "Agree to the booking consent to continue.";
      break;
    case "referenceImages":
      if (values.referenceImages.length > MAX_BOOKING_IMAGES) return "Add up to five images.";
      return values.referenceImages.map(bookingFileError).find(Boolean);
    case "verification":
      if (!token) return "Complete the security check.";
      break;
  }
}
