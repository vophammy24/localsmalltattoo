import { SITE_CONFIG } from "../../../config/siteConfig";
const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SITE_CONFIG.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
export function studioDateTime(value: string) {
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
// datetime-local contains wall-clock time, never the administrator's browser timezone.
export function studioTimeToUtc(value: string): string {
  const input = value.length === 10 ? `${value}T00:00` : value;
  const wall = Date.parse(`${input}:00Z`);
  if (!Number.isFinite(wall)) throw new Error("Invalid studio date/time.");
  let utc = wall;
  for (let i = 0; i < 3; i++) {
    const represented = Date.parse(`${studioDateTime(new Date(utc).toISOString())}:00Z`);
    utc += wall - represented;
  }
  const result = new Date(utc).toISOString();
  if (studioDateTime(result) !== input) throw new Error("Invalid studio date/time.");
  return result;
}
export function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE_CONFIG.timezone,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
export function publicationStatus(
  item: {
    isPublic: boolean;
    permissionConfirmed: boolean;
    publishFrom: string | null;
    publishUntil: string | null;
  },
  now = Date.now(),
) {
  if (!item.isPublic || !item.permissionConfirmed) return "Draft";
  if (item.publishUntil && Date.parse(item.publishUntil) <= now) return "Expired";
  if (item.publishFrom && Date.parse(item.publishFrom) > now) return "Scheduled";
  return "Published";
}
