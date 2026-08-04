import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { adminRequest } from "../../features/admin/adminApi";
import type { Booking } from "../../features/admin/types";
type Summary = {
  pending: number;
  contacted: number;
  confirmed: number;
  scheduled: number;
  completedThisMonth: number;
  cancelled: number;
  appointmentsToday: number;
  recentBookings: Booking[];
  upcomingAppointments: Booking[];
};
export function AdminDashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    adminRequest<Summary>("/dashboard/summary")
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);
  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Studio activity and booking priorities."
        action={
          <Link className="admin-primary" to="/admin/bookings">
            View bookings
          </Link>
        }
      />
      {error ? <p className="admin-error">{error}</p> : null}
      {!data ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <section className="admin-stats">
            {[
              ["New bookings", data.pending],
              ["Waiting for contact", data.contacted],
              ["Scheduled", data.scheduled],
              ["Appointments today", data.appointmentsToday],
              ["Completed this month", data.completedThisMonth],
              ["Cancelled", data.cancelled],
            ].map(([label, value]) => (
              <article key={String(label)}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>
          <section className="admin-panel">
            <h2>Latest bookings</h2>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Customer</th>
                    <th>Preferred date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <Link to={`/admin/bookings/${booking._id}`}>{booking.bookingCode}</Link>
                      </td>
                      <td>{booking.fullName}</td>
                      <td>{new Date(booking.preferredDate).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
