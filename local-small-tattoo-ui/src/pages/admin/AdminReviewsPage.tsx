import { useEffect, useState } from "react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import {
  deleteTestimonial,
  getAdminReviews,
  updateTestimonial,
} from "../../features/reviews/api/testimonialApi";
import type { AdminReviewResult, AdminTestimonial } from "../../features/reviews/types/testimonial";
import { TestimonialForm } from "../../features/reviews/components/TestimonialForm";
import { TestimonialCard } from "../../features/reviews/components/TestimonialCard";
import { formatReviewDate, publicationStatus } from "../../features/reviews/utils/testimonialTime";
import { GoogleReviewSummaryForm } from "../../features/reviews/components/GoogleReviewSummaryForm";

export function AdminReviewsPage() {
  const [result, setResult] = useState<AdminReviewResult>();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("order");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState<AdminTestimonial | "new" | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const timer = window.setTimeout(() => {
      void getAdminReviews(
        new URLSearchParams({ status, search, sort, page: String(page), limit: "12" }).toString(),
      )
        .then((data) => {
          if (!active) return;
          if (page > data.pagination.totalPages) setPage(data.pagination.totalPages);
          else setResult(data);
        })
        .catch((reason: Error) => {
          if (active) setError(reason.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [status, search, sort, page, revision]);
  async function action(task: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await task();
      setRevision((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <AdminPageHeader
        title="Customer testimonials"
        description="Manually authorized customer feedback. No Google synchronization."
        action={
          <button className="admin-primary" onClick={() => setEditor("new")}>
            + Add testimonial
          </button>
        }
      />
      <GoogleReviewSummaryForm />
      {editor ? (
        <TestimonialForm
          key={editor === "new" ? "new" : editor._id}
          item={editor === "new" ? undefined : editor}
          onCancel={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setRevision((value) => value + 1);
          }}
        />
      ) : null}
      {result ? (
        <section className="admin-stats">
          {Object.entries(result.counts).map(([label, value]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>
      ) : null}
      <div className="admin-filters">
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            {["all", "published", "draft", "scheduled", "expired", "featured"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Search
          <input
            type="search"
            placeholder="Customer name or content"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          Sort
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="order">Display order</option>
            <option value="date">Review date</option>
            <option value="name">Customer name</option>
          </select>
        </label>
      </div>
      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p role="status">Loading testimonials…</p>
      ) : !error && !result?.items.length ? (
        <p className="admin-panel">
          No testimonials match. Add authorized customer feedback to begin.
        </p>
      ) : null}
      {!loading ? (
        <div className="admin-testimonial-list">
          {result?.items.map((item) => (
            <article className="admin-panel" key={item._id}>
              <div className="review-card__header">
                <strong>{item.customerName}</strong>
                <span aria-label={`${item.rating} out of 5 stars`}>{"★".repeat(item.rating)}</span>
              </div>
              <p className="testimonial-excerpt">{item.content}</p>
              <p>
                Review date: {formatReviewDate(item.reviewDate)} · {publicationStatus(item)}
                {item.isFeatured ? " · Featured" : ""} · Order: {item.displayOrder}
              </p>
              {item.sourceUrl ? (
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                  View on Google Maps ↗
                </a>
              ) : null}
              <div className="testimonial-actions">
                <button className="admin-secondary" disabled={busy} onClick={() => setEditor(item)}>
                  Edit
                </button>
                <button
                  className="admin-secondary"
                  onClick={() => setPreview(preview === item._id ? null : item._id)}
                  aria-expanded={preview === item._id}
                >
                  Preview
                </button>
                <button
                  className="admin-secondary"
                  disabled={busy || (!item.isPublic && !item.permissionConfirmed)}
                  title={
                    !item.permissionConfirmed
                      ? "Edit and confirm permission before publishing"
                      : undefined
                  }
                  onClick={() =>
                    void action(() => updateTestimonial(item._id, { isPublic: !item.isPublic }))
                  }
                >
                  {item.isPublic ? "Hide" : "Publish"}
                </button>
                <button
                  className="admin-secondary"
                  disabled={busy || !item.isPublic}
                  onClick={() =>
                    void action(() => updateTestimonial(item._id, { isFeatured: !item.isFeatured }))
                  }
                >
                  {item.isFeatured ? "Unfeature" : "Feature"}
                </button>
                <button
                  className="admin-secondary"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete testimonial by ${item.customerName}? This cannot be undone.`,
                      )
                    )
                      void action(() => deleteTestimonial(item._id));
                  }}
                >
                  Delete
                </button>
              </div>
              {preview === item._id ? <TestimonialCard item={item} /> : null}
            </article>
          ))}
        </div>
      ) : null}
      {result && result.pagination.totalPages > 1 ? (
        <nav className="gallery-pagination" aria-label="Admin testimonial pages">
          <button disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            {page} / {result.pagination.totalPages}
          </span>
          <button
            disabled={loading || page >= result.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </nav>
      ) : null}
    </>
  );
}
