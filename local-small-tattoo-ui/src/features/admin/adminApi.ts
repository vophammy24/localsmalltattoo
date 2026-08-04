const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const hasJsonBody = init.body && !(init.body instanceof FormData);
  const response = await fetch(`${API_URL}/api/admin${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
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
    headers: {
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const result = (await response.json().catch(() => null)) as {
    message?: string;
    data?: unknown;
  } | null;
  if (!response.ok) throw new Error(result?.message ?? "Admin request failed.");
  return result;
}
