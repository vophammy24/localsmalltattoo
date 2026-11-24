# Local Small Tattoo API

Express 5, TypeScript, MongoDB/Mongoose and Cloudinary. Public booking/gallery/
styles/CMS/business settings and authenticated admin management remain available.

## Setup

Use Node 20–24 (Node 24 used for verification). Copy `.env.example` to `.env`,
provide MongoDB, JWT and Cloudinary credentials, then:

```sh
npm ci
npm run dev
npm run typecheck
npm run build
npm test
npm start
```

Default origin: `http://localhost:5000`. `CLIENT_URL` is a comma-separated list of
trusted frontend origins. Health: `GET /api/health`. Cookie admin writes require
a trusted Origin. Non-browser admin clients can use Bearer JWT authentication.

## Booking setup

Create a Cloudflare Turnstile widget in **Managed** mode for the public site.
Set `VITE_TURNSTILE_SITE_KEY` in the frontend build environment and set
`TURNSTILE_SECRET_KEY` in the API runtime environment. Configure
`TURNSTILE_HOSTNAMES` for that deployment. Use a separate real widget for a
full local or staging integration check. Cloudflare's dummy keys do not return
the hostname and action needed by this API's checks. Automated tests mock
these checks. Missing server configuration blocks booking submissions. If a frontend
CSP is configured on the hosting platform, allow
`https://challenges.cloudflare.com` for scripts and frames.

`POST /api/public/bookings` accepts length-delimited `multipart/form-data`.
Send a fresh Turnstile token in `X-Turnstile-Token` and a client-generated UUID
in `Idempotency-Key`. On an uncertain failure, retry the same payload with
the same key and a fresh token. A replay returns 200 with the original booking
reference. New bookings return 201. Validation responses use
`errors: { fieldName: [message] }`. Limits return 429 with `Retry-After`.

The API uses the existing MongoDB connection for shared counters and duplicate
claims. Defaults are 20 attempts per IP and four per normalized phone or email
per 15-minute window, plus 15 minutes of duplicate detection. See
`.env.example` for the overrides. IP limiting uses Express's existing one-hop
trusted-proxy setting. In other topologies, configure the trusted proxy for
the deployment before relying on the forwarded address.

MongoDB must allow the application to create the `bookingrates` and
`bookingclaims` collections and their TTL/unique indexes, plus the sparse
unique submission key and fingerprint index on `bookings`. No backfill or
deletion is required. New requests store a date-only `preferredDateLocal` and
`consentAt`. Historical preferred dates, time periods and existing reference
image URLs remain readable. New private Cloudinary references are delivered
to authorized Admin users via signed, 30-minute URLs. Reopen or refresh the
booking detail if an image link expires.

### Resend studio notifications

Set `BOOKING_EMAIL_API_KEY`, `BOOKING_EMAIL_FROM` (a verified Resend sender),
and `BOOKING_EMAIL_TO` (the studio administrator). These are server-side
settings. Only bookings created with all three settings are queued. Previously
saved bookings are unaffected and are not emailed.

The booking insert also saves the email job. The API worker polls MongoDB
every 15 seconds and only sends jobs for saved bookings. The HTML and text
email includes the booking reference, submission time in Asia/Ho_Chi_Minh,
customer and request details, and a link to
`https://localsmalltattoo.com.vn/admin/bookings/<id>` that requires admin login.
Restrict the recipient inbox to staff authorized to view booking information.
Reference images are represented by a count.

MongoDB atomically claims each email job. On a temporary failure the worker
uses the same serialized body and Resend idempotency key for up to four total
attempts. Retries are scheduled after 1, 5, and 20 minutes, respecting a
longer `Retry-After` up to the 23-hour job expiry. Expired claims can be
recovered after a worker restart. Terminal state and the Resend message ID
are retained, while the queued email body is removed. `accepted` means the
Resend API accepted the send, and inbox delivery can be checked in Resend.
Delivery errors leave the saved booking available in Admin.

The API must stay running to process pending jobs. MongoDB needs permission to
create the booking email queue index. No backfill is needed. Local automated
tests mock Resend. Use a separate staging sender and inbox for a live check
before rollout.

## Manual testimonial API

The new `Testimonial` model uses the separate `testimonials` MongoDB collection.
No migration, seed or import from Google collections runs. It starts empty.

| Method | Endpoint                 | Behavior                                         |
| ------ | ------------------------ | ------------------------------------------------ |
| GET    | `/api/admin/reviews`     | Paginated admin list, status counts, search/sort |
| POST   | `/api/admin/reviews`     | Create authorized testimonial or draft           |
| GET    | `/api/admin/reviews/:id` | Admin detail including private note              |
| PATCH  | `/api/admin/reviews/:id` | Partial update, schedule, visibility/order       |
| DELETE | `/api/admin/reviews/:id` | Remove one testimonial                           |
| GET    | `/api/public/reviews`    | Currently publishable testimonials only          |

All admin routes use existing `requireAdmin` authentication. Public queries:
`page=1`, `limit=12` (1–100), optional `featured=true|false`. Admin additionally
supports `status=all|published|draft|scheduled|expired|featured`, `search` (name or
content), and `sort=order|date|name`. Responses use
`{ success: true, data: { items, pagination: { page, limit, total, totalPages } } }`.
Admin list also returns global counts. No total entry limit exists.

Create/update fields:

| Field                      | Validation/default                                       |
| -------------------------- | -------------------------------------------------------- |
| customerName               | Required text, 1–120 characters                          |
| rating                     | Required integer, 1–5                                    |
| content                    | Required plain text, 1–5000 characters; HTML rejected    |
| reviewDate                 | Required ISO timestamp with offset; stored as UTC Date   |
| sourceType                 | DIRECT_CUSTOMER (default) or CUSTOMER_AUTHORIZED         |
| sourceUrl                  | Optional HTTPS Google Maps URL, default empty            |
| isPublic / isFeatured      | Boolean, default false                                   |
| displayOrder               | Non-negative integer, default 0                          |
| publishFrom / publishUntil | ISO timestamps with offset or null, default null         |
| permissionConfirmed        | Boolean, default false; required true before publication |
| adminNote                  | Private text, max 5000 characters                        |
| createdBy / updatedBy      | Set from authenticated admin, not accepted from payload  |
| createdAt / updatedAt      | Mongoose timestamps                                      |

Backend queries enforce `isPublic && permissionConfirmed`, start <= now (or
null), end > now (or null). Start must be before end. Withdrawing permission
unpublishes; hiding clears Featured. Sort: Featured descending, displayOrder
ascending, reviewDate descending, `_id` ascending. Public projection excludes
notes, audit IDs, permission and publication metadata. Reviews use `no-store`;
no cron is needed to activate or expire entries.

Allowed source hosts: google.com/www.google.com under `/maps`, maps.google.com,
maps.app.goo.gl, and goo.gl under `/maps/`. HTTPS only; credentials and custom
ports rejected. Validation checks URL structure, not the destination of shortened
links or whether the URL identifies the entered review. Operators must verify
accuracy and permission. No redirect endpoint or network scraping is introduced.

## Tests and scope

### Manually maintained Google Maps rating summary

Authenticated `GET /api/admin/reviews/google-summary` reads the stored summary.
`PATCH` accepts `{ enabled, averageRating, totalReviews }`: rating is 1-5 with
one decimal place (or null while disabled), count is a non-negative integer,
and enabling requires a rating and positive count. The server records updatedAt
and the editing admin. Cookie authentication keeps the existing CSRF checks.

The optional `BusinessSettings.googleReviewSummary` subdocument stores this
snapshot. Old records remain unchanged and default to disabled; no migration,
Google API, synchronization, scraping or individual-review import is needed.
Updating other Business Settings preserves the snapshot.

Public reviews add `data.googleMapsSummary`: `{ averageRating, totalReviews,
updatedAt }` when enabled and valid, otherwise null. Existing `data.summary`
still reports only eligible CMS testimonials, and pagination counts only actual
testimonials. The frontend prefers the Google Maps snapshot when present,
identifies it as manually updated, and can show it with an empty testimonial
collection. Neither set of ratings is added to structured AggregateRating data.

`npm test` runs Node's test runner via tsx against a temporary local MongoDB
managed by mongodb-memory-server-core. The first run downloads a MongoDB test
binary. Configuration is overridden before importing the app: no Atlas, real
Cloudinary uploads or production fixtures are used. Tests cover CRUD, permissions,
schedule boundaries, pagination beyond five entries, privacy, URLs, authentication,
CSRF, persistence across reconnect and existing route smoke checks.

Frontend browser tests live in `../../local-small-tattoo-ui`. These tests do not
replace live acceptance checks for external Cloudinary or deployment configuration.

## Render deployment and old Google credentials

Existing `../../render.yaml` build/start/health commands remain valid. Run
`npm ci && npm run build` and `npm start`. Keep `MONGODB_URI`, `JWT_SECRET`,
Cloudinary variables, `CLIENT_URL` and cookie configuration. No new runtime
environment variables or Google Cloud Billing are needed for testimonials.
MongoDB permissions must permit the new `testimonials` collection/indexes.

Google OAuth routes, sync service, models and the `googleapis` dependency are
removed. Google variables are no longer validated or read. This refactor does
not modify actual Render environment variables or delete database collections.

An authorized operator should separately revoke the old app grant in the Google
account's third-party connections (and remove the obsolete OAuth client where
appropriate). Review and securely remove obsolete GOOGLE_CLIENT_ID,
GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI or any token encryption/Places settings
in Render only after verifying no other deployment uses them. Retained
`googlebusinessconnections` documents may contain refresh tokens: they are no
longer registered, read or exposed by this app. Back up according to studio
policy, then use an authorized database session to remove obsolete connection
credentials. Old `googlereviews` records stay intact until separately approved
cleanup; do not silently import their text as authorized testimonials.
