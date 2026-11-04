import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import mongoose from "mongoose";
import { Writable } from "node:stream";

// Override all required configuration before importing the application. Never use Atlas.
Object.assign(process.env, {
  NODE_ENV: "test",
  MONGODB_URI: "mongodb://127.0.0.1:1/unused",
  JWT_SECRET: "test-only-secret-32-characters-long",
  CLOUDINARY_CLOUD_NAME: "test",
  CLOUDINARY_API_KEY: "test",
  CLOUDINARY_API_SECRET: "test",
  CLIENT_URL: "http://localhost:5173",
  COOKIE_NAME: "test_admin",
  COOKIE_SAME_SITE: "lax",
});
let mongo: MongoMemoryServer;
let server: Server;
let base: string;
let token: string;
let cookie: string;
const origin = "http://localhost:5173";
type Item = {
  _id: string;
  customerName: string;
  isPublic: boolean;
  isFeatured: boolean;
  permissionConfirmed?: boolean;
  [key: string]: unknown;
};
async function request(path: string, options: RequestInit = {}, auth = true) {
  const response = await fetch(base + path, {
    ...options,
    headers: {
      ...(auth ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => null);
  return { response, body };
}
function fixture(extra = {}) {
  return {
    customerName: "TEST FIXTURE — not a real customer",
    rating: 5,
    content: "Synthetic integration test only; never seeded in production.",
    reviewDate: "2026-10-20T00:00:00+07:00",
    ...extra,
  };
}
async function create(extra = {}): Promise<Item> {
  const result = await request("/api/admin/reviews", {
    method: "POST",
    body: JSON.stringify(fixture(extra)),
  });
  assert.equal(result.response.status, 201, JSON.stringify(result.body));
  return result.body.data.item;
}
before(
  async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    const { AdminModel } = await import("../src/models/admin.model.js");
    const bcrypt = await import("bcryptjs");
    await AdminModel.create({
      fullName: "Test Admin",
      email: "admin@example.test",
      passwordHash: await bcrypt.hash("test-password-123", 4),
      role: "OWNER",
    });
    const { app } = await import("../src/app.js");
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    base = `http://127.0.0.1:${address.port}`;
    const login = await request(
      "/api/admin/auth/login",
      {
        method: "POST",
        headers: { Origin: origin },
        body: JSON.stringify({
          email: "admin@example.test",
          password: "test-password-123",
          rememberMe: false,
        }),
      },
      false,
    );
    assert.equal(login.response.status, 200);
    token = login.body.data.token;
    cookie = login.response.headers.get("set-cookie")!.split(";")[0]!;
  },
  { timeout: 180000 },
);
after(async () => {
  if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
  await mongoose.disconnect();
  await mongo?.stop();
});

test("admin authentication, CSRF guard and obsolete endpoints", async () => {
  for (const [path, method] of [
    ["/api/admin/reviews", "GET"],
    ["/api/admin/reviews", "POST"],
    ["/api/admin/reviews/000000000000000000000001", "PATCH"],
    ["/api/admin/reviews/000000000000000000000001", "DELETE"],
  ]) {
    const result = await request(path!, { method }, false);
    assert.equal(result.response.status, 401);
  }
  const denied = await request(
    "/api/admin/reviews",
    {
      method: "POST",
      headers: { Cookie: cookie, Origin: "https://untrusted.example" },
      body: JSON.stringify(fixture()),
    },
    false,
  );
  assert.equal(denied.response.status, 403);
  const noOrigin = await request(
    "/api/admin/reviews",
    { method: "POST", headers: { Cookie: cookie }, body: JSON.stringify(fixture()) },
    false,
  );
  assert.equal(noOrigin.response.status, 403);
  const trusted = await request(
    "/api/admin/reviews",
    {
      method: "POST",
      headers: { Cookie: cookie, Origin: origin },
      body: JSON.stringify(fixture()),
    },
    false,
  );
  assert.equal(trusted.response.status, 201);
  for (const path of [
    "/api/admin/google-business/connect",
    "/api/admin/google-business/callback",
    "/api/admin/google-business/status",
  ])
    assert.equal((await request(path)).response.status, 404);
  assert.equal(
    (await request("/api/admin/google-reviews/sync", { method: "POST" })).response.status,
    404,
  );
});
test("validate content, rating, permissions, dates, query bounds and source URLs", async () => {
  for (const extra of [
    { rating: 0 },
    { rating: 6 },
    { rating: 2.5 },
    { content: "" },
    { content: "<script>alert(1)</script>" },
    { customerName: "" },
    { reviewDate: "invalid" },
    { isPublic: true },
    { publishFrom: "2026-11-05T00:00:00Z", publishUntil: "2026-11-05T00:00:00Z" },
    { sourceUrl: "javascript:alert(1)" },
    { sourceUrl: "http://maps.google.com/maps/1" },
    { sourceUrl: "https://www.google.com.evil.test/maps/1" },
    { sourceUrl: "https://www.google.com/search?q=maps" },
    { sourceUrl: "https://user@maps.google.com/1" },
    { sourceUrl: "https://maps.google.com:444/1" },
    { createdBy: "000000000000000000000001" },
  ]) {
    const result = await request("/api/admin/reviews", {
      method: "POST",
      body: JSON.stringify(fixture(extra)),
    });
    assert.equal(result.response.status, 400, JSON.stringify(extra));
  }
  for (const url of [
    "https://www.google.com/maps/reviews/test-fixture",
    "https://maps.app.goo.gl/test-fixture",
    "https://goo.gl/maps/test-fixture",
    "https://maps.google.com/maps/test-fixture",
  ])
    await create({ sourceUrl: url });
  assert.equal((await request("/api/public/reviews?limit=101", {}, false)).response.status, 400);
  assert.equal((await request("/api/admin/reviews/not-an-id")).response.status, 400);
  assert.equal((await request("/api/admin/reviews/000000000000000000000001")).response.status, 404);
});
test("CRUD, permission withdrawal, draft/featured coupling, search and persistence", async () => {
  const item = await create({
    customerName: "Unique [search] fixture",
    isPublic: true,
    permissionConfirmed: true,
    isFeatured: true,
    adminNote: "private",
  });
  const patch = (values: unknown) =>
    request(`/api/admin/reviews/${item._id}`, { method: "PATCH", body: JSON.stringify(values) });
  assert.equal(
    (await request(`/api/admin/reviews/${item._id}`)).body.data.item.adminNote,
    "private",
  );
  let updated = await patch({ permissionConfirmed: false });
  assert.equal(updated.body.data.item.isPublic, false);
  assert.equal(updated.body.data.item.isFeatured, false);
  assert.equal((await patch({ isPublic: true })).response.status, 400);
  updated = await patch({
    content: "Updated synthetic test text",
    rating: 1,
    displayOrder: 9,
    permissionConfirmed: true,
    isPublic: true,
    isFeatured: true,
  });
  assert.equal(updated.body.data.item.rating, 1);
  assert.equal(
    (await request(`/api/admin/reviews/${item._id}`)).body.data.item.content,
    "Updated synthetic test text",
  );
  updated = await patch({ isPublic: false });
  assert.equal(updated.body.data.item.isFeatured, false);
  const found = await request("/api/admin/reviews?status=draft&search=%5Bsearch%5D");
  assert.deepEqual(
    found.body.data.items.map((entry: Item) => entry._id),
    [item._id],
  );
  assert.equal(
    (await request(`/api/admin/reviews/${item._id}`, { method: "DELETE" })).response.status,
    200,
  );
  assert.equal((await request(`/api/admin/reviews/${item._id}`)).response.status, 404);
});
test("time-aware publication boundaries, >5 reviews, pagination, privacy and sorting", async () => {
  const { TestimonialModel } = await import("../src/models/testimonial.model.js");
  await TestimonialModel.deleteMany({}); // Isolated temporary database only.
  const future = new Date(Date.now() + 86400000).toISOString();
  const past = new Date(Date.now() - 86400000).toISOString();
  await create({ customerName: "hidden" });
  await create({
    customerName: "future",
    permissionConfirmed: true,
    isPublic: true,
    publishFrom: future,
  });
  await create({
    customerName: "expired",
    permissionConfirmed: true,
    isPublic: true,
    publishUntil: past,
  });
  for (let i = 0; i < 15; i++)
    await create({
      customerName: `Visible fixture ${i}`,
      rating: (i % 5) + 1,
      isPublic: true,
      permissionConfirmed: true,
      isFeatured: i < 2,
      displayOrder: i,
      adminNote: "never public",
      publishFrom: i === 14 ? past : null,
    });
  const first = await request("/api/public/reviews?limit=12", {}, false);
  assert.equal(first.body.data.items.length, 12);
  assert.equal(first.body.data.pagination.total, 15);
  assert.deepEqual(first.body.data.summary, { averageRating: 3, totalReviews: 15 });
  const featuredSummary = await request("/api/public/reviews?featured=true&limit=1", {}, false);
  assert.deepEqual(featuredSummary.body.data.summary, { averageRating: 3, totalReviews: 15 });
  const mobile = await request("/api/public/reviews?limit=3", {}, false);
  assert.deepEqual(
    mobile.body.data.items.map((entry: Item) => entry.customerName),
    ["Visible fixture 0", "Visible fixture 1", "Visible fixture 2"],
  );
  assert.equal(first.body.data.items[0].customerName, "Visible fixture 0");
  assert.equal(first.body.data.items[1].customerName, "Visible fixture 1");
  const second = await request("/api/public/reviews?limit=12&page=2", {}, false);
  assert.equal(second.body.data.items.length, 3);
  const ids = new Set(
    [...first.body.data.items, ...second.body.data.items].map((entry: Item) => entry._id),
  );
  assert.equal(ids.size, 15);
  for (const entry of first.body.data.items)
    for (const field of [
      "adminNote",
      "createdBy",
      "updatedBy",
      "permissionConfirmed",
      "publishFrom",
      "publishUntil",
      "__v",
      "isPublic",
    ])
      assert.equal(field in entry, false, field);
  assert.equal(
    (await request("/api/public/reviews?featured=true", {}, false)).body.data.items.length,
    2,
  );
  assert.equal((await request("/api/admin/reviews?status=scheduled")).body.data.items.length, 1);
  assert.equal((await request("/api/admin/reviews?status=expired")).body.data.items.length, 1);
  const { publicReviewFilter } = await import("../src/controllers/testimonial.controller.js");
  const now = new Date("2026-11-03T00:00:00Z");
  const boundary = await TestimonialModel.create(
    fixture({
      customerName: "boundary",
      isPublic: true,
      permissionConfirmed: true,
      publishFrom: now,
      publishUntil: new Date(now.getTime() + 1),
    }),
  );
  assert.ok(await TestimonialModel.exists({ _id: boundary._id, ...publicReviewFilter(now) }));
  assert.equal(
    await TestimonialModel.exists({
      _id: boundary._id,
      ...publicReviewFilter(new Date(now.getTime() + 1)),
    }),
    null,
  );
  await mongoose.disconnect();
  await mongoose.connect(mongo.getUri());
  assert.equal(await TestimonialModel.countDocuments(), 19);
});
test("unrelated public reads and protected admin routes remain mounted; logout works", async () => {
  for (const path of [
    "/api/health",
    "/api/public/business-settings",
    "/api/public/gallery",
    "/api/public/tattoo-styles",
    "/api/admin/dashboard/summary",
    "/api/admin/bookings",
    "/api/admin/tattoo-styles",
    "/api/admin/gallery",
    "/api/admin/pages/about",
  ])
    assert.equal((await request(path)).response.status, 200, path);
  const logout = await request(
    "/api/admin/auth/logout",
    { method: "POST", headers: { Cookie: cookie, Origin: origin } },
    false,
  );
  assert.equal(logout.response.status, 200);
  assert.match(logout.response.headers.get("set-cookie")!, /Expires=/);
});
test("booking image submission/management, Styles, Gallery, About CMS and settings regression", async () => {
  const { cloudinary } = await import("../src/config/cloudinary.js");
  const originalUpload = cloudinary.uploader.upload_stream;
  const originalDestroy = cloudinary.uploader.destroy;
  let uploadedBytes = 0;
  let sequence = 0;
  // Exercise the real multipart middleware and service pipeline; replace only external I/O.
  cloudinary.uploader.upload_stream = ((_options: unknown, callback: Function) =>
    new Writable({
      write(chunk, _encoding, done) {
        uploadedBytes += chunk.length;
        done();
      },
      final(done) {
        sequence++;
        callback(undefined, {
          secure_url: `https://res.cloudinary.com/test/image/upload/fixture-${sequence}.png`,
          public_id: `test/fixture-${sequence}`,
          width: 1,
          height: 1,
        });
        done();
      },
    })) as typeof originalUpload;
  cloudinary.uploader.destroy = (async () => ({ result: "ok" })) as typeof originalDestroy;
  const image = new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB", "base64")], {
    type: "image/png",
  });
  const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body) });
  try {
    const booking = new FormData();
    const tomorrow = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    for (const [key, value] of Object.entries({
      fullName: "Regression fixture",
      phoneNumber: "+84946752336",
      email: "fixture@example.test",
      preferredDate: tomorrow,
      preferredTimePeriods: "MORNING",
      description: "Synthetic booking fixture",
      consent: "true",
    }))
      booking.append(key, value);
    booking.append("referenceImages", image, "fixture.png");
    const submitted = await request(
      "/api/public/bookings",
      { method: "POST", body: booking },
      false,
    );
    assert.equal(submitted.response.status, 201, JSON.stringify(submitted.body));
    const { BookingModel } = await import("../src/models/booking.model.js");
    const stored = await BookingModel.findOne({ bookingCode: submitted.body.data.bookingCode });
    assert.ok(stored);
    assert.equal(stored.referenceImages.length, 1);
    for (const status of ["CONTACTED", "CONFIRMED"])
      assert.equal(
        (
          await request(
            `/api/admin/bookings/${stored._id}/status`,
            json("PATCH", { status, note: "Test" }),
          )
        ).response.status,
        200,
      );
    assert.equal(
      (
        await request(
          `/api/admin/bookings/${stored._id}/schedule`,
          json("PATCH", {
            startAt: `${tomorrow}T10:00:00+07:00`,
            endAt: `${tomorrow}T11:00:00+07:00`,
            note: "Test",
          }),
        )
      ).response.status,
      200,
    );
    assert.equal(
      (
        await request(
          `/api/admin/bookings/${stored._id}/notes`,
          json("POST", { content: "Synthetic admin note" }),
        )
      ).response.status,
      201,
    );
    const styleForm = new FormData();
    for (const [key, value] of Object.entries({
      name: "Regression style",
      slug: "regression-style",
      shortDescription: "Synthetic short description",
      description: "Synthetic full description",
      isPublished: "true",
      isFeatured: "false",
      displayOrder: "0",
      coverAlt: "Synthetic cover",
    }))
      styleForm.append(key, value);
    styleForm.append("coverImage", image, "fixture.png");
    const style = await request("/api/admin/tattoo-styles", { method: "POST", body: styleForm });
    assert.equal(style.response.status, 201, JSON.stringify(style.body));
    const styleId = style.body.data.style._id;
    styleForm.set("name", "Updated regression style");
    const updatedStyle = await request(`/api/admin/tattoo-styles/${styleId}`, {
      method: "PATCH",
      body: styleForm,
    });
    assert.equal(updatedStyle.response.status, 200, JSON.stringify(updatedStyle.body));
    assert.equal(updatedStyle.body.data.style.name, "Updated regression style");
    assert.equal((await request(`/api/admin/tattoo-styles/${styleId}`)).response.status, 200);
    const galleryForm = new FormData();
    const galleryFields = {
      title: "Synthetic gallery item",
      caption: "Test",
      alt: "Synthetic image",
      type: "TATTOO_WORK",
      tattooStyleIds: [styleId],
      isPublished: true,
      isFeatured: false,
      displayOrder: 0,
      photographedAt: "",
    };
    for (const [key, value] of Object.entries(galleryFields)) {
      if (Array.isArray(value)) value.forEach((entry) => galleryForm.append(key, entry));
      else galleryForm.append(key, String(value));
    }
    galleryForm.append("image", image, "fixture.png");
    const gallery = await request("/api/admin/gallery", { method: "POST", body: galleryForm });
    assert.equal(gallery.response.status, 201, JSON.stringify(gallery.body));
    const galleryId = gallery.body.data.item._id;
    assert.equal(
      (
        await request(
          `/api/admin/gallery/${galleryId}`,
          json("PATCH", { ...galleryFields, caption: "Updated fixture" }),
        )
      ).response.status,
      200,
    );
    assert.equal(
      (await request(`/api/public/gallery/${galleryId}`, {}, false)).response.status,
      200,
    );
    assert.equal(
      (await request(`/api/admin/gallery/${galleryId}`, { method: "DELETE" })).response.status,
      200,
    );
    const about = (await request("/api/admin/pages/about")).body.data.content;
    assert.equal(
      (await request("/api/admin/pages/about", json("PATCH", about))).response.status,
      200,
    );
    assert.equal(
      (await request("/api/admin/pages/about/publish", json("PATCH", {}))).response.status,
      200,
    );
    assert.equal((await request("/api/public/pages/about", {}, false)).response.status, 200);
    const settings = (await request("/api/admin/business-settings")).body.data.settings;
    settings.location.googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=test-fixture";
    const saved = await request("/api/admin/business-settings", json("PATCH", settings));
    assert.equal(saved.response.status, 200, JSON.stringify(saved.body));
    assert.equal(
      (await request(`/api/admin/tattoo-styles/${styleId}`, { method: "DELETE" })).response.status,
      200,
    );
    assert.ok(uploadedBytes > 0);
  } finally {
    cloudinary.uploader.upload_stream = originalUpload;
    cloudinary.uploader.destroy = originalDestroy;
  }
});
