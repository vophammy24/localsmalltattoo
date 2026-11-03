import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SITE_CONFIG } from "../../../config/siteConfig";
import { saveTestimonial } from "../api/testimonialApi";
import type { AdminTestimonial, TestimonialValues } from "../types/testimonial";
import { studioDateTime, studioTimeToUtc } from "../utils/testimonialTime";
import { TestimonialCard } from "./TestimonialCard";
import { useState } from "react";

function validDate(value: string) {
  try {
    studioTimeToUtc(value);
    return true;
  } catch {
    return false;
  }
}
const schema = z
  .object({
    customerName: z.string().trim().min(1, "Enter a customer name.").max(120),
    rating: z.number().int().min(1).max(5),
    content: z
      .string()
      .trim()
      .min(1, "Enter testimonial content.")
      .max(5000)
      .refine((value) => !/<\/?[a-z][^>]*>/i.test(value), "Use plain text without HTML."),
    reviewDate: z.string().refine(validDate, "Enter a valid review date."),
    sourceType: z.enum(["DIRECT_CUSTOMER", "CUSTOMER_AUTHORIZED"]),
    sourceUrl: z
      .string()
      .trim()
      .max(2000)
      .refine((value) => {
        if (!value) return true;
        try {
          const url = new URL(value);
          return (
            url.protocol === "https:" &&
            !url.username &&
            !url.password &&
            !url.port &&
            ((["www.google.com", "google.com"].includes(url.hostname) &&
              (url.pathname === "/maps" || url.pathname.startsWith("/maps/"))) ||
              ["maps.google.com", "maps.app.goo.gl"].includes(url.hostname) ||
              (url.hostname === "goo.gl" && url.pathname.startsWith("/maps/")))
          );
        } catch {
          return false;
        }
      }, "Enter an HTTPS Google Maps source URL."),
    displayOrder: z.number().int().min(0).max(2147483647),
    publishFrom: z
      .string()
      .refine((value) => !value || validDate(value), "Invalid publication start."),
    publishUntil: z
      .string()
      .refine((value) => !value || validDate(value), "Invalid publication end."),
    isPublic: z.boolean(),
    isFeatured: z.boolean(),
    permissionConfirmed: z.boolean(),
    adminNote: z.string().max(5000),
  })
  .superRefine((value, ctx) => {
    if (value.isPublic && !value.permissionConfirmed)
      ctx.addIssue({
        code: "custom",
        path: ["permissionConfirmed"],
        message: "Confirm permission before publishing.",
      });
    if (value.publishFrom && value.publishUntil && value.publishFrom >= value.publishUntil)
      ctx.addIssue({ code: "custom", path: ["publishUntil"], message: "End must be after start." });
  });
type FormValues = z.infer<typeof schema>;
export function TestimonialForm({
  item,
  onSaved,
  onCancel,
}: {
  item?: AdminTestimonial;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: item
      ? {
          customerName: item.customerName,
          rating: item.rating,
          content: item.content,
          sourceType: item.sourceType,
          sourceUrl: item.sourceUrl,
          displayOrder: item.displayOrder,
          isPublic: item.isPublic,
          isFeatured: item.isFeatured,
          permissionConfirmed: item.permissionConfirmed,
          adminNote: item.adminNote,
          reviewDate: studioDateTime(item.reviewDate).slice(0, 10),
          publishFrom: item.publishFrom ? studioDateTime(item.publishFrom) : "",
          publishUntil: item.publishUntil ? studioDateTime(item.publishUntil) : "",
        }
      : {
          customerName: "",
          rating: 5,
          content: "",
          reviewDate: studioDateTime(new Date().toISOString()).slice(0, 10),
          sourceType: "DIRECT_CUSTOMER",
          sourceUrl: "",
          displayOrder: 0,
          publishFrom: "",
          publishUntil: "",
          isPublic: false,
          isFeatured: false,
          permissionConfirmed: false,
          adminNote: "",
        },
  });
  const values = watch();
  async function save(input: FormValues) {
    setError("");
    try {
      const payload: TestimonialValues = {
        ...input,
        reviewDate: studioTimeToUtc(input.reviewDate),
        publishFrom: input.publishFrom ? studioTimeToUtc(input.publishFrom) : null,
        publishUntil: input.publishUntil ? studioTimeToUtc(input.publishUntil) : null,
        isFeatured: input.isPublic && input.isFeatured,
      };
      await saveTestimonial(payload, item?._id);
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save testimonial.");
    }
  }
  const preview = schema.safeParse({ ...values, isPublic: false });
  return (
    <section className="admin-panel testimonial-editor" aria-labelledby="testimonial-editor-title">
      <h2 id="testimonial-editor-title">{item ? "Edit testimonial" : "Add testimonial"}</h2>
      <p>
        Original review date is shown publicly. Display dates control publication in{" "}
        {SITE_CONFIG.timezone}.
      </p>
      <form onSubmit={handleSubmit(save)} noValidate>
        <div className="admin-about-fields">
          <label>
            Customer name *
            <input
              {...register("customerName")}
              maxLength={120}
              aria-invalid={!!errors.customerName}
            />
          </label>
          <label>
            Rating *
            <select {...register("rating", { valueAsNumber: true })}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {"★".repeat(rating)} ({rating}/5)
                </option>
              ))}
            </select>
          </label>
          <label className="is-full">
            Testimonial content *
            <textarea
              {...register("content")}
              maxLength={5000}
              rows={5}
              aria-invalid={!!errors.content}
            />
          </label>
          <label>
            Original review date *<input type="date" {...register("reviewDate")} />
          </label>
          <label>
            Source type
            <select {...register("sourceType")}>
              <option value="DIRECT_CUSTOMER">Direct customer</option>
              <option value="CUSTOMER_AUTHORIZED">Customer authorized</option>
            </select>
          </label>
          <label className="is-full">
            Google Maps source URL (optional)
            <input type="url" {...register("sourceUrl")} placeholder="https://" />
            <small>
              Only enter an accurate source the studio is authorized to reuse. A business map link
              does not identify a specific review.
            </small>
          </label>
          <label>
            Display order
            <input type="number" min={0} {...register("displayOrder", { valueAsNumber: true })} />
          </label>
          <label>
            Display from
            <input type="datetime-local" {...register("publishFrom")} />
            <small>Empty: publish immediately when approved.</small>
          </label>
          <label>
            Display until
            <input type="datetime-local" {...register("publishUntil")} />
            <small>Empty: no expiration.</small>
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              {...register("permissionConfirmed", {
                onChange: (event) => {
                  if (!event.target.checked) {
                    setValue("isPublic", false);
                    setValue("isFeatured", false);
                  }
                },
              })}
            />
            Permission to publish confirmed
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              {...register("isPublic", {
                onChange: (event) => {
                  if (!event.target.checked) setValue("isFeatured", false);
                },
              })}
            />
            Public
          </label>
          <label className="admin-check">
            <input type="checkbox" {...register("isFeatured")} disabled={!values.isPublic} />
            Featured
          </label>
          <label className="is-full">
            Internal admin note
            <textarea {...register("adminNote")} maxLength={5000} />
          </label>
        </div>
        {Object.entries(errors).map(([field, detail]) => (
          <p className="admin-error" role="alert" key={field}>
            {detail.message}
          </p>
        ))}
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-style-form__actions">
          <button
            type="button"
            className="admin-secondary"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-secondary"
            disabled={isSubmitting}
            onClick={() => {
              setValue("isPublic", false);
              setValue("isFeatured", false);
              void handleSubmit(save)();
            }}
          >
            Save draft
          </button>
          <button className="admin-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
      <h3>Public card preview</h3>
      <p>Preview does not publish this entry.</p>
      {preview.success ? (
        <TestimonialCard
          item={{
            ...preview.data,
            _id: item?._id ?? "preview",
            reviewDate: studioTimeToUtc(preview.data.reviewDate),
          }}
        />
      ) : (
        <p>Enter a name, content, rating and valid date to preview.</p>
      )}
    </section>
  );
}
