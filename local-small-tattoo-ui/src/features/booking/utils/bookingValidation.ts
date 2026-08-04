import { BOOKING_IMAGE_RULES } from "../data/bookingOptions";
import type {
  BookingFormErrors,
  BookingFormValues,
} from "../types/booking";

const PHONE_PATTERN = /^[+0-9][0-9\s().-]{7,19}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getLocalDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDateInput(value: string): Date | null {
  const parts = value.split("-").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  const [year, month, day] = parts;
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  parsedDate.setHours(0, 0, 0, 0);
  return parsedDate;
}

export function validateBookingForm(
  values: BookingFormValues,
): BookingFormErrors {
  const errors: BookingFormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!PHONE_PATTERN.test(values.phoneNumber.trim())) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.preferredDate) {
    errors.preferredDate = "Preferred date is required.";
  } else {
    const selectedDate = parseLocalDateInput(values.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!selectedDate) {
      errors.preferredDate = "Enter a valid preferred date.";
    } else if (selectedDate < today) {
      errors.preferredDate = "Preferred date cannot be in the past.";
    }
  }

  if (values.preferredTimePeriods.length === 0) {
    errors.preferredTimePeriods = "Select at least one preferred time period.";
  }

  if (!values.description.trim()) {
    errors.description = "Description is required.";
  }

  if (!values.consent) {
    errors.consent = "You must accept the consent statement.";
  }

  if (values.referenceImages.length > BOOKING_IMAGE_RULES.maxFiles) {
    errors.referenceImages = `Upload no more than ${BOOKING_IMAGE_RULES.maxFiles} images.`;
  } else {
    const unsupportedFile = values.referenceImages.find(
      (file) => !(BOOKING_IMAGE_RULES.acceptedTypes as readonly string[]).includes(file.type),
    );
    const oversizedFile = values.referenceImages.find(
      (file) => file.size > BOOKING_IMAGE_RULES.maxFileSizeBytes,
    );

    if (unsupportedFile) {
      errors.referenceImages = "Only JPG, PNG, and WebP images are accepted.";
    } else if (oversizedFile) {
      errors.referenceImages = "Each image must be 5 MB or smaller.";
    }
  }

  return errors;
}
