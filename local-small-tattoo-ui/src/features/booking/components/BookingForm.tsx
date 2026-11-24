import type { InputHTMLAttributes } from "react";
import { useBookingForm } from "../hooks/useBookingForm";
import type { BookingSubmission, ContactMethod } from "../types/booking";
import { getStudioDate, MAX_BOOKING_DESCRIPTION } from "../utils/bookingValidation";
import { BookingVerification } from "./BookingVerification";
import { InternationalPhoneField } from "./InternationalPhoneField";
import { ReferenceImageField } from "./ReferenceImageField";

function FieldError({ field, error }: { field: string; error?: string }) {
  return (
    <p className="booking-field__error" id={`${field}-error`} aria-live="polite">
      {error}
    </p>
  );
}

const textFields: {
  name: "fullName" | "email" | "instagram" | "preferredDate";
  label: string;
  input: InputHTMLAttributes<HTMLInputElement>;
}[] = [
  {
    name: "fullName",
    label: "Full name",
    input: { autoComplete: "name", placeholder: "Your full name", required: true, maxLength: 120 },
  },
  {
    name: "email",
    label: "Email",
    input: {
      type: "email",
      autoComplete: "email",
      placeholder: "name@example.com",
      required: true,
      maxLength: 254,
    },
  },
  {
    name: "instagram",
    label: "Instagram",
    input: { placeholder: "@username", autoComplete: "off", maxLength: 31 },
  },
  { name: "preferredDate", label: "Preferred date", input: { type: "date" } },
];
const contactMethods: { value: ContactMethod; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "zalo", label: "Zalo" },
];

export function BookingForm({
  onSubmit,
}: {
  onSubmit: (submission: BookingSubmission) => Promise<unknown>;
}) {
  const {
    values,
    errors,
    previews,
    widgetVersion,
    isSubmitting,
    isSuccessful,
    submitError,
    formRef,
    successRef,
    update,
    fieldEvents,
    selectImages,
    removeImage,
    updateToken,
    submit,
  } = useBookingForm(onSubmit);

  if (isSuccessful)
    return (
      <p className="booking-success" role="status" tabIndex={-1} ref={successRef}>
        Thank you! We've received your booking request. Our team will contact you to confirm your
        appointment.
      </p>
    );

  function renderTextField({ name, label, input }: (typeof textFields)[number]) {
    return (
      <div className="booking-field" key={name} {...fieldEvents(name)}>
        <label className="booking-field__label" htmlFor={name}>
          {label} {input.required ? <span aria-hidden="true">*</span> : <span>Optional</span>}
        </label>
        <input
          type="text"
          {...input}
          id={name}
          name={name}
          value={values[name]}
          min={name === "preferredDate" ? getStudioDate() : undefined}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={`${name}-error`}
          onChange={(event) => update(name, event.target.value)}
        />
        <FieldError field={name} error={errors[name]} />
      </div>
    );
  }

  return (
    <form
      className="booking-form"
      ref={formRef}
      onSubmit={submit}
      noValidate
      aria-busy={isSubmitting}
    >
      <fieldset className="booking-form__fieldset" disabled={isSubmitting}>
        <div className="booking-form__heading">
          <h2>Booking request</h2>
          <span>* Required fields</span>
        </div>
        <div className="booking-form__grid">
          {renderTextField(textFields[0]!)}
          <div className="booking-field" {...fieldEvents("phoneNumber")}>
            <label className="booking-field__label" htmlFor="phoneNumber">
              Phone number <span aria-hidden="true">*</span>
            </label>
            <InternationalPhoneField
              country={values.country}
              value={values.phoneNumber}
              invalid={Boolean(errors.phoneNumber)}
              onCountry={(country) => update("country", country)}
              onChange={(value) => update("phoneNumber", value)}
            />
            <FieldError field="phoneNumber" error={errors.phoneNumber} />
            <p id="phoneNumber-help" className="booking-field__hint">
              WhatsApp or Zalo preferred.
            </p>
            <div
              className="booking-contact-methods"
              role="group"
              aria-label="Available contact methods (optional)"
              aria-describedby={errors.contactMethods ? "contactMethods-error" : undefined}
            >
              {contactMethods.map(({ value, label }) => (
                <label key={value}>
                  <input
                    type="checkbox"
                    id={value === "whatsapp" ? "contactMethods" : undefined}
                    checked={values.contactMethods.includes(value)}
                    onChange={(event) =>
                      update(
                        "contactMethods",
                        event.target.checked
                          ? [...values.contactMethods, value]
                          : values.contactMethods.filter((method) => method !== value),
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            {errors.contactMethods ? (
              <FieldError field="contactMethods" error={errors.contactMethods} />
            ) : null}
          </div>
          {textFields.slice(1).map(renderTextField)}
          <ReferenceImageField
            error={errors.referenceImages}
            previews={previews}
            onChange={(event) => {
              selectImages(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
            onRemove={removeImage}
          />
          <div className="booking-field booking-field--full" {...fieldEvents("description")}>
            <label className="booking-field__label" htmlFor="description">
              Description <span>Optional</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={values.description}
              placeholder="Tell us about your tattoo idea."
              rows={4}
              maxLength={MAX_BOOKING_DESCRIPTION}
              aria-invalid={Boolean(errors.description)}
              aria-describedby="description-error"
              onChange={(event) => update("description", event.target.value)}
            />
            <FieldError field="description" error={errors.description} />
          </div>
          <div className="booking-field booking-field--full" {...fieldEvents("consent")}>
            <label className={`booking-consent${errors.consent ? " has-error" : ""}`}>
              <input
                id="consent"
                name="consent"
                type="checkbox"
                required
                checked={values.consent}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby="consent-error"
                onChange={(event) => update("consent", event.target.checked)}
              />
              <span aria-hidden="true" />
              <p>
                I agree to the use of my information for booking purposes only.{" "}
                <strong aria-hidden="true">*</strong>
              </p>
            </label>
            <FieldError field="consent" error={errors.consent} />
          </div>
          <div className="booking-field booking-field--full">
            <div
              id="verification"
              role="group"
              aria-label="Booking security check"
              tabIndex={-1}
              aria-describedby="verification-error"
            >
              <BookingVerification key={widgetVersion} onToken={updateToken} />
            </div>
            <FieldError field="verification" error={errors.verification} />
          </div>
        </div>
        <div hidden aria-hidden="true">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(event) => update("website", event.target.value)}
          />
        </div>
        <button
          className="button button--primary booking-form__submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "SEND BOOKING REQUEST"}
        </button>
        {submitError ? (
          <p className="booking-form__submit-error" role="alert">
            {submitError}
          </p>
        ) : null}
      </fieldset>
    </form>
  );
}
