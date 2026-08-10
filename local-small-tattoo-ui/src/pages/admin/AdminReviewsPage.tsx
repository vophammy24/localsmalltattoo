import { useEffect, useState } from "react";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import {
  disconnectGoogleBusiness,
  getAdminGoogleReviews,
  getGoogleBusinessStatus,
  googleBusinessConnectUrl,
  saveGoogleReviewModeration,
  syncGoogleReviews,
  type GoogleReview,
} from "../../features/reviews/api/googleReviewsApi";

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getGoogleBusinessStatus>>>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = () =>
    Promise.all([getGoogleBusinessStatus(), getAdminGoogleReviews()])
      .then(([connection, data]) => {
        setStatus(connection);
        setReviews(data.reviews);
      })
      .catch((reason: Error) => setError(reason.message));
  useEffect(() => {
    void load();
  }, []);
  async function sync() {
    setBusy(true);
    try {
      await syncGoogleReviews();
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sync reviews.");
    } finally {
      setBusy(false);
    }
  }
  async function moderate(review: GoogleReview, change: Partial<GoogleReview["moderation"]>) {
    try {
      const result = await saveGoogleReviewModeration(review._id, {
        ...review.moderation,
        ...change,
      });
      setReviews((items) => items.map((item) => (item._id === review._id ? result.review : item)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save review.");
    }
  }
  return (
    <>
      <AdminPageHeader
        title="Google Reviews"
        description="Sync Google feedback, then decide which reviews appear publicly."
      />
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-panel">
        <h2>Google Business Profile</h2>
        {!status?.configured ? (
          <p>
            Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI to the API
            environment first.
          </p>
        ) : status.connection ? (
          <>
            <p>
              Connected: <strong>{status.connection.accountName}</strong> —{" "}
              {status.connection.locationName}
            </p>
            <p>
              Last sync:{" "}
              {status.connection.lastSyncedAt
                ? new Date(status.connection.lastSyncedAt).toLocaleString()
                : "Never"}
            </p>
            <button className="admin-primary" disabled={busy} onClick={() => void sync()}>
              {busy ? "Syncing…" : "Sync from Google"}
            </button>
            <button
              className="admin-secondary"
              onClick={() => void disconnectGoogleBusiness().then(load)}
            >
              Disconnect
            </button>
          </>
        ) : (
          <a className="admin-primary" href={googleBusinessConnectUrl}>
            Connect Google
          </a>
        )}
      </section>
      <section className="admin-panel">
        <h2>Review moderation</h2>
        <p>New reviews are hidden until an admin publishes them.</p>
        <div className="admin-review-list">
          {reviews.map((review) => (
            <article className="admin-review-card" key={review._id}>
              <strong>{review.reviewer.displayName || "Google user"}</strong>
              <span>{"★".repeat(review.starRating)}</span>
              <p>{review.comment || "No written review."}</p>
              <label>
                <input
                  type="checkbox"
                  checked={review.moderation.isPublic}
                  onChange={(e) =>
                    void moderate(review, {
                      isPublic: e.target.checked,
                      isFeatured: e.target.checked ? review.moderation.isFeatured : false,
                    })
                  }
                />{" "}
                Public
              </label>
              <label>
                <input
                  type="checkbox"
                  disabled={!review.moderation.isPublic}
                  checked={review.moderation.isFeatured}
                  onChange={(e) => void moderate(review, { isFeatured: e.target.checked })}
                />{" "}
                Featured
              </label>
              <label>
                Order{" "}
                <input
                  type="number"
                  value={review.moderation.displayOrder}
                  onChange={(e) => void moderate(review, { displayOrder: Number(e.target.value) })}
                />
              </label>
              {review.resourceName ? (
                <a
                  href={`https://business.google.com/reviews/${review.resourceName.split("/").pop()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Google
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
