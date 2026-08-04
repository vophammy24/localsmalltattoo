import { BookingForm } from "../features/booking/components/BookingForm";
import { StudioInformation } from "../features/booking/components/StudioInformation";
import { createBooking } from "../features/booking/services/bookingService";

export function BookingPage() {
  return (
    <div className="booking-page">
      <section className="booking-content" aria-label="Booking request form">
        <div className="page-shell booking-content__grid">
          <StudioInformation />
          <BookingForm onSubmit={createBooking} />
        </div>
      </section>
    </div>
  );
}
