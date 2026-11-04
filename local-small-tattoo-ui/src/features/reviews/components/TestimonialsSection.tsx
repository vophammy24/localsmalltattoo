import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { SITE_CONFIG } from "../../../config/siteConfig";
import { getPublicReviews } from "../api/testimonialApi";
import type { PublicReviewResult, Testimonial } from "../types/testimonial";
import { TestimonialCard } from "./TestimonialCard";
function pageSize() {
  return window.innerWidth < 768 ? 1 : window.innerWidth < 1200 ? 2 : 3;
}
type Motion = { items: Testimonial[]; start: number; direction: number };
export function TestimonialsSection({ all = false }: { all?: boolean }) {
  const [size, setSize] = useState(pageSize);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PublicReviewResult>();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [start, setStart] = useState(0);
  const [motion, setMotion] = useState<Motion>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cache = useRef(new Map<number, PublicReviewResult>());
  const controller = useRef<AbortController | null>(null);
  const locked = useRef(false);
  const touch = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const update = () => setSize(pageSize());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useEffect(() => {
    const request = new AbortController();
    controller.current = request;
    cache.current.clear();
    locked.current = false;
    setMotion(undefined);
    setStart(0);
    setLoading(true);
    setError("");
    getPublicReviews(all ? page : 1, request.signal, !all && size === 1 ? 3 : 12)
      .then((data) => {
        if (request.signal.aborted) return;
        cache.current.set(all ? page : 1, data);
        setResult(data);
        setItems(all || size === 1 ? data.items : data.items.slice(0, size));
      })
      .catch((reason: Error) => {
        if (!request.signal.aborted) setError(reason.message);
      })
      .finally(() => {
        if (!request.signal.aborted) setLoading(false);
      });
    return () => request.abort();
  }, [all, page, size]);
  async function move(direction: number) {
    const total = result?.pagination.total ?? 0;
    if (all || size === 1 || total <= size || locked.current || loading) return;
    locked.current = true;
    setError("");
    const signal = controller.current!.signal;
    const next = (start + direction + total) % total;
    try {
      const indexes = Array.from({ length: size }, (_, offset) => (next + offset) % total);
      const pages = [...new Set(indexes.map((index) => Math.floor(index / 12) + 1))];
      await Promise.all(
        pages.map(async (number) => {
          if (!cache.current.has(number))
            cache.current.set(number, await getPublicReviews(number, signal));
        }),
      );
      if (signal.aborted) return;
      const upcoming = indexes.map(
        (index) => cache.current.get(Math.floor(index / 12) + 1)!.items[index % 12],
      );
      // Publication changes can invalidate a page between requests. Refresh safely.
      if (upcoming.some((item) => !item)) {
        setPage((value) => value + 1);
        return;
      }
      while (cache.current.size > 3) {
        const victim = [...cache.current.keys()].find((number) => !pages.includes(number));
        if (victim === undefined) break;
        cache.current.delete(victim);
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setItems(upcoming);
        setStart(next);
        locked.current = false;
      } else {
        setMotion({
          items: direction > 0 ? [...items, upcoming[size - 1]!] : [upcoming[0]!, ...items],
          start: next,
          direction,
        });
      }
    } catch {
      if (!signal.aborted) {
        setError("Unable to load the next reviews. Please try again.");
        locked.current = false;
      }
    }
  }
  function finish() {
    if (!motion) return;
    setItems(motion.direction > 0 ? motion.items.slice(1) : motion.items.slice(0, size));
    setStart(motion.start);
    setMotion(undefined);
    locked.current = false;
  }
  const googleSummary = result?.googleMapsSummary;
  const displayedSummary = googleSummary ?? result?.summary;
  if (!all && !loading && !error && !result?.items.length && !googleSummary) return null;
  const carousel = !all && size > 1;
  const rendered = motion?.items ?? items;
  return (
    <section
      id="customer-reviews"
      className="section testimonials-section"
      aria-labelledby="testimonials-heading"
      aria-busy={loading}
    >
      <div className="page-shell testimonials-section__inner">
        {all ? (
          <h1 id="testimonials-heading">What Our Clients Say</h1>
        ) : (
          <h2 id="testimonials-heading">What Our Clients Say</h2>
        )}
        {displayedSummary?.totalReviews ? (
          <div className="reviews-summary">
            <p>
              <span className="reviews-summary__stars" aria-hidden="true">
                {"\u2606".repeat(5)}
                <span
                  style={{
                    width: `${Math.min(5, Math.max(0, displayedSummary.averageRating ?? 0)) * 20}%`,
                  }}
                >
                  {"\u2605".repeat(5)}
                </span>
              </span>{" "}
              {displayedSummary.averageRating?.toFixed(1)} / 5
            </p>
            <p>
              Based on {displayedSummary.totalReviews} {googleSummary ? "Google Maps" : "customer"}{" "}
              {displayedSummary.totalReviews === 1 ? "review" : "reviews"}
            </p>
            {googleSummary ? (
              <p className="reviews-summary__source">
                <a href={SITE_CONFIG.links.googleReviews} target="_blank" rel="noopener noreferrer">
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
        {loading ? (
          <p role="status">Loading customer testimonials...</p>
        ) : (
          <>
            {error ? (
              <p role="status">
                {items.length ? error : "Customer testimonials are temporarily unavailable."}
              </p>
            ) : null}
            {!items.length && !error && all ? (
              <p>No customer reviews have been published yet.</p>
            ) : null}
            <div
              className={carousel ? "reviews-carousel" : undefined}
              role={carousel ? "region" : undefined}
              aria-roledescription={carousel ? "carousel" : undefined}
              aria-label={carousel ? "Customer reviews" : undefined}
              tabIndex={carousel ? 0 : undefined}
              onKeyDown={(event) => {
                if (
                  carousel &&
                  ["ArrowLeft", "ArrowRight"].includes(event.key) &&
                  !(event.target as HTMLElement).closest("a")
                ) {
                  event.preventDefault();
                  void move(event.key === "ArrowLeft" ? -1 : 1);
                }
              }}
              onTouchStart={(event) => {
                touch.current = {
                  x: event.touches[0]?.clientX ?? 0,
                  y: event.touches[0]?.clientY ?? 0,
                };
              }}
              onTouchEnd={(event) => {
                const end = event.changedTouches[0];
                if (
                  carousel &&
                  end &&
                  Math.abs(end.clientX - touch.current.x) > 50 &&
                  Math.abs(end.clientY - touch.current.y) < 40
                )
                  void move(end.clientX > touch.current.x ? -1 : 1);
              }}
            >
              <div className="reviews-carousel__viewport">
                <div
                  className={
                    "testimonials-grid" +
                    (carousel ? " reviews-track" : "") +
                    (motion
                      ? motion.direction > 0
                        ? " reviews-track--next"
                        : " reviews-track--previous"
                      : "")
                  }
                  onAnimationEnd={finish}
                >
                  {rendered.map((item, index) => {
                    const extra = !!motion && (motion.direction > 0 ? index === size : index === 0);
                    return (
                      <div
                        className="review-slide"
                        key={item._id}
                        inert={extra}
                        aria-hidden={extra || undefined}
                      >
                        <TestimonialCard item={item} />
                      </div>
                    );
                  })}
                </div>
              </div>
              {carousel && (result?.pagination.total ?? 0) > size ? (
                <nav className="reviews-controls" aria-label="Review carousel controls">
                  <button
                    className="styles-carousel__control"
                    type="button"
                    aria-label="Previous reviews"
                    onClick={() => void move(-1)}
                  >
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <span role="status">
                    Review {start + 1} of {result?.pagination.total}
                  </span>
                  <button
                    className="styles-carousel__control"
                    type="button"
                    aria-label="Next reviews"
                    onClick={() => void move(1)}
                  >
                    <ChevronRight aria-hidden="true" />
                  </button>
                </nav>
              ) : null}
            </div>
          </>
        )}
        {all && result && result.pagination.totalPages > 1 ? (
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
        <div className="location-review__buttons ">
          {!all ? (
            <Link className="button button--secondary" to="/reviews">
              View All Reviews
            </Link>
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
      </div>
    </section>
  );
}
