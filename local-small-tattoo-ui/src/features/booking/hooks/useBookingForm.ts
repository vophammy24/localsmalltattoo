import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  BookingFieldName,
  BookingFormErrors,
  BookingFormValues,
  BookingSubmission,
  BookingTimePeriod,
} from "../types/booking";
import { validateBookingForm } from "../utils/bookingValidation";

const INITIAL_VALUES: BookingFormValues = {
  fullName: "",
  phoneNumber: "",
  email: "",
  preferredDate: "",
  preferredTimePeriods: [],
  referenceImages: [],
  description: "",
  consent: false,
};

type UseBookingFormOptions = {
  onSubmit?: (submission: BookingSubmission) => Promise<{ data: { bookingCode: string } }>;
};

export function useBookingForm({ onSubmit }: UseBookingFormOptions = {}) {
  const [values, setValues] = useState<BookingFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [submitError, setSubmitError] = useState("");

  const imagePreviews = useMemo(
    () =>
      values.referenceImages.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [values.referenceImages],
  );

  useEffect(
    () => () => {
      imagePreviews.forEach(({ url }) => URL.revokeObjectURL(url));
    },
    [imagePreviews],
  );

  function clearFieldError(fieldName: keyof BookingFormErrors) {
    setErrors((current) => {
      if (!current[fieldName]) {
        return current;
      }

      const next = { ...current };
      delete next[fieldName];
      return next;
    });
  }

  function updateTextField(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    const fieldName = name as BookingFieldName;

    setValues((current) => ({
      ...current,
      [fieldName]: value,
    }));
    clearFieldError(fieldName as keyof BookingFormErrors);
  }

  function togglePreferredTimePeriod(value: BookingTimePeriod) {
    setValues((current) => ({
      ...current,
      preferredTimePeriods: current.preferredTimePeriods.includes(value)
        ? current.preferredTimePeriods.filter((period) => period !== value)
        : [...current.preferredTimePeriods, value],
    }));
    clearFieldError("preferredTimePeriods");
  }

  function updateConsent(event: ChangeEvent<HTMLInputElement>) {
    setValues((current) => ({
      ...current,
      consent: event.target.checked,
    }));
    clearFieldError("consent");
  }

  function updateReferenceImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    setValues((current) => ({
      ...current,
      referenceImages: files,
    }));
    clearFieldError("referenceImages");
  }

  function removeReferenceImage(index: number) {
    setValues((current) => ({
      ...current,
      referenceImages: current.referenceImages.filter(
        (_, fileIndex) => fileIndex !== index,
      ),
    }));
    clearFieldError("referenceImages");
  }

  function resetForm() {
    setValues(INITIAL_VALUES);
    setErrors({});
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateBookingForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalidField = event.currentTarget.querySelector<HTMLElement>(
        "[aria-invalid='true']",
      );
      firstInvalidField?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const submission: BookingSubmission = {
        ...values,
        fullName: values.fullName.trim(),
        phoneNumber: values.phoneNumber.trim(),
        email: values.email.trim(),
        description: values.description.trim(),
        referenceImages: values.referenceImages,
      };

      if (!onSubmit) {
        throw new Error("Booking service is not configured.");
      }
      const result = await onSubmit(submission);
      setBookingCode(result.data.bookingCode);
      setIsSuccessOpen(true);
      resetForm();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit booking request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
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
  };
}
