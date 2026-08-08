const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const TOKEN_KEY = "local_small_admin_token";

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function storeAdminToken(token: string, rememberMe: boolean) {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  (rememberMe ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function adminHeaders(init: RequestInit, hasJsonBody: boolean) {
  const token = getAdminToken();
  return {
    ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  };
}

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    const hasJsonBody = init.body && !(init.body instanceof FormData);
    const response = await fetch(`${API_URL}/api/admin${path}`, {
      ...init,
      credentials: "include",
      headers: adminHeaders(init, Boolean(hasJsonBody)),
    });
    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
      data?: T;
    } | null;
    if (!response.ok || !result?.data) throw new Error(result?.message ?? "Admin request failed.");
    if ((init.method ?? "GET").toUpperCase() !== "GET") {
      notifyAdmin({ type: "success", message: result.message ?? "Action completed successfully." });
    }
    return result.data;
  } catch (reason) {
    const error = reason instanceof Error ? reason : new Error("Admin request failed.");
    if (path !== "/auth/me") notifyAdmin({ type: "error", message: error.message });
    throw error;
  }
}

export async function adminAction(path: string, init: RequestInit = {}) {
  try {
    const hasJsonBody = init.body && !(init.body instanceof FormData);
    const response = await fetch(`${API_URL}/api/admin${path}`, {
      ...init,
      credentials: "include",
      headers: adminHeaders(init, Boolean(hasJsonBody)),
    });
    const result = (await response.json().catch(() => null)) as {
      message?: string;
      data?: unknown;
    } | null;
    if (!response.ok) throw new Error(result?.message ?? "Admin request failed.");
    notifyAdmin({ type: "success", message: result?.message ?? "Action completed successfully." });
    return result;
  } catch (reason) {
    const error = reason instanceof Error ? reason : new Error("Admin request failed.");
    notifyAdmin({ type: "error", message: error.message });
    throw error;
  }
}
import { notifyAdmin } from "./notifications/adminNotifications";
