// Date-only reviews use midnight in Asia/Ho_Chi_Minh, independent of browser timezone.
export function reviewTimestamp(value: string): number {
  if (!value) return NaN;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T00:00:00+07:00" : value;
  if (!/(Z|[+-]\d{2}:\d{2})$/i.test(normalized)) return NaN;
  const calendar = normalized.slice(0, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized)
  )
    return NaN;
  const calendarStamp = Date.parse(calendar + "T00:00:00Z");
  if (
    !Number.isFinite(calendarStamp) ||
    new Date(calendarStamp).toISOString().slice(0, 10) !== calendar
  )
    return NaN;
  const stamp = Date.parse(normalized);
  if (!Number.isFinite(stamp)) return NaN;
  if (value.length === 10 && new Date(stamp + 7 * 3600000).toISOString().slice(0, 10) !== value)
    return NaN;
  return stamp;
}
export function formatRelativeReviewDate(value: string, now = Date.now()): string {
  const seconds = (now - reviewTimestamp(value)) / 1000;
  if (!Number.isFinite(seconds) || seconds < 0) return "";
  if (seconds < 60) return "Just now";
  const [amount, unit] =
    seconds < 3600
      ? [seconds / 60, "minute"]
      : seconds < 86400
        ? [seconds / 3600, "hour"]
        : seconds < 604800
          ? [seconds / 86400, "day"]
          : seconds < 2592000
            ? [seconds / 604800, "week"]
            : seconds < 31536000
              ? [seconds / 2592000, "month"]
              : [seconds / 31536000, "year"];
  return new Intl.RelativeTimeFormat("en", { numeric: "always" }).format(
    -Math.max(1, Math.floor(Number(amount))),
    unit as Intl.RelativeTimeFormatUnit,
  );
}
