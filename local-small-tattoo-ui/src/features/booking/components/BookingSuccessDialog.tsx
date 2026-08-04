import { useEffect, useRef } from "react";

type BookingSuccessDialogProps = {
  isOpen: boolean;
  bookingCode: string;
  onClose: () => void;
};

export function BookingSuccessDialog({ isOpen, bookingCode, onClose }: BookingSuccessDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.classList.add("dialog-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("dialog-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="booking-dialog"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="booking-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-success-title"
      >
        <p className="booking-dialog__eyebrow">Request received</p>
        <h2 id="booking-success-title">Thank you for sharing your idea.</h2>
        <p className="booking-dialog__code">
          Booking code <strong>{bookingCode}</strong>
        </p>
        <p>
          Your request has been recorded. The studio will contact you by phone to discuss the
          details and confirm the appointment.
        </p>
        <button
          ref={closeButtonRef}
          className="button button--primary"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </section>
    </div>
  );
}
