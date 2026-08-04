import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { adminRequest } from "../../features/admin/adminApi";
import type { Booking } from "../../features/admin/types";
type Result = {
  items: Booking[];
  pagination: { page: number; limit: number; totalItems: number; totalPages: number };
};
export function AdminBookingsPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (appliedSearch) params.set("search", appliedSearch);
    if (status) params.set("status", status);
    if (date) params.set("preferredDate", date);
    adminRequest<Result>(`/bookings?${params}`)
      .then(setResult)
      .catch((e: Error) => setError(e.message));
  }, [page, appliedSearch, status, date]);
  function submit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  }
  return (
    <>
      <AdminPageHeader
        title="Bookings"
        description="Search, filter, and manage customer requests."
      />
      <form className="admin-filters" onSubmit={submit}>
        <input
          aria-label="Search bookings"
          placeholder="Name, phone, or booking code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {[
            "PENDING",
            "CONTACTED",
            "CONFIRMED",
            "SCHEDULED",
            "COMPLETED",
            "CANCELLED",
            "NO_SHOW",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          aria-label="Filter by preferred date"
          type="date"
          value={date}
          onChange={(e) => {
            setPage(1);
            setDate(e.target.value);
          }}
        />
        <button className="admin-primary">Search</button>
      </form>
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking code</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Preferred date</th>
                <th>Preferred time</th>
                <th>Submitted</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {result?.items.map((b) => (
                <tr key={b._id}>
                  <td>{b.bookingCode}</td>
                  <td>{b.fullName}</td>
                  <td>
                    <a href={`tel:${b.phoneNumber}`}>{b.phoneNumber}</a>
                  </td>
                  <td>{new Date(b.preferredDate).toLocaleDateString()}</td>
                  <td>{b.preferredTimePeriods.join(", ")}</td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                  <td>
                    <Link to={`/admin/bookings/${b._id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {result && (
          <div className="admin-pagination">
            <span>{result.pagination.totalItems} bookings</span>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              {page} / {Math.max(result.pagination.totalPages, 1)}
            </span>
            <button
              disabled={page >= result.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </>
  );
}
