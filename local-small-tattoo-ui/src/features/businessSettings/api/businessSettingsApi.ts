import { adminRequest } from "../../admin/adminApi";
import type { BusinessSettings } from "../types/businessSettings";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export async function getBusinessSettings() {
  const response = await fetch(`${API_URL}/api/public/business-settings`);
  const result = (await response.json().catch(() => null)) as {
    message?: string;
    data?: { settings: BusinessSettings };
  } | null;
  if (!response.ok || !result?.data)
    throw new Error(result?.message ?? "Unable to load business settings.");
  return result.data.settings;
}
export function getAdminBusinessSettings() {
  return adminRequest<{ settings: BusinessSettings }>("/business-settings");
}
export function extractGoogleMapsEmbedUrl(input: string) {
  const value = input.trim();
  if (!value.toLowerCase().startsWith("<iframe")) return value;
  return value.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? value;
}
export function saveBusinessSettings(settings: BusinessSettings) {
  return adminRequest<{ settings: BusinessSettings }>("/business-settings", {
    method: "PATCH",
    body: JSON.stringify({
      ...settings,
      location: {
        ...settings.location,
        googleMapsEmbedUrl: extractGoogleMapsEmbedUrl(settings.location.googleMapsEmbedUrl),
      },
      logoAlt: settings.logo?.alt ?? settings.logoAlt ?? "",
    }),
  });
}
export function uploadBusinessLogo(file: File, alt: string) {
  const data = new FormData();
  data.append("logo", file);
  data.append("alt", alt);
  return adminRequest<{ settings: BusinessSettings }>("/business-settings/logo", {
    method: "PATCH",
    body: data,
  });
}
export function deleteBusinessLogo() {
  return adminRequest<{ settings: BusinessSettings }>("/business-settings/logo", {
    method: "DELETE",
  });
}
