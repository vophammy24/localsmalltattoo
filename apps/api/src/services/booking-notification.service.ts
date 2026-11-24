import { env } from "../config/env.js";
import { BookingModel } from "../models/booking.model.js";
import { renderBookingEmail } from "./booking-email-template.js";

const retryDelays = [60_000, 5 * 60_000, 20 * 60_000];
const maxAttempts = retryDelays.length + 1;
const leaseMs = 60_000;
const activeStates = ["queued", "sending"];
const clearedPayload = { "bookingEmail.payload": "", "bookingEmail.nextAttemptAt": "" };

export function queueBookingEmail(...args: Parameters<typeof renderBookingEmail>) {
  const { BOOKING_EMAIL_API_KEY: key, BOOKING_EMAIL_FROM: from, BOOKING_EMAIL_TO: to } = env;
  if (!key || !from || !to) return undefined;
  const [, { submittedAt }] = args;
  let payload: string;
  try {
    payload = JSON.stringify({ from, to: [to], ...renderBookingEmail(...args) });
  } catch {
    console.warn("A booking email could not be prepared.");
    return { state: "failed", attempts: 0, failure: "template_error" };
  }
  return {
    state: "queued",
    attempts: 0,
    nextAttemptAt: submittedAt,
    // Keep retries within Resend's 24-hour idempotency window.
    expiresAt: new Date(submittedAt.getTime() + 23 * 60 * 60_000),
    payload,
  };
}

type Delivery =
  | { accepted: true; id: string }
  | { accepted: false; reason: string; temporary: boolean; retryAfterMs?: number };

async function sendEmail(key: string, code: string, payload: string): Promise<Delivery> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `booking/${code}`,
      },
      body: payload,
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const result = (await response.json()) as { id?: unknown };
      if (typeof result?.id !== "string" || !result.id) throw new Error();
      return { accepted: true, id: result.id };
    }
    const conflict =
      response.status === 409
        ? ((await response.json().catch(() => null)) as { name?: string } | null)
        : null;
    const hint = response.headers.get("Retry-After");
    const seconds = hint ? Number(hint) : NaN;
    const retryAfterMs = hint
      ? Math.max(0, Number.isFinite(seconds) ? seconds * 1000 : Date.parse(hint) - Date.now()) || 0
      : 0;
    return {
      accepted: false,
      reason: `http_${response.status}`,
      temporary:
        response.status === 408 ||
        response.status === 429 ||
        response.status >= 500 ||
        conflict?.name === "concurrent_idempotent_requests",
      retryAfterMs,
    };
  } catch {
    // A timeout can occur after acceptance, so retry with the original key and exact body.
    return { accepted: false, reason: "network_or_timeout", temporary: true };
  }
}

export async function processBookingEmails() {
  await BookingModel.init();
  const now = new Date();
  await BookingModel.updateMany(
    {
      "bookingEmail.state": { $in: activeStates },
      "bookingEmail.nextAttemptAt": { $lte: now },
      $or: [
        { "bookingEmail.expiresAt": { $lte: now } },
        { "bookingEmail.attempts": { $gte: maxAttempts } },
      ],
    },
    {
      $set: { "bookingEmail.state": "failed", "bookingEmail.failure": "retry_window_ended" },
      $unset: clearedPayload,
    },
    { timestamps: false },
  );

  const key = env.BOOKING_EMAIL_API_KEY;
  if (!key) return;
  for (let i = 0; i < 5; i++) {
    const claimedAt = new Date();
    const job = await BookingModel.findOneAndUpdate(
      {
        "bookingEmail.state": { $in: activeStates },
        "bookingEmail.nextAttemptAt": { $lte: claimedAt },
        "bookingEmail.expiresAt": { $gt: claimedAt },
        "bookingEmail.attempts": { $lt: maxAttempts },
      },
      {
        $set: {
          "bookingEmail.state": "sending",
          "bookingEmail.nextAttemptAt": new Date(claimedAt.getTime() + leaseMs),
        },
        $inc: { "bookingEmail.attempts": 1 },
      },
      { sort: { "bookingEmail.nextAttemptAt": 1 }, new: true, timestamps: false },
    )
      .select("bookingCode +bookingEmail")
      .lean();
    if (!job?.bookingEmail) break;
    const delivery = job.bookingEmail;
    const acknowledge = {
      _id: job._id,
      "bookingEmail.state": "sending",
      "bookingEmail.attempts": delivery.attempts,
    };
    const result = delivery.payload
      ? await sendEmail(key, job.bookingCode, delivery.payload)
      : { accepted: false as const, temporary: false, reason: "missing_payload" };
    if (result.accepted) {
      await BookingModel.updateOne(
        acknowledge,
        {
          $set: {
            "bookingEmail.state": "accepted",
            "bookingEmail.acceptedAt": new Date(),
            "bookingEmail.resendId": result.id,
          },
          $unset: { ...clearedPayload, "bookingEmail.failure": "" },
        },
        { timestamps: false },
      );
      continue;
    }

    const delay = retryDelays[delivery.attempts - 1];
    const nextAttemptAt = new Date(Date.now() + Math.max(delay ?? 0, result.retryAfterMs ?? 0));
    if (result.temporary && delay && delivery.expiresAt && nextAttemptAt < delivery.expiresAt) {
      await BookingModel.updateOne(
        acknowledge,
        {
          $set: {
            "bookingEmail.state": "queued",
            "bookingEmail.failure": result.reason,
            "bookingEmail.nextAttemptAt": nextAttemptAt,
          },
        },
        { timestamps: false },
      );
    } else {
      await BookingModel.updateOne(
        acknowledge,
        {
          $set: { "bookingEmail.state": "failed", "bookingEmail.failure": result.reason },
          $unset: clearedPayload,
        },
        { timestamps: false },
      );
      console.warn("A booking email reached its delivery limit or was rejected by Resend.");
    }
  }
}

export function startBookingEmailWorker() {
  let running = false;
  async function tick() {
    if (running) return;
    running = true;
    try {
      await processBookingEmails();
    } catch {
      console.warn("Booking email worker will retry on its next poll.");
    } finally {
      running = false;
    }
  }
  void tick();
  setInterval(() => void tick(), 15_000).unref();
}
