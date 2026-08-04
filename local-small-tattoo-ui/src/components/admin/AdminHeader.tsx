import { useAdminAuth } from "../../features/admin/auth/AdminAuthContext";
import { LogOut } from "lucide-react";
export function AdminHeader() {
  const { admin, logout } = useAdminAuth();
  return (
    <header className="admin-header">
      <strong>L.S.T. Admin</strong>
      <div>
        <span>{admin?.fullName}</span>
        <button type="button" title="Sign out" onClick={() => void logout()}>
          <LogOut />
        </button>
      </div>
    </header>
  );
}
