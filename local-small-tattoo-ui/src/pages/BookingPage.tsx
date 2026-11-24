import { lazy, Suspense } from "react";
import { StudioInformation } from "../features/booking/components/StudioInformation";
import { createBooking } from "../features/booking/services/bookingService";
import { useSearchParams } from "react-router";
import { PageHero } from "../components/common/PageHero";
import { Seo } from "../components/seo/Seo";

const BookingForm = lazy(() =>
  import("../features/booking/components/BookingForm").then((module) => ({
    default: module.BookingForm,
  })),
);

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const sourceStyleSlug = searchParams.get("style") ?? undefined;
  return (
    <div className="booking-page">
      <Seo
        title="Book a Tattoo Appointment | Local Small Tattoo Da Nang"
        description="Request a tattoo appointment at Local Small Tattoo in Da Nang. Share your idea, preferred dates and reference images with our team."
        path="/booking"
      />
      <PageHero
        className="booking-hero"
        title="Begin your piece"
        description="Share your idea, preferred dates and references. Our team will contact you to confirm the consultation."
      />
      <section className="booking-content" aria-label="Booking request form">
        <div className="page-shell booking-content__grid">
          <StudioInformation />
          <Suspense fallback={<p role="status">Loading booking form…</p>}>
            <BookingForm onSubmit={(submission) => createBooking(submission, sourceStyleSlug)} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
