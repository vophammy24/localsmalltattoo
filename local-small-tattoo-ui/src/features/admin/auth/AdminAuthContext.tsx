import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  adminAction,
  adminRequest,
  clearAdminToken,
  storeAdminToken,
} from "../adminApi";
import type { Admin } from "../types";

type AuthContextValue = {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
};
const AdminAuthContext = createContext<AuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminRequest<{ admin: Admin | null }>("/auth/me")
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);
  async function login(email: string, password: string, rememberMe: boolean) {
    const result = await adminRequest<{ admin: Admin; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, rememberMe }),
    });
    storeAdminToken(result.token, rememberMe);
    setAdmin(result.admin);
  }
  async function logout() {
    try {
      await adminAction("/auth/logout", { method: "POST" });
    } finally {
      clearAdminToken();
      setAdmin(null);
    }
  }
  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  return value;
}
