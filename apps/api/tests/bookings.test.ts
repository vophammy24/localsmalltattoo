import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import type { Server } from "node:http";
import { Writable } from "node:stream";
import { after, before, test } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import mongoose from "mongoose";

Object.assign(process.env, {
  NODE_ENV: "test",
  MONGODB_URI: "mongodb://127.0.0.1:1/unused",
  JWT_SECRET: "booking-test-secret-never-for-production",
  CLOUDINARY_CLOUD_NAME: "test",
  CLOUDINARY_API_KEY: "test",
  CLOUDINARY_API_SECRET: "test",
  CLIENT_URL: "http://localhost:5173",
  TURNSTILE_SECRET_KEY: "test-only-secret",
  TURNSTILE_HOSTNAMES: "localhost",
  BOOKING_IP_LIMIT: "8",
  BOOKING_CONTACT_LIMIT: "2",
  BOOKING_RATE_WINDOW_MINUTES: "15",
  BOOKING_DUPLICATE_WINDOW_MINUTES: "15",
  BOOKING_EMAIL_API_KEY: "test-only-email-key",
  BOOKING_EMAIL_FROM: "studio@example.test",
  BOOKING_EMAIL_TO: "owner@example.test",
});

let mongo: MongoMemoryServer;
let server: Server;
let url: string;
let uploads = 0;
const verified: string[] = [];
const notifications: { subject: string; text: string; html: string; key: string; raw: string }[] =
  [];
const resendResponses: (() => Response)[] = [];
let processBookingEmails: typeof import("../src/services/booking-notification.service.js").processBookingEmails;
const realFetch = globalThis.fetch;
let Booking: typeof import("../src/models/booking.model.js").BookingModel;
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kYuoAAAAASUVORK5CYII=",
  "base64",
);

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const { app } = await import("../src/app.js");
  ({ BookingModel: Booking } = await import("../src/models/booking.model.js"));
  ({ processBookingEmails } = await import("../src/services/booking-notification.service.js"));
  const { cloudinary } = await import("../src/config/cloudinary.js");
  cloudinary.uploader.upload_stream = ((options, callback) =>
    new Writable({
      write(_chunk, _encoding, done) {
        done();
      },
      final(done) {
        assert.equal(options.type, "authenticated");
        assert.match(options.public_id, /^[a-f0-9-]{36}$/);
        assert.equal(options.overwrite, false);
        uploads++;
        callback(undefined, {
          secure_url: "https://example.test/image/authenticated/" + options.public_id + ".jpg",
          public_id: options.public_id,
          format: "jpg",
        });
        done();
      },
    })) as typeof cloudinary.uploader.upload_stream;
  globalThis.fetch = async (input, init) => {
    if (String(input) === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
      const token = (init?.body as URLSearchParams).get("response")!;
      verified.push(token);
      if (token === "provider-down") return new Response(null, { status: 503 });
      return Response.json({
        success: token !== "invalid" && token !== "expired",
        action: token === "wrong-action" ? "other" : "booking",
        hostname: token === "wrong-host" ? "example.test" : "localhost",
      });
    }
    if (String(input) === "https://api.resend.com/emails") {
      const raw = String(init?.body);
      const key = new Headers(init?.headers).get("Idempotency-Key") ?? "";
      notifications.push({ ...JSON.parse(raw), key, raw });
      assert.match(key, /^booking\//);
      return resendResponses.shift()?.() ?? Response.json({ id: "test-email" });
    }
    return realFetch(input, init);
  };
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  url = `http://127.0.0.1:${address.port}/api/public/bookings`;
});

after(async () => {
  globalThis.fetch = realFetch;
  if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
  await mongoose.disconnect();
  await mongo?.stop();
});

function form(fields: Record<string, string | undefined> = {}) {
  const data = new FormData();
  for (const [name, value] of Object.entries({
    fullName: "Booking Fixture",
    email: "required@example.test",
    phoneNumber: "+84 912 345 678",
    consent: "true",
    website: "",
    ...fields,
  }))
    if (value !== undefined) data.set(name, value);
  return data;
}

let lastIp = 0;
async function post(
  data: FormData,
  { token = randomUUID(), key = randomUUID(), ip = `198.51.100.${++lastIp}` } = {},
) {
  const response = await realFetch(url, {
    method: "POST",
    body: data,
    headers: { "X-Turnstile-Token": token, "Idempotency-Key": key, "X-Forwarded-For": ip },
  });
  return { status: response.status, headers: response.headers, body: await response.json() };
}

test("required and optional bookings, E.164, date-only storage, consent and studio email", async () => {
  const required = await post(form());
  assert.equal(required.status, 201, JSON.stringify(required.body));
  const first = await Booking.findOne({ bookingCode: required.body.data.bookingCode }).lean();
  assert.equal(first?.phoneNumber, "+84912345678");
  assert.equal(first?.status, "PENDING");
  assert.ok(first?.consentAt instanceof Date);
  assert.equal(first?.preferredDateLocal, undefined);
  assert.equal(first?.description, undefined);

  const optional = form({
    email: "OPTIONAL@example.test",
    phoneNumber: "+44 7400 123456",
    preferredDate: "2099-05-01",
    instagram: "@Sample.Ink",
    description: "  A small tattoo.\n<img src=x onerror=alert(1)>  ",
  });
  optional.append("contactMethods", "whatsapp");
  optional.append("contactMethods", "zalo");
  optional.append("referenceImages", new Blob([png], { type: "image/png" }), "reference.png");
  const all = await post(optional);
  assert.equal(all.status, 201, JSON.stringify(all.body));
  const booking = await Booking.findOne({ bookingCode: all.body.data.bookingCode }).lean();
  assert.equal(booking?.email, "optional@example.test");
  assert.equal(booking?.phoneNumber, "+447400123456");
  assert.equal(booking?.preferredDateLocal, "2099-05-01");
  assert.equal(booking?.preferredDate, undefined);
  assert.equal(booking?.instagram, "sample.ink");
  assert.match(booking?.description ?? "", /^A small tattoo\.\r?\n<img src=x onerror=alert\(1\)>$/);
  assert.deepEqual(booking?.contactMethods, ["whatsapp", "zalo"]);
  assert.equal(booking?.referenceImages[0]?.deliveryType, "authenticated");
  assert.equal(uploads, 1);
  assert.equal(notifications.length, 0, "booking response does not wait for Resend");
  assert.equal(first?.bookingEmail, undefined, "private queue is omitted by default");
  await Promise.all([processBookingEmails(), processBookingEmails()]);
  assert.equal(notifications.length, 2);
  const requiredEmail = notifications.find((item) =>
    item.subject.includes(required.body.data.bookingCode),
  )!;
  const optionalEmail = notifications.find((item) =>
    item.subject.includes(all.body.data.bookingCode),
  )!;
  assert.match(requiredEmail.text, /Country: Vietnam/);
  assert.match(requiredEmail.text, /Reference images: 0/);
  assert.doesNotMatch(
    requiredEmail.text,
    /Instagram:|Preferred date:|Description:|WhatsApp:|Zalo:/,
  );
  assert.match(optionalEmail.text, /Country: United Kingdom/);
  assert.match(optionalEmail.text, /Submitted: .*\(Asia\/Ho_Chi_Minh\)/);
  assert.match(optionalEmail.text, /WhatsApp: Available \(self-reported\)\nZalo: Available/);
  assert.match(optionalEmail.text, /Email: optional@example.test/);
  assert.match(optionalEmail.text, /Instagram: @sample.ink/);
  assert.match(optionalEmail.text, /Preferred date: 2099-05-01/);
  assert.match(optionalEmail.text, /Reference images: 1/);
  assert.match(optionalEmail.text, /Booking status: PENDING/);
  assert.match(optionalEmail.html, /VIEW BOOKING IN ADMIN/);
  assert.ok(
    optionalEmail.html.includes(`https://localsmalltattoo.com.vn/admin/bookings/${booking?._id}`),
  );
  assert.match(optionalEmail.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(optionalEmail.html, /<img|image\/authenticated/);
  assert.doesNotMatch(optionalEmail.raw, /"attachments"/);
});

test("validation and Turnstile reject invalid bookings before uploading or notifying", async () => {
  for (const [field, value] of Object.entries({
    fullName: "",
    email: "wrong",
    phoneNumber: "+1 42",
    consent: undefined,
    preferredDate: "2000-01-01",
    instagram: "https://example.test",
    website: "spam",
  })) {
    const result = await post(form({ [field]: value }));
    assert.equal(result.status, 400);
    assert.ok(result.body.errors[field], field);
  }
  assert.equal((await post(form({ consent: "false" }))).status, 400);
  for (const token of ["", "invalid", "expired", "wrong-host", "wrong-action"]) {
    const result = await post(form(), { token });
    assert.equal(result.status, 400);
    assert.ok(result.body.errors.verification);
  }
  assert.equal((await post(form(), { token: "provider-down" })).status, 503);
  const oneUseToken = randomUUID();
  const firstUse = await post(form({ consent: "false" }), { token: oneUseToken });
  assert.ok(firstUse.body.errors.consent);
  const secondUse = await post(form(), { token: oneUseToken });
  assert.equal(secondUse.status, 400);
  assert.ok(secondUse.body.errors.verification);
  const fake = form();
  fake.append(
    "referenceImages",
    new Blob(["not image content"], { type: "image/png" }),
    "fake.png",
  );
  assert.ok((await post(fake)).body.errors.referenceImages);
  const tooLarge = form();
  tooLarge.append(
    "referenceImages",
    new Blob([new Uint8Array(20 * 1024 * 1024 + 2)], { type: "image/png" }),
    "large.png",
  );
  assert.ok((await post(tooLarge)).body.errors.referenceImages);
  const tooMany = form();
  for (let i = 0; i < 6; i++)
    tooMany.append("referenceImages", new Blob([png], { type: "image/png" }), `ref${i}.png`);
  assert.ok((await post(tooMany)).body.errors.referenceImages);
  assert.equal(uploads, 1);
  await processBookingEmails();
  assert.equal(notifications.length, 2);
});

test("concurrent duplicate claims and idempotent retries send one notification", async () => {
  const data = { email: "duplicate@example.test", phoneNumber: "+1 202 555 0143" };
  const one = randomUUID(),
    two = randomUUID();
  const responses = await Promise.all([
    post(form(data), { key: one }),
    post(form(data), { key: two }),
  ]);
  assert.deepEqual(responses.map((result) => result.status).sort(), [201, 409]);
  const winner = responses.findIndex((result) => result.status === 201);
  const replay = await post(form(data), { key: winner === 0 ? one : two });
  assert.equal(replay.status, 200);
  assert.equal(replay.body.data.bookingCode, responses[winner]!.body.data.bookingCode);
  assert.equal(
    (await post(form({ ...data, description: "Changed" }), { key: winner === 0 ? one : two }))
      .status,
    409,
  );
  assert.equal(await Booking.countDocuments({ email: data.email }), 1);
  await processBookingEmails();
  assert.equal(notifications.length, 3);
});

test("rate limits are server-side and use IP and normalized contact details", async () => {
  const ip = "203.0.113.1";
  for (let count = 0; count < 8; count++) {
    assert.equal((await post(form(), { ip, token: "invalid" })).status, 400);
  }
  const before = verified.length;
  const blockedIp = await post(form(), { ip });
  assert.equal(blockedIp.status, 429);
  assert.ok(Number(blockedIp.headers.get("Retry-After")) > 0);
  assert.equal(verified.length, before);
  const variants = ["+1 (415) 555-0132", "+14155550132", "+1 415 555 0132"];
  for (const [index, phoneNumber] of variants.entries()) {
    const result = await post(form({ email: `limit${index}@example.test`, phoneNumber }));
    assert.equal(result.status, index < 2 ? 201 : 429);
  }
  await processBookingEmails();
  assert.equal(notifications.length, 5);
});

test("Resend retries persist with the same payload and stop after acceptance or a terminal failure", async () => {
  const temporary = await post(
    form({ email: "retry@example.test", phoneNumber: "+1 202 555 0144" }),
  );
  const getJob = (code: string) =>
    Booking.findOne({ bookingCode: code }).select("+bookingEmail").lean();
  const makeDue = (code: string) =>
    Booking.updateOne(
      { bookingCode: code },
      {
        $set: { "bookingEmail.nextAttemptAt": new Date(0) },
      },
    );
  assert.equal(temporary.status, 201);
  const code = temporary.body.data.bookingCode;
  const start = notifications.length;
  resendResponses.push(
    () => new Response(null, { status: 429, headers: { "Retry-After": "120" } }),
  );
  await processBookingEmails();
  const queued = (await getJob(code))?.bookingEmail;
  assert.equal(queued?.state, "queued");
  assert.equal(queued?.attempts, 1);
  assert.ok(queued!.nextAttemptAt!.getTime() - Date.now() > 100_000);
  await Booking.updateOne({ bookingCode: code }, { $set: { status: "CONTACTED" } });
  await processBookingEmails();
  assert.equal(notifications.length, start + 1);
  // A worker might restart with a claimed job still marked as sending.
  await Booking.updateOne({ bookingCode: code }, { $set: { "bookingEmail.state": "sending" } });
  await makeDue(code);
  await processBookingEmails();
  assert.equal(notifications[start]?.key, notifications[start + 1]?.key);
  assert.equal(notifications[start]?.raw, notifications[start + 1]?.raw);
  const accepted = (await getJob(code))?.bookingEmail;
  assert.equal(accepted?.state, "accepted");
  assert.equal(accepted?.resendId, "test-email");
  assert.equal(accepted?.payload, undefined);

  const permanent = await post(
    form({ email: "reject@example.test", phoneNumber: "+1 202 555 0145" }),
  );
  assert.equal(permanent.status, 201);
  resendResponses.push(() => new Response(null, { status: 422 }));
  await processBookingEmails();
  const failed = (await getJob(permanent.body.data.bookingCode))?.bookingEmail;
  assert.equal(failed?.state, "failed");
  assert.equal(failed?.attempts, 1);
  assert.equal(failed?.payload, undefined);

  const exhausted = await post(
    form({ email: "exhaust@example.test", phoneNumber: "+1 202 555 0146" }),
  );
  assert.equal(exhausted.status, 201);
  for (let i = 0; i < 4; i++) {
    resendResponses.push(() => new Response(null, { status: 503 }));
    await makeDue(exhausted.body.data.bookingCode);
    await processBookingEmails();
  }
  const final = (await getJob(exhausted.body.data.bookingCode))?.bookingEmail;
  assert.equal(final?.state, "failed");
  assert.equal(final?.attempts, 4);
  const lastCount = notifications.length;
  await processBookingEmails();
  assert.equal(notifications.length, lastCount);
});
