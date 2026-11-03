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
a trusted Origin; non-browser clients can use Bearer JWT authentication. Public
booking still accepts `multipart/form-data` at `POST /api/public/bookings`, with
up to 5 reference images and repeated `preferredTimePeriods` values (`MORNING`,
`NOON`, `AFTERNOON`, `EVENING`).

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
