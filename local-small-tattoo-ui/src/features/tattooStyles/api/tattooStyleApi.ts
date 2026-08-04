import { adminAction, adminRequest } from "../../admin/adminApi";
import type { TattooStyle, TattooStyleFormValues } from "../types/tattooStyle";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function getTattooStyles(featured = false) {
  const query = featured ? "?featured=true" : "";
  const response = await fetch(`${API_URL}/api/public/tattoo-styles${query}`);
  const result = (await response.json().catch(() => null)) as {
    message?: string;
    data?: { items: TattooStyle[] };
  } | null;
  if (!response.ok || !result?.data) {
    throw new Error(result?.message ?? "Unable to load tattoo styles.");
  }
  return result.data.items;
}

export function getAdminTattooStyles(query = "") {
  return adminRequest<{ items: TattooStyle[] }>(`/tattoo-styles${query}`);
}

export function getAdminTattooStyle(id: string) {
  return adminRequest<{ style: TattooStyle }>(`/tattoo-styles/${id}`);
}

function createStyleFormData(values: TattooStyleFormValues, cover?: File | null) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.append(key, String(value)));
  if (cover) data.append("coverImage", cover);
  return data;
}

export function saveTattooStyle(values: TattooStyleFormValues, cover?: File | null, id?: string) {
  return adminRequest<{ style: TattooStyle }>(id ? `/tattoo-styles/${id}` : "/tattoo-styles", {
    method: id ? "PATCH" : "POST",
    body: createStyleFormData(values, cover),
  });
}

export function archiveTattooStyle(id: string) {
  return adminAction(`/tattoo-styles/${id}`, { method: "DELETE" });
}

export function reorderTattooStyles(items: { id: string; displayOrder: number }[]) {
  return adminAction("/tattoo-styles/reorder", {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });
}

export function uploadStyleGallery(id: string, files: File[]) {
  const data = new FormData();
  files.forEach((file) => data.append("galleryImages", file));
  return adminRequest<{ style: TattooStyle }>(`/tattoo-styles/${id}/images`, {
    method: "POST",
    body: data,
  });
}

export function deleteStyleGalleryImage(styleId: string, imageId: string) {
  return adminAction(`/tattoo-styles/${styleId}/images/${imageId}`, { method: "DELETE" });
}

export function reorderStyleGallery(
  styleId: string,
  items: { imageId: string; displayOrder: number }[],
) {
  return adminAction(`/tattoo-styles/${styleId}/images/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });
}
