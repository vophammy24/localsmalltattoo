import { BOOKING_TIME_OPTIONS } from "../data/bookingOptions";
import { useBookingForm } from "../hooks/useBookingForm";
import type { BookingSubmission } from "../types/booking";
import { getLocalDateInputValue } from "../utils/bookingValidation";
import { BookingSuccessDialog } from "./BookingSuccessDialog";
import { ReferenceImageField } from "./ReferenceImageField";

type BookingFormProps = {
  onSubmit?: (submission: BookingSubmission) => Promise<{ data: { bookingCode: string } }>;
};

export function BookingForm({ onSubmit }: BookingFormProps) {
  const {
    values,
    errors,
    imagePreviews,
    isSubmitting,
    isSuccessOpen,
    bookingCode,
    submitError,
    setIsSuccessOpen,
    updateTextField,
    togglePreferredTimePeriod,
    updateConsent,
    updateReferenceImages,
    removeReferenceImage,
    submitForm,
  } = useBookingForm({ onSubmit });

  return (
    <>
      <form className="booking-form" onSubmit={submitForm} noValidate aria-busy={isSubmitting}>
        <fieldset className="booking-form__fieldset" disabled={isSubmitting}>
          <div className="booking-form__heading">
            <p>Booking request</p>
            <h2>Tell us about your project.</h2>
            <span>* Required fields</span>
          </div>

          <div className="booking-form__grid">
            <div className="booking-field">
              <label className="booking-field__label" htmlFor="fullName">
                Full name <span aria-hidden="true">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={values.fullName}
                onChange={updateTextField}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                placeholder="Your full name"
              />
              {errors.fullName ? (
                <p className="booking-field__error" id="fullName-error">
                  {errors.fullName}
                </p>
              ) : null}
            </div>

            <div className="booking-field">
              <label className="booking-field__label" htmlFor="phoneNumber">
                Phone number <span aria-hidden="true">*</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={values.phoneNumber}
                onChange={updateTextField}
                aria-invalid={Boolean(errors.phoneNumber)}
                aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
                placeholder="+123 456 789"
              />
              {errors.phoneNumber ? (
                <p className="booking-field__error" id="phoneNumber-error">
                  {errors.phoneNumber}
                </p>
              ) : null}
            </div>

            <div className="booking-field booking-field--full">
              <label className="booking-field__label" htmlFor="email">
                Email <span aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={updateTextField}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                placeholder="name@example.com"
              />
              {errors.email ? (
                <p className="booking-field__error" id="email-error">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <fieldset className="booking-field booking-field--full booking-schedule">
              <legend className="booking-field__label">
                Preferred date &amp; time <span aria-hidden="true">*</span>
              </legend>

              <div className="booking-schedule__date">
                <label htmlFor="preferredDate">Preferred date</label>
                <input
                  id="preferredDate"
                  name="preferredDate"
                  type="date"
                  min={getLocalDateInputValue()}
                  value={values.preferredDate}
                  onChange={updateTextField}
                  aria-invalid={Boolean(errors.preferredDate)}
                  aria-describedby={errors.preferredDate ? "preferredDate-error" : undefined}
                />
                {errors.preferredDate ? (
                  <p className="booking-field__error" id="preferredDate-error">
                    {errors.preferredDate}
                  </p>
                ) : null}
              </div>

              <div className="booking-schedule__periods">
                {BOOKING_TIME_OPTIONS.map((option) => {
                  const isSelected = values.preferredTimePeriods.includes(option.value);

                  return (
                    <label
                      className={`booking-time-option ${isSelected ? "is-selected" : ""}`}
                      key={option.value}
                    >
                      <input
                        type="checkbox"
                        name="preferredTimePeriods"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => togglePreferredTimePeriod(option.value)}
                        aria-invalid={Boolean(errors.preferredTimePeriods)}
                        aria-describedby={
                          errors.preferredTimePeriods ? "preferredTimePeriods-error" : undefined
                        }
                      />
                      <strong>{option.label}</strong>
                      <span>{option.range}</span>
                    </label>
                  );
                })}
              </div>

              {errors.preferredTimePeriods ? (
                <p className="booking-field__error" id="preferredTimePeriods-error">
                  {errors.preferredTimePeriods}
                </p>
              ) : null}

              <p className="booking-schedule__note">
                Select every period that works for you. The final appointment will be confirmed by
                phone.
              </p>
            </fieldset>

            <ReferenceImageField
              error={errors.referenceImages}
              previews={imagePreviews}
              onChange={updateReferenceImages}
              onRemove={removeReferenceImage}
            />

            <div className="booking-field booking-field--full">
              <label className="booking-field__label" htmlFor="description">
                Description <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={values.description}
                onChange={updateTextField}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "description-error" : undefined}
                placeholder="Describe your idea, placement, approximate size, style references, and any important details."
              />
              {errors.description ? (
                <p className="booking-field__error" id="description-error">
                  {errors.description}
                </p>
              ) : null}
            </div>

            <div className="booking-field booking-field--full">
              <label className={`booking-consent ${errors.consent ? "has-error" : ""}`}>
                <input
                  type="checkbox"
                  name="consent"
                  checked={values.consent}
                  onChange={updateConsent}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                />
                <span aria-hidden="true" />
                <p>
                  I confirm that the information provided is accurate and agree to be contacted by
                  phone or email regarding this booking request. <strong>*</strong>
                </p>
              </label>
              {errors.consent ? (
                <p className="booking-field__error" id="consent-error">
                  {errors.consent}
                </p>
              ) : null}
            </div>
          </div>

          <button
            className="button button--primary booking-form__submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting…" : "Submit request"}
          </button>
          {submitError ? (
            <p className="booking-form__submit-error" role="alert">
              {submitError}
            </p>
          ) : null}
        </fieldset>
      </form>

      <BookingSuccessDialog
        isOpen={isSuccessOpen}
        bookingCode={bookingCode}
        onClose={() => setIsSuccessOpen(false)}
      />
    </>
  );
}
