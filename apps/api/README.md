# Local Small Tattoo API

Express API for public booking requests, MongoDB persistence, and Cloudinary image uploads.

## Setup

1. Copy `.env.example` to `.env` and provide MongoDB Atlas and Cloudinary credentials.
2. Run `npm install`.
3. Start the API with `npm run dev`.

The API defaults to `http://localhost:5000`. The public booking endpoint is:

```text
POST /api/public/bookings
```

## Google Business Profile reviews

Set these API environment variables after configuring an approved Google Cloud OAuth web client:

```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5000/api/admin/google-business/callback
```

The authorized redirect URI must match exactly. In the admin panel, open **Reviews** and connect Google. A sync imports reviews as hidden; an admin must explicitly mark a review public before it is returned by `GET /api/public/reviews`.

The request must use `multipart/form-data`. `preferredTimePeriods` may be repeated for each selected period. Accepted values are `MORNING`, `NOON`, `AFTERNOON`, and `EVENING`.

## Commands

```bash
npm run dev
npm run typecheck
npm run build
npm start
```
