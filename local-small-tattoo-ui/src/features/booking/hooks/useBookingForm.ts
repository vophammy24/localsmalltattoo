import { useEffect, useRef, useState, type FormEvent, type FocusEvent } from "react";
import { BookingRequestError } from "../services/bookingService";
import type {
  BookingFieldName,
  BookingFormErrors,
  BookingFormValues,
  BookingSubmission,
} from "../types/booking";
import {
  bookingFileError,
  bookingPhone,
  MAX_BOOKING_IMAGES,
  validateBookingField,
} from "../utils/bookingValidation";

const initialValues: BookingFormValues = {
  fullName: "",
  phoneNumber: "",
  country: "VN",
  email: "",
  instagram: "",
  preferredDate: "",
  description: "",
  consent: false,
  contactMethods: [],
  referenceImages: [],
  website: "",
};
const fieldOrder: BookingFieldName[] = [
  "fullName",
  "phoneNumber",
  "email",
  "instagram",
  "preferredDate",
  "referenceImages",
  "description",
  "consent",
  "verification",
];

export function useBookingForm(onSubmit: (submission: BookingSubmission) => Promise<unknown>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [token, setToken] = useState("");
  const [widgetVersion, setWidgetVersion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const key = useRef<string | undefined>(undefined);
  const submitting = useRef(false);
  const preserveFocusError = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const next = values.referenceImages.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => next.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [values.referenceImages]);

  useEffect(() => {
    if (isSuccessful) successRef.current?.focus();
  }, [isSuccessful]);

  function setError(field: BookingFieldName, message?: string) {
    setErrors((current) => ({ ...current, [field]: message }));
  }

  function update<K extends keyof BookingFormValues>(field: K, value: BookingFormValues[K]) {
    if (value === values[field]) return;
    key.current = undefined;
    setValues((current) => ({ ...current, [field]: value }));
  }

  function fieldEvents(field: BookingFieldName) {
    const movesInside = (event: FocusEvent<HTMLElement>) =>
      event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget);
    return {
      onFocus(event: FocusEvent<HTMLElement>) {
        if (!preserveFocusError.current && !movesInside(event)) setError(field);
      },
      onBlur(event: FocusEvent<HTMLElement>) {
        if (!submitting.current && !movesInside(event)) setError(field, fieldMessage(field));
      },
    };
  }

  function fieldMessage(field: BookingFieldName) {
    if (
      field === "preferredDate" &&
      formRef.current?.querySelector<HTMLInputElement>("#preferredDate")?.validity.badInput
    ) {
      return "Enter a valid preferred date.";
    }
    return validateBookingField(field, values, token);
  }

  function focusInvalid(validation: BookingFormErrors) {
    const field = fieldOrder.find((name) => validation[name]);
    if (!field) return;
    requestAnimationFrame(() => {
      const control = formRef.current?.querySelector<HTMLElement>(`#${field}`);
      if (!control) return;
      // A file input is visually hidden, so scroll its visible wrapper.
      control.closest(".booking-field")?.scrollIntoView({ block: "center" });
      preserveFocusError.current = true;
      control.focus({ preventScroll: true });
      preserveFocusError.current = false;
    });
  }

  function selectImages(files: File[]) {
    const valid = files.filter((file) => !bookingFileError(file));
    const combined = [...values.referenceImages, ...valid];
    const error =
      files.map(bookingFileError).find(Boolean) ??
      (combined.length > MAX_BOOKING_IMAGES ? "Add up to five images." : undefined);
    if (valid.length && values.referenceImages.length < MAX_BOOKING_IMAGES) {
      update("referenceImages", combined.slice(0, MAX_BOOKING_IMAGES));
    }
    setError("referenceImages", error);
  }

  function removeImage(index: number) {
    update(
      "referenceImages",
      values.referenceImages.filter((_, position) => position !== index),
    );
    setError("referenceImages");
  }

  function updateToken(next: string) {
    setToken(next);
    if (next) setError("verification");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setSubmitError("");
    const validation: BookingFormErrors = {};
    for (const field of fieldOrder) {
      const message = fieldMessage(field);
      if (message) validation[field] = message;
    }
    setErrors(validation);
    if (Object.keys(validation).length) return focusInvalid(validation);

    submitting.current = true;
    setIsSubmitting(true);
    try {
      key.current ??= crypto.randomUUID();
      await onSubmit({
        ...values,
        phoneNumber: bookingPhone(values)!,
        verification: token,
        idempotencyKey: key.current,
      });
      setValues(initialValues);
      setIsSuccessful(true);
      key.current = undefined;
    } catch (reason) {
      const backendErrors: BookingFormErrors = {};
      if (reason instanceof BookingRequestError) {
        for (const field of fieldOrder) {
          if (reason.errors[field]?.[0]) backendErrors[field] = reason.errors[field][0];
        }
      }
      setErrors(backendErrors);
      if (Object.keys(backendErrors).length) focusInvalid(backendErrors);
      else
        setSubmitError(
          reason instanceof Error ? reason.message : "Unable to submit the booking request.",
        );
    } finally {
      setToken("");
      setWidgetVersion((version) => version + 1);
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    values,
    errors,
    previews,
    token,
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
  };
}
