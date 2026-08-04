import type { BookingStatus } from "../../features/admin/types";
export function StatusBadge({ status = "PENDING" }: { status?: BookingStatus }) {
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
      {status.replace("_", " ")}
    </span>
  );
}
