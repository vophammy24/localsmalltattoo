import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { adminAction, adminRequest } from "../../features/admin/adminApi";
import type { Booking, BookingStatus, TimePeriods } from "../../features/admin/types";

const nextStatuses: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONTACTED", "CANCELLED"],
  CONTACTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  SCHEDULED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

function normalizeBooking(input: Booking & { preferredTimePeriod?: string }): Booking {
  return {
    ...input,
    preferredTimePeriods:
      input.preferredTimePeriods ?? (input.preferredTimePeriod ? [input.preferredTimePeriod] : []),
    referenceImages: input.referenceImages ?? [],
    adminNotes: input.adminNotes ?? [],
    statusHistory:
      input.statusHistory?.length > 0
        ? input.statusHistory
        : [{ toStatus: input.status, note: "", changedAt: input.createdAt }],
  };
}

export function AdminBookingDetailPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [periods, setPeriods] = useState<TimePeriods>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [scheduleNote, setScheduleNote] = useState("");
  const [note, setNote] = useState("");
  const load = useCallback(
    () =>
      adminRequest<{ booking: Booking; timePeriods: TimePeriods }>(`/bookings/${bookingId}`)
        .then((data) => {
          setBooking(normalizeBooking(data.booking));
          setPeriods(data.timePeriods);
        })
        .catch((e: Error) => setError(e.message)),
    [bookingId],
  );
  useEffect(() => {
    void load();
  }, [load]);
  async function action(task: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await task();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  function updateStatus(e: FormEvent) {
    e.preventDefault();
    void action(() =>
      adminAction(`/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note: statusNote }),
      }),
    );
  }
  function schedule(e: FormEvent) {
    e.preventDefault();
    void action(() =>
      adminAction(`/bookings/${bookingId}/schedule`, {
        method: "PATCH",
        body: JSON.stringify({
          startAt: `${startAt}:00+07:00`,
          endAt: `${endAt}:00+07:00`,
          note: scheduleNote,
        }),
      }),
    );
  }
  function addNote(e: FormEvent) {
    e.preventDefault();
    void action(async () => {
      await adminAction(`/bookings/${bookingId}/notes`, {
        method: "POST",
        body: JSON.stringify({ content: note }),
      });
      setNote("");
    });
  }
  if (!booking)
    return (
      <>
        {error ? (
          <p className="admin-error">{error}</p>
        ) : (
          <p className="admin-loading">Loading booking...</p>
        )}
      </>
    );
  return (
    <>
      <AdminPageHeader
        title={booking.bookingCode}
        description={`Submitted ${new Date(booking.createdAt).toLocaleString()}`}
        action={<Link to="/admin/bookings">Back to bookings</Link>}
      />
      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="admin-detail-grid">
        <div className="admin-detail-main">
          <section className="admin-panel admin-summary">
            <div>
              <span>Status</span>
              <StatusBadge status={booking.status} />
            </div>
            <div>
              <span>Preferred date</span>
              <strong>{new Date(booking.preferredDate).toLocaleDateString()}</strong>
            </div>
            <div>
              <span>Preferred periods</span>
              <strong>
                {booking.preferredTimePeriods
                  .map((p) => `${p} ${periods[p]?.startTime ?? ""}-${periods[p]?.endTime ?? ""}`)
                  .join(", ")}
              </strong>
            </div>
            <div>
              <span>Source style</span>
              <strong>{booking.sourceStyle?.name ?? "Direct booking"}</strong>
            </div>
          </section>
          <section className="admin-panel">
            <h2>Customer information</h2>
            <dl className="admin-data">
              <div>
                <dt>Full name</dt>
                <dd>{booking.fullName}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${booking.phoneNumber}`}>{booking.phoneNumber}</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${booking.email}`}>{booking.email}</a>
                </dd>
              </div>
            </dl>
            <div className="admin-actions">
              <a className="admin-primary" href={`tel:${booking.phoneNumber}`}>
                Call customer
              </a>
              <a className="admin-secondary" href={`mailto:${booking.email}`}>
                Send email
              </a>
            </div>
          </section>
          <section className="admin-panel">
            <h2>Tattoo description</h2>
            <p className="admin-description">{booking.description}</p>
          </section>
          <section className="admin-panel">
            <h2>Reference images</h2>
            {booking.referenceImages.length ? (
              <div className="admin-images">
                {booking.referenceImages.map((image) => (
                  <a href={image.url} target="_blank" rel="noreferrer" key={image.publicId}>
                    <img src={image.url} alt={image.originalName} />
                  </a>
                ))}
              </div>
            ) : (
              <p>No reference images.</p>
            )}
          </section>
          <section className="admin-panel">
            <h2>Status history</h2>
            <ol className="admin-history">
              {[...booking.statusHistory].reverse().map((item, index) => (
                <li key={`${item.changedAt}-${index}`}>
                  <StatusBadge status={item.toStatus} />
                  <div>
                    <strong>
                      {item.fromStatus
                        ? `${item.fromStatus} to ${item.toStatus}`
                        : "Booking received"}
                    </strong>
                    <span>
                      {new Date(item.changedAt).toLocaleString()} ·{" "}
                      {item.changedBy?.fullName ?? "System"}
                    </span>
                    {item.note ? <p>{item.note}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="admin-detail-aside">
          {booking.status === "CONFIRMED" ? (
            <form className="admin-panel admin-form" onSubmit={schedule}>
              <h2>Official schedule</h2>
              <label>
                Start time
                <input
                  required
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
              </label>
              <label>
                End time
                <input
                  required
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                />
              </label>
              <label>
                Note
                <textarea value={scheduleNote} onChange={(e) => setScheduleNote(e.target.value)} />
              </label>
              <button className="admin-primary" disabled={busy}>
                Schedule appointment
              </button>
            </form>
          ) : null}
          {booking.scheduledAppointment ? (
            <section className="admin-panel">
              <h2>Official appointment</h2>
              <p>{new Date(booking.scheduledAppointment.startAt).toLocaleString()}</p>
              <p>to {new Date(booking.scheduledAppointment.endAt).toLocaleString()}</p>
            </section>
          ) : null}
          {nextStatuses[booking.status].length ? (
            <form className="admin-panel admin-form" onSubmit={updateStatus}>
              <h2>Update status</h2>
              <label>
                Next status
                <select required value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Select status</option>
                  {nextStatuses[booking.status].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Note
                <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
              </label>
              <button className="admin-primary" disabled={busy || !status}>
                Update status
              </button>
            </form>
          ) : null}
          <section className="admin-panel">
            <h2>Internal notes</h2>
            <form className="admin-form" onSubmit={addNote}>
              <label>
                Add note
                <textarea required value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              <button className="admin-secondary" disabled={busy}>
                Add note
              </button>
            </form>
            <ul className="admin-notes">
              {[...booking.adminNotes].reverse().map((item) => (
                <li key={item._id}>
                  <p>{item.content}</p>
                  <span>
                    {item.createdBy?.fullName} · {new Date(item.createdAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void action(() =>
                        adminAction(`/bookings/${bookingId}/notes/${item._id}`, {
                          method: "DELETE",
                        }),
                      )
                    }
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
