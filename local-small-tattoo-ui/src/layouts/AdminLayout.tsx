import { Outlet } from "react-router";
import { AdminHeader } from "../components/admin/AdminHeader";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { BackToTopButton } from "../components/common/BackToTopButton";
export function AdminLayout() {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-shell__main">
        <AdminHeader />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
      <BackToTopButton />
    </div>
  );
}
