export type BookingTimePeriod = "morning" | "noon" | "afternoon" | "evening";

export type BookingFormValues = {
  fullName: string;
  phoneNumber: string;
  email: string;
  preferredDate: string;
  preferredTimePeriods: BookingTimePeriod[];
  description: string;
  consent: boolean;
  referenceImages: File[];
};

export type BookingFieldName = keyof BookingFormValues;

export type BookingFormErrors = Partial<
  Record<Exclude<BookingFieldName, "referenceImages"> | "referenceImages", string>
>;

export type BookingSubmission = BookingFormValues;
