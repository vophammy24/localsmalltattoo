import { adminRequest } from "../../admin/adminApi";
import type { AboutContent } from "../types/about";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export async function getAbout() {
  const response = await fetch(`${API_URL}/api/public/pages/about`);
  const result = (await response.json().catch(() => null)) as {
    message?: string;
    data?: { content: AboutContent };
  } | null;
  if (!response.ok || !result?.data) throw new Error(result?.message ?? "Unable to load About Us.");
  return result.data.content;
}
export function getAdminAbout() {
  return adminRequest<{ content: AboutContent }>("/pages/about");
}
export function saveAdminAbout(content: AboutContent) {
  return adminRequest<{ content: AboutContent }>("/pages/about", {
    method: "PATCH",
    body: JSON.stringify(content),
  });
}
export function publishAdminAbout() {
  return adminRequest<{ content: AboutContent }>("/pages/about/publish", {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}
