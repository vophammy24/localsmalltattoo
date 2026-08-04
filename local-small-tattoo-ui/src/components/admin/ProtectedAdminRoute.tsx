import { Navigate, Outlet, useLocation } from "react-router";
import { useAdminAuth } from "../../features/admin/auth/AdminAuthContext";
export function ProtectedAdminRoute() {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();
  if (loading) return <div className="admin-loading">Checking session...</div>;
  return admin ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  );
}
