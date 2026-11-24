import type { CountryCode } from "libphonenumber-js";

export type ContactMethod = "whatsapp" | "zalo";
export type BookingFormValues = {
  fullName: string;
  phoneNumber: string;
  country: CountryCode;
  email: string;
  instagram: string;
  preferredDate: string;
  description: string;
  consent: boolean;
  contactMethods: ContactMethod[];
  referenceImages: File[];
  website: string;
};
export type BookingFieldName =
  Exclude<keyof BookingFormValues, "country" | "website"> | "verification";
export type BookingFormErrors = Partial<Record<BookingFieldName, string>>;
export type BookingSubmission = Omit<BookingFormValues, "country"> & {
  verification: string;
  idempotencyKey: string;
};
