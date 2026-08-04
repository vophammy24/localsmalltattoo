import { NavLink } from "react-router";
import { BookOpen, Grid2X2, Image, LogOut, Palette, Settings, UserRound } from "lucide-react";
import { useAdminAuth } from "../../features/admin/auth/AdminAuthContext";

export function AdminSidebar() {
  const { admin, logout } = useAdminAuth();
  return (
    <aside className="admin-sidebar">
      <NavLink className="admin-sidebar__brand" to="/admin">
        LocalSmallTattoo.
      </NavLink>
      <nav>
        <NavLink end to="/admin">
          <Grid2X2 />
          Overview
        </NavLink>
        <NavLink to="/admin/bookings">
          <BookOpen />
          Bookings
        </NavLink>
        <NavLink to="/admin/styles">
          <Palette />
          Styles
        </NavLink>
        <span className="is-disabled">
          <Image />
          Gallery
        </span>
        <span className="is-disabled">
          <Settings />
          Settings
        </span>
      </nav>
      <div className="admin-sidebar__user">
        <UserRound />
        <div>
          <strong>{admin?.fullName}</strong>
          <span>{admin?.email}</span>
        </div>
        <button type="button" title="Sign out" onClick={() => void logout()}>
          <LogOut />
        </button>
      </div>
    </aside>
  );
}
