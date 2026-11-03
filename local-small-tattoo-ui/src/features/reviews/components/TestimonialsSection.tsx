import { useEffect, useState } from "react";
import { SITE_CONFIG } from "../../../config/siteConfig";
import { getPublicReviews } from "../api/testimonialApi";
import type { ReviewResult } from "../types/testimonial";
import { TestimonialCard } from "./TestimonialCard";
export function TestimonialsSection() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ReviewResult>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getPublicReviews(page, controller.signal)
      .then(setResult)
      .catch((reason: Error) => {
        if (!controller.signal.aborted) setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page]);
  if (!loading && !error && !result?.items.length) return null;
  return (
    <section
      id="customer-reviews"
      className="section testimonials-section page-shell"
      aria-labelledby="testimonials-heading"
      aria-busy={loading}
    >
      <p>Customer Reviews</p>
      <h2 id="testimonials-heading">What Our Clients Say</h2>
      {loading ? (
        <p role="status">Loading customer testimonials…</p>
      ) : error ? (
        <p role="status">Customer testimonials are temporarily unavailable.</p>
      ) : (
        <div className="testimonials-grid">
          {result?.items.map((item) => (
            <TestimonialCard item={item} key={item._id} />
          ))}
        </div>
      )}
      {result && result.pagination.totalPages > 1 ? (
        <nav className="gallery-pagination" aria-label="Testimonial pages">
          <button type="button" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span aria-live="polite">
            {page} / {result.pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={loading || page >= result.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </nav>
      ) : null}
      <div className="location-review__buttons">
        {SITE_CONFIG.links.googleReviews ? (
          <a
            className="button button--secondary"
            href={SITE_CONFIG.links.googleReviews}
            target="_blank"
            rel="noopener noreferrer"
          >
            View all reviews on Google Maps
          </a>
        ) : null}
        {SITE_CONFIG.links.writeGoogleReview ? (
          <a
            className="button button--secondary"
            href={SITE_CONFIG.links.writeGoogleReview}
            target="_blank"
            rel="noopener noreferrer"
          >
            Leave us a review
          </a>
        ) : null}
      </div>
    </section>
  );
}
