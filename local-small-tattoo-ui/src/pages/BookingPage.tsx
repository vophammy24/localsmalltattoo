import { BookingForm } from "../features/booking/components/BookingForm";
import { StudioInformation } from "../features/booking/components/StudioInformation";
import { createBooking } from "../features/booking/services/bookingService";
import { useSearchParams } from "react-router";

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const sourceStyleSlug = searchParams.get("style") ?? undefined;
  return (
    <div className="booking-page">
      <section className="booking-content" aria-label="Booking request form">
        <div className="page-shell booking-content__grid">
          <StudioInformation />
          <BookingForm onSubmit={(submission) => createBooking(submission, sourceStyleSlug)} />
        </div>
      </section>
    </div>
  );
}
