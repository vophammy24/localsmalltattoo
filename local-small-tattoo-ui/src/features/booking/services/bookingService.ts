import type { BookingSubmission } from "../types/booking";

type BookingResponse = {
  success: true;
  data: { bookingCode: string; status: string };
};

export class BookingRequestError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

export async function createBooking(values: BookingSubmission, sourceStyleSlug?: string) {
  const formData = new FormData();
  formData.set("fullName", values.fullName);
  formData.set("phoneNumber", values.phoneNumber);
  formData.set("email", values.email);
  formData.set("consent", String(values.consent));
  formData.set("website", values.website);
  for (const key of ["instagram", "preferredDate", "description"] as const) {
    const value = values[key].trim();
    if (value) formData.set(key, value);
  }
  for (const method of values.contactMethods) formData.append("contactMethods", method);
  if (
    sourceStyleSlug &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sourceStyleSlug) &&
    sourceStyleSlug.length <= 120
  ) {
    formData.set("sourceStyleSlug", sourceStyleSlug);
  }
  for (const image of values.referenceImages) formData.append("referenceImages", image);

  let response: Response;
  try {
    response = await fetch(
      `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api/public/bookings`,
      {
        method: "POST",
        body: formData,
        headers: {
          "X-Turnstile-Token": values.verification,
          "Idempotency-Key": values.idempotencyKey,
        },
      },
    );
  } catch {
    throw new BookingRequestError("Could not reach the booking service. Please try again.");
  }
  const result = (await response.json().catch(() => null)) as
    BookingResponse | { message?: string; errors?: Record<string, string[]> } | null;
  if (!response.ok || !result || !("data" in result)) {
    const error = result && !("data" in result) ? result : undefined;
    throw new BookingRequestError(
      error?.message ?? "Unable to submit the booking request.",
      error?.errors,
    );
  }
  return result;
}
