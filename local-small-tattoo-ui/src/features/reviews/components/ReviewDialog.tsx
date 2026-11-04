import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Testimonial } from "../types/testimonial";
import { ReviewDate } from "./ReviewDate";
import { ReviewSource } from "./ReviewSource";
export function ReviewDialog({ item, onClose }: { item: Testimonial; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      className="review-dialog"
      aria-labelledby="review-dialog-title"
      onTouchStart={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex="0"]',
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            onClose();
        }
      }}
    >
      <div className="review-dialog__heading">
        <h2 id="review-dialog-title">Customer review</h2>
        <button type="button" aria-label="Close review" onClick={onClose} autoFocus>
          &times;
        </button>
      </div>
      <h3>{item.customerName}</h3>
      <p aria-label={item.rating + " out of 5 stars"}>{"\u2605".repeat(item.rating)}</p>
      <div className="review-dialog__body">{item.content}</div>
      <ReviewDate value={item.reviewDate} />
      <ReviewSource url={item.sourceUrl} />
      <button className="button button--secondary" type="button" onClick={onClose}>
        Close
      </button>
    </dialog>,
    document.body,
  );
}
