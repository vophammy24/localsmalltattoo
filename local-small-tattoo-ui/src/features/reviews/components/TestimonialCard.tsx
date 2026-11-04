import { useEffect, useRef, useState } from "react";
import type { Testimonial } from "../types/testimonial";
import { ReviewDate } from "./ReviewDate";
import { ReviewDialog } from "./ReviewDialog";
import { ReviewSource } from "./ReviewSource";
export function TestimonialCard({ item }: { item: Testimonial }) {
  const content = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const measure = () => setTruncated(element.scrollHeight > element.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    let disposed = false;
    void document.fonts.ready.then(() => {
      if (!disposed) measure();
    });
    measure();
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [item.content]);
  return (
    <>
      <article
        className="review-card"
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest("a, button")) {
            event.currentTarget.querySelector("button")?.focus();
            setOpen(true);
          }
        }}
      >
        <button
          type="button"
          className="review-card__detail"
          aria-label={"Read review by " + item.customerName}
          onClick={() => setOpen(true)}
        >
          <span className="review-card__header">
            <strong>{item.customerName}</strong>
            <span role="img" aria-label={item.rating + " out of 5 stars"}>
              {"\u2605".repeat(item.rating)}
              <span aria-hidden="true">{"\u2606".repeat(5 - item.rating)}</span>
            </span>
          </span>
          <span ref={content} className="review-card__content">
            {item.content}
          </span>
          {truncated ? <span className="review-card__more">Read More</span> : null}
        </button>
        <ReviewDate value={item.reviewDate} />
        <ReviewSource url={item.sourceUrl} />
      </article>
      {open ? <ReviewDialog item={item} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
