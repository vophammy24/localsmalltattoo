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
  return result.data;
}

export async function adminAction(path: string, init: RequestInit = {}) {
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
  return result;
}
