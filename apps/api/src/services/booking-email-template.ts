import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import type { CreateBookingInput } from "../validators/booking.validator.js";

const studioTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  dateStyle: "medium",
  timeStyle: "short",
});
const countries = new Intl.DisplayNames(["en"], { type: "region" });
const studioUrl = "https://localsmalltattoo.com.vn";
const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => htmlEntities[char]!);

export function renderBookingEmail(
  booking: CreateBookingInput,
  details: { id: string; code: string; submittedAt: Date; imageCount: number; status: string },
) {
  const country = parsePhoneNumberFromString(booking.phoneNumber)?.country;
  const methods = booking.contactMethods ?? [];
  const adminUrl = new URL(`/admin/bookings/${encodeURIComponent(details.id)}`, studioUrl).href;
  const rows: [string, string | undefined][] = [
    ["Booking ID", details.code],
    ["Submitted", `${studioTime.format(details.submittedAt)} (Asia/Ho_Chi_Minh)`],
    ["Full name", booking.fullName],
    ["Country", country ? countries.of(country) : "International (country unavailable)"],
    ["Phone number", booking.phoneNumber],
    ["WhatsApp", methods.includes("whatsapp") ? "Available (self-reported)" : undefined],
    ["Zalo", methods.includes("zalo") ? "Available (self-reported)" : undefined],
    ["Email", booking.email],
    ["Instagram", booking.instagram ? `@${booking.instagram}` : undefined],
    ["Preferred date", booking.preferredDate],
    ["Reference images", String(details.imageCount)],
    ["Description", booking.description],
    ["Booking status", details.status],
  ];
  const populated = rows.filter((row): row is [string, string] => Boolean(row[1]?.trim()));
  const body = populated
    .map(
      ([label, value]) => `
    <tr><td style="padding:12px 0;border-bottom:1px solid #4b3d27;overflow-wrap:anywhere;word-wrap:break-word">
      <strong style="display:block;color:#d5b575;font-size:12px;letter-spacing:1px;text-transform:uppercase">${label}</strong>
      <div style="margin-top:4px;color:#f3e8d5;line-height:1.5">${escapeHtml(value).replace(/\r\n?|\n/g, "<br>")}</div>
    </td></tr>`,
    )
    .join("");
  return {
    subject: `New booking request ${details.code}`,
    text: [
      "Local Small Tattoo",
      "New booking request",
      ...populated.map(([label, value]) => `${label}: ${value}`),
      "",
      `VIEW BOOKING IN ADMIN: ${adminUrl}`,
    ].join("\n"),
    html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New booking request</title></head>
<body style="margin:0;background:#0c0b09;color:#f3e8d5;font-family:Arial,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0c0b09"><tr>
    <td align="center" style="padding:24px 12px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#16130e"
       style="max-width:560px;border:1px solid #4b3d27;table-layout:fixed"><tr><td style="padding:24px">
        <p style="margin:0;color:#d5b575;font-size:12px;letter-spacing:2px;text-transform:uppercase">Local Small Tattoo</p>
        <h1 style="margin:8px 0 16px;font:normal 28px Georgia,serif;color:#f3e8d5">New booking request</h1>
        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="table-layout:fixed">${body}</table>
        <p style="margin:24px 0 0"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#d5b575;color:#16130e;font-weight:bold;font-size:13px;text-decoration:none;padding:14px 16px">VIEW BOOKING IN ADMIN</a></p>
      </td></tr></table>
    </td>
  </tr></table>
</body></html>`,
  };
}
