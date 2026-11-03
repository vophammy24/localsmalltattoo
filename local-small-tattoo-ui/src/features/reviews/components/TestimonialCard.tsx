import type { Testimonial } from "../types/testimonial";
import { formatReviewDate } from "../utils/testimonialTime";
export function TestimonialCard({ item }: { item: Testimonial }) {
  const body = (
    <>
      <div className="review-card__header">
        <strong>{item.customerName}</strong>
        <span role="img" aria-label={`${item.rating} out of 5 stars`}>
          {"★".repeat(item.rating)}
          <span aria-hidden="true">{"☆".repeat(5 - item.rating)}</span>
        </span>
      </div>
      <p>{item.content}</p>
      <time dateTime={item.reviewDate}>{formatReviewDate(item.reviewDate)}</time>
      {item.sourceUrl ? <span className="review-card__source">View on Google Maps ↗</span> : null}
    </>
  );
  return item.sourceUrl ? (
    <a className="review-card" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <article className="review-card">{body}</article>
  );
}
