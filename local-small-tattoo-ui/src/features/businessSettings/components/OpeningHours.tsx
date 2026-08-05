import type { BusinessSettings } from "../types/businessSettings";
const names: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};
export function OpeningHours({ hours }: { hours: BusinessSettings["openingHours"] }) {
  return (
    <dl className="business-hours">
      {hours.map((item) => (
        <div key={item.day}>
          <dt>{names[item.day]}</dt>
          <dd>{item.isOpen ? `${item.openTime} - ${item.closeTime}` : "Closed"}</dd>
        </div>
      ))}
    </dl>
  );
}
export function summarizeHours(hours: BusinessSettings["openingHours"]) {
  const open = hours.filter((item) => item.isOpen);
  if (!open.length) return "Closed";
  const first = open[0]!;
  return open.every(
    (item) => item.openTime === first.openTime && item.closeTime === first.closeTime,
  )
    ? `Daily · ${first.openTime}-${first.closeTime}`
    : "See opening hours";
}
