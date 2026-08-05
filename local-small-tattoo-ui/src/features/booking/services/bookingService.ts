import type { BookingSubmission } from "../types/booking";

type BookingResponse = {
  success: true;
  message: string;
  data: {
    bookingCode: string;
    status: "PENDING";
  };
};

export async function createBooking(
  values: BookingSubmission,
  sourceStyleSlug?: string,
  sourceArtistSlug?: string,
) {
  const formData = new FormData();
  formData.append("fullName", values.fullName);
  formData.append("phoneNumber", values.phoneNumber);
  formData.append("email", values.email);
  formData.append("preferredDate", values.preferredDate);
  values.preferredTimePeriods.forEach((period) => {
    formData.append("preferredTimePeriods", period.toUpperCase());
  });
  formData.append("description", values.description);
  formData.append("consent", String(values.consent));
  if (sourceStyleSlug) formData.append("sourceStyleSlug", sourceStyleSlug);
  if (sourceArtistSlug) formData.append("sourceArtistSlug", sourceArtistSlug);
  values.referenceImages.forEach((image) => {
    formData.append("referenceImages", image);
  });

  const response = await fetch(
    `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api/public/bookings`,
    { method: "POST", body: formData },
  );
  const result = (await response.json().catch(() => null)) as
    BookingResponse | { message?: string } | null;

  if (!response.ok || !result || !("data" in result)) {
    throw new Error(result?.message ?? "Unable to submit booking request.");
  }
  return result;
}
