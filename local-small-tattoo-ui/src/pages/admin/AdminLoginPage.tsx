import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useAdminAuth } from "../../features/admin/auth/AdminAuthContext";
import { useBusinessSettings } from "../../features/businessSettings/BusinessSettingsContext";
import { ArrowRight, LockKeyhole } from "lucide-react";
export function AdminLoginPage() {
  const { admin, loading, login } = useAdminAuth();
  const { settings } = useBusinessSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!loading && admin) return <Navigate to="/admin" replace />;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password, rememberMe);
      const target = (location.state as { from?: string } | null)?.from ?? "/admin";
      navigate(target, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="admin-login">
      <form onSubmit={submit}>
        <header>
          <h1>{settings?.businessName ?? "Studio Admin"}</h1>
        </header>
        <label>
          Email address
          <input
            type="email"
            required
            autoComplete="username"
            placeholder="atelier@localsmalltattoo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span />
          Remember terminal session
        </label>
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="admin-primary" disabled={submitting}>
          {submitting ? (
            "Signing in..."
          ) : (
            <>
              Sign in <ArrowRight />
            </>
          )}
        </button>
        <footer>
          <LockKeyhole />
          Encrypted connection
        </footer>
      </form>
    </main>
  );
}
