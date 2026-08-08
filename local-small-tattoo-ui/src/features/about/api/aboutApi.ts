import { adminRequest } from "../../admin/adminApi";
import type { AboutContent } from "../types/about";
import { withDefaultFounder } from "../data/defaultFounder";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export async function getAbout() {
  const response = await fetch(`${API_URL}/api/public/pages/about`);
  const result = (await response.json().catch(() => null)) as {
    message?: string;
    data?: { content: AboutContent };
  } | null;
  if (!response.ok || !result?.data) throw new Error(result?.message ?? "Unable to load About Us.");
  return withDefaultFounder(result.data.content);
}
export async function getAdminAbout() {
  const result = await adminRequest<{ content: AboutContent }>("/pages/about");
  return { ...result, content: withDefaultFounder(result.content) };
}
export async function saveAdminAbout(content: AboutContent) {
  const result = await adminRequest<{ content: AboutContent }>("/pages/about", {
    method: "PATCH",
    body: JSON.stringify(content),
  });
  return { ...result, content: withDefaultFounder(result.content) };
}
export async function publishAdminAbout() {
  const result = await adminRequest<{ content: AboutContent }>("/pages/about/publish", {
    method: "PATCH",
    body: JSON.stringify({}),
  });
  return { ...result, content: withDefaultFounder(result.content) };
}

export function uploadSectionImage(section: string, file: File, alt: string, oldPublicId?: string) {
  const data = new FormData();
  data.append("image", file);
  data.append("alt", alt);
  if (oldPublicId) data.append("oldPublicId", oldPublicId);
  return adminRequest<{ image: { url: string; publicId: string; alt: string } }>(
    `/pages/section-images/${encodeURIComponent(section)}`,
    { method: "POST", body: data },
  );
}

export function deleteSectionImage(publicId: string) {
  return adminRequest<{ publicId: string }>("/pages/section-images", {
    method: "DELETE",
    body: JSON.stringify({ publicId }),
  });
}
