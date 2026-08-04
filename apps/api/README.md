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

The request must use `multipart/form-data`. `preferredTimePeriods` may be repeated for each selected period. Accepted values are `MORNING`, `NOON`, `AFTERNOON`, and `EVENING`.

## Commands

```bash
npm run dev
npm run typecheck
npm run build
npm start
```
