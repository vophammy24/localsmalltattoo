import { adminAction, adminRequest } from "../../admin/adminApi";
import type {
  GalleryFormValues,
  GalleryItem,
  GalleryMediaItem,
  GalleryPageData,
} from "../types/gallery";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function getGallery(query = "") {
  const response = await fetch(`${API_URL}/api/public/gallery${query}`);
  const result = (await response.json().catch(() => null)) as {
    message?: string;
    data?: GalleryPageData;
  } | null;
  if (!response.ok || !result?.data) throw new Error(result?.message ?? "Unable to load gallery.");
  return result.data;
}

export function getAdminGallery(query = "") {
  return adminRequest<GalleryPageData>(`/gallery${query}`);
}
export function getAdminGalleryItem(id: string) {
  return adminRequest<{ item: GalleryItem }>(`/gallery/${id}`);
}

function appendValues(data: FormData, values: GalleryFormValues) {
  Object.entries(values).forEach(([key, value]) => {
    if (key === "tattooStyleIds") (value as string[]).forEach((id) => data.append(key, id));
    else data.append(key, String(value));
  });
}

export function uploadGallery(files: File[], values: GalleryFormValues, alts: string[]) {
  const data = new FormData();
  appendValues(data, values);
  files.forEach((file) => data.append("images", file));
  alts.forEach((alt) => data.append("alts", alt));
  return adminRequest<{ items: GalleryItem[] }>("/gallery/bulk-upload", {
    method: "POST",
    body: data,
  });
}

export function updateGalleryItem(id: string, values: GalleryFormValues) {
  return adminRequest<{ item: GalleryItem }>(`/gallery/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
  });
}
export function deleteGalleryItem(id: string) {
  return adminAction(`/gallery/${id}`, { method: "DELETE" });
}
export function bulkGallery(ids: string[], action: string, value?: string) {
  return adminAction("/gallery/bulk", {
    method: "PATCH",
    body: JSON.stringify({ ids, action, value }),
  });
}
export function getGalleryMediaLibrary() {
  return adminRequest<{ items: GalleryMediaItem[] }>("/gallery/media-library");
}
export function linkGalleryMedia(items: GalleryMediaItem[]) {
  return adminRequest<{ items: GalleryItem[] }>("/gallery/link-media", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
