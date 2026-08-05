import { BookingForm } from "../features/booking/components/BookingForm";
import { StudioInformation } from "../features/booking/components/StudioInformation";
import { createBooking } from "../features/booking/services/bookingService";
import { useSearchParams } from "react-router";
import { PageHero } from "../components/common/PageHero";

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const sourceStyleSlug = searchParams.get("style") ?? undefined;
  const sourceArtistSlug = searchParams.get("artist") ?? undefined;
  return (
    <div className="booking-page">
      <PageHero
        className="booking-hero"
        title="Begin your piece"
        description="Share your idea, preferred dates and references. Our team will contact you to confirm the consultation."
      />
      <section className="booking-content" aria-label="Booking request form">
        <div className="page-shell booking-content__grid">
          <StudioInformation />
          <BookingForm
            onSubmit={(submission) => createBooking(submission, sourceStyleSlug, sourceArtistSlug)}
          />
        </div>
      </section>
    </div>
  );
}
