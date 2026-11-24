import { createHash, createHmac } from "node:crypto";
import { env } from "../config/env.js";
import { BookingClaim, BookingRate } from "../models/booking-protection.model.js";
import { BookingModel } from "../models/booking.model.js";
import { HttpError } from "../utils/http-error.js";
import type { CreateBookingInput } from "../validators/booking.validator.js";

export const bookingIndexes = () =>
  Promise.all([BookingModel.init(), BookingClaim.init(), BookingRate.init()]);

const allowedHosts = new Set(
  env.TURNSTILE_HOSTNAMES.split(",").map((host) => host.trim().toLowerCase()),
);
const digest = (value: string) => createHmac("sha256", env.JWT_SECRET).update(value).digest("hex");
const isDuplicateKey = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000;

export async function verifyBookingTurnstile(token: string | undefined, ip: string) {
  if (!env.TURNSTILE_SECRET_KEY)
    throw new HttpError(503, "Booking verification is temporarily unavailable.");
  if (!token || token.length > 2048) {
    throw new HttpError(400, "Complete the security check.", "verification");
  }
  let result: { success?: boolean; hostname?: string; action?: string; "error-codes"?: string[] };
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error();
    result = (await response.json()) as typeof result;
    if (
      !result ||
      result["error-codes"]?.some((code) =>
        ["internal-error", "invalid-input-secret", "missing-input-secret"].includes(code),
      )
    )
      throw new Error();
  } catch {
    throw new HttpError(
      503,
      "The security check is temporarily unavailable. Please try again.",
      "verification",
    );
  }
  if (
    result.success !== true ||
    result.action !== "booking" ||
    !result.hostname ||
    !allowedHosts.has(result.hostname.toLowerCase())
  ) {
    throw new HttpError(400, "Security check expired or failed. Please try again.", "verification");
  }
  // Siteverify can accept concurrent redemptions before its edge state converges.
  await BookingRate.create({
    _id: digest(JSON.stringify(["turnstile", token])),
    count: 1,
    expiresAt: new Date(Date.now() + 5 * 60_000),
  }).catch((error: unknown) => {
    if (!isDuplicateKey(error)) throw error;
    throw new HttpError(400, "Security check already used. Please try again.", "verification");
  });
}

export async function limitBooking(scope: "ip" | "phone" | "email", value: string) {
  const windowMs = env.BOOKING_RATE_WINDOW_MINUTES * 60_000;
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const expiresAt = new Date(windowStart + windowMs);
  const key = digest(JSON.stringify([scope, value, windowStart]));
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt } };
  const counter = await BookingRate.findOneAndUpdate({ _id: key }, update, {
    upsert: true,
    new: true,
  }).catch((error: unknown) => {
    if (!isDuplicateKey(error)) throw error;
    return BookingRate.findOneAndUpdate({ _id: key }, update, { new: true });
  });
  if (!counter) throw new HttpError(503, "Booking is temporarily unavailable. Please try again.");
  if ((counter.count ?? 0) > (scope === "ip" ? env.BOOKING_IP_LIMIT : env.BOOKING_CONTACT_LIMIT)) {
    throw new HttpError(
      429,
      "Too many booking attempts. Please try again in a few minutes.",
      undefined,
      Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)),
    );
  }
}

export function bookingFingerprint(input: CreateBookingInput, files: Express.Multer.File[]) {
  const imageHashes = files
    .map((file) => createHash("sha256").update(file.buffer).digest("hex"))
    .sort();
  return digest(
    JSON.stringify([
      input.email,
      input.phoneNumber,
      input.fullName,
      input.preferredDate,
      input.description,
      input.instagram,
      input.contactMethods,
      input.sourceStyleSlug,
      imageHashes,
    ]),
  );
}

export function bookingSubmissionKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export async function claimBooking(submissionKey: string, fingerprint: string) {
  const claimFilter = { $or: [{ _id: fingerprint }, { submissionKey }] };
  await BookingClaim.deleteMany({ ...claimFilter, expiresAt: { $lte: new Date() } });
  const claim = await BookingClaim.create({
    _id: fingerprint,
    submissionKey,
    expiresAt: new Date(Date.now() + 10 * 60_000),
  }).catch((error: unknown) => {
    if (!isDuplicateKey(error)) throw error;
    throw new HttpError(
      409,
      "This booking is already being processed. Please wait before trying again.",
    );
  });
  return () => BookingClaim.deleteOne({ _id: claim._id, expiresAt: claim.expiresAt });
}
