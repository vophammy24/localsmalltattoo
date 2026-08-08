import { NavLink } from "react-router";
import {
  BookOpen,
  FileText,
  Grid2X2,
  Image,
  LogOut,
  Palette,
  Settings,
  UserRound,
} from "lucide-react";
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
        <NavLink to="/admin/gallery">
          <Image />
          Gallery
        </NavLink>
        <NavLink to="/admin/content/home">
          <FileText />
          Home CMS
        </NavLink>
        <NavLink to="/admin/content/about">
          <FileText />
          About Us CMS
        </NavLink>
        <NavLink to="/admin/settings/business">
          <Settings />
          Settings
        </NavLink>
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
