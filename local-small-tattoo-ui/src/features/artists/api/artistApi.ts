import { adminAction, adminRequest } from "../../admin/adminApi";
import type { Artist, ArtistFormValues } from "../types/artist";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function publicRequest<T>(path: string) {
  const response = await fetch(`${API_URL}/api/public/artists${path}`);
  const result = (await response.json().catch(() => null)) as { message?: string; data?: T } | null;
  if (!response.ok || !result?.data) throw new Error(result?.message ?? "Unable to load artists.");
  return result.data;
}

export function getArtists(query = "") {
  return publicRequest<{ items: Artist[] }>(query).then((data) => data.items);
}
export function getArtist(slug: string) {
  return publicRequest<{ artist: Artist }>(`/${slug}`).then((data) => data.artist);
}
export function getAdminArtists(query = "") {
  return adminRequest<{ items: Artist[] }>(`/artists${query}`);
}
export function getAdminArtist(id: string) {
  return adminRequest<{ artist: Artist }>(`/artists/${id}`);
}
function formData(values: ArtistFormValues, profile: File | null, cover: File | null) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (key === "tattooStyleIds") {
      (value as string[]).forEach((id) => data.append("tattooStyleIds", id));
    } else data.append(key, String(value));
  });
  if (profile) data.append("profileImage", profile);
  if (cover) data.append("coverImage", cover);
  return data;
}
export function saveArtist(
  values: ArtistFormValues,
  profile: File | null,
  cover: File | null,
  id?: string,
) {
  return adminRequest<{ artist: Artist }>(id ? `/artists/${id}` : "/artists", {
    method: id ? "PATCH" : "POST",
    body: formData(values, profile, cover),
  });
}
export function publishArtist(id: string, isPublished: boolean) {
  return adminRequest<{ artist: Artist }>(`/artists/${id}/publish`, {
    method: "PATCH",
    body: JSON.stringify({ isPublished }),
  });
}
export function archiveArtist(id: string) {
  return adminAction(`/artists/${id}`, { method: "DELETE" });
}
export function reorderArtists(items: { id: string; displayOrder: number }[]) {
  return adminAction("/artists/reorder", { method: "PATCH", body: JSON.stringify({ items }) });
}
