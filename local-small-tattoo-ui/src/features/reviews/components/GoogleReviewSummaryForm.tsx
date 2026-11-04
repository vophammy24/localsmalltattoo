import { useEffect, useState, type FormEvent } from "react";
import { SITE_CONFIG } from "../../../config/siteConfig";
import { getGoogleReviewSummary, saveGoogleReviewSummary } from "../api/testimonialApi";
import type { AdminGoogleReviewSummary } from "../types/testimonial";

export function GoogleReviewSummaryForm() {
  const [summary, setSummary] = useState<AdminGoogleReviewSummary>();
  const [enabled, setEnabled] = useState(false);
  const [rating, setRating] = useState("");
  const [count, setCount] = useState("0");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    getGoogleReviewSummary()
      .then(({ summary }) => {
        if (!active) return;
        setSummary(summary);
        setEnabled(summary.enabled);
        setRating(summary.averageRating == null ? "" : String(summary.averageRating));
        setCount(String(summary.totalReviews));
      })
      .catch((reason: Error) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await saveGoogleReviewSummary({
        enabled,
        averageRating: rating === "" ? null : Number(rating),
        totalReviews: Number(count),
      });
      setSummary(result.summary);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save Google Maps rating.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="admin-panel business-form" aria-labelledby="google-review-summary-heading">
      <h2 id="google-review-summary-heading">Google Maps rating summary</h2>
      <p>
        Copy the current average rating and total review count from Google Maps. Individual
        testimonials can be added separately below.
      </p>
      <a href={SITE_CONFIG.links.googleReviews} target="_blank" rel="noopener noreferrer">
        Open Google Maps
      </a>
      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      {!summary ? (
        error ? (
          <button
            type="button"
            className="admin-secondary"
            onClick={() => setRevision((value) => value + 1)}
          >
            Retry loading rating summary
          </button>
        ) : (
          <p role="status">Loading rating summary...</p>
        )
      ) : (
        <form onSubmit={(event) => void save(event)}>
          <fieldset disabled={saving} className="google-review-summary-fields">
            <div className="admin-about-fields">
              <label>
                Average Google Maps rating
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  required={enabled}
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                />
              </label>
              <label>
                Total Google Maps reviews
                <input
                  type="number"
                  min={enabled ? 1 : 0}
                  max="2147483647"
                  step="1"
                  required
                  value={count}
                  onChange={(event) => setCount(event.target.value)}
                />
              </label>
            </div>
            <label className="google-review-summary-toggle">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
              />
              Show Google Maps rating summary
            </label>
            <p>
              When enabled, the public summary uses these numbers and is marked as manually updated.
              When disabled, it uses published customer testimonials.
            </p>
            {summary.updatedAt ? (
              <p>
                Last updated:{" "}
                <time dateTime={summary.updatedAt}>
                  {new Intl.DateTimeFormat("en-GB", {
                    timeZone: SITE_CONFIG.timezone,
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(summary.updatedAt))}
                </time>
              </p>
            ) : null}
            <button className="admin-primary" type="submit">
              {saving ? "Saving..." : "Save Google Maps summary"}
            </button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
