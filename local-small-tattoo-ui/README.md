# Local Small Tattoo UI

React, TypeScript, Vite and React Router. Public pages: Home, Booking, Styles,
About, Gallery and Contact. `/admin` contains authenticated studio management.

## Local development and verification

Use a Node version supported by the installed Vite release (Node 24 is used for verification).

```sh
npm ci
npm run dev
npm run build
npm run preview
npx playwright install chromium
npm run test:ui
```

`VITE_API_URL` points to the API origin, without `/api`, defaulting to
`http://localhost:5000`. Browser tests use mocked API responses and synthetic test
fixtures; they never create production testimonials. See `../apps/api` for real
MongoDB integration tests. No lint script is configured.

## Source structure

```text
public/brand/logo.png                  Local logo (preserves supplied PNG format)
public/images/home/hero.png            Supplied original Hero image
public/images/home/hero.webp           Full-size optimized Hero
public/images/home/hero-1200.webp      Medium Hero
public/images/home/hero-800.webp       Small Hero
src/config/siteAssets.ts              Centralized image paths
src/config/siteConfig.ts              Fixed identity, contact, social, links, timezone
src/app/App.tsx                       Public/admin routes and providers
src/components/                       Common, layout, admin, legal and SEO components
src/features/reviews/                 Manual testimonial API, types, form and cards
src/features/{home,about,booking,gallery,tattooStyles,businessSettings,admin}/
src/pages/                            Public pages and admin pages
src/styles/                           Shared, page and responsive styles
tests/testimonials.spec.ts            Browser tests and timezone checks
```

## Changing logo and Hero

Replace `public/brand/logo.png` with the approved logo. If changing format, update
`src/config/siteAssets.ts` and the favicon MIME type in `src/main.tsx`.
Header, Footer and splash screen share `BrandLogo`. Missing images fall back to
the business name. The old `/logo.png` is no longer referenced.

Replace the Hero at `public/images/home/hero.webp` and its 800px/1200px variants.
Keep the aspect ratio and width descriptors in `HeroSection.tsx` synchronized if
the source dimensions change. Current original: 1620 × 1073. The Hero uses
`srcset`, high fetch priority and reserved layout space; it does not lazy-load.
If an asset is missing, the dark background, overlay, heading and CTA remain.

Hero text, visibility, subtitle and CTA remain editable in Home CMS. Home and
About still share the existing versioned `PageContent` document and publication
snapshot. Home Hero background and logo are no longer editable via CMS.

## Changing fixed public information

Edit `src/config/siteConfig.ts`, then rebuild and redeploy. The phone
`+84 946 752 336`, email `booking.localsmalltattoo@gmail.com` and directions URL
were copied from existing API defaults. Verify these values before deployment.

Social URLs, secondary phone, Google review-list URL and write-review URL were
not present in repository configuration. They remain empty. Add only real URLs;
empty social/review actions stay hidden. The directions URL is a business map
search, not a direct review URL.

Business Settings still manages address, hours, description, map embed,
coordinates and booking notice. Its old documents and fields are retained.
Header, splash, floating contacts and legal contacts no longer need the Business
Settings context. The global provider still fetches once because address/hours
are used by the public layout and pages.

## Managing testimonials at `/admin/reviews`

1. Sign in and choose **Add testimonial**.
2. Enter the authorized customer name, original wording, 1–5 stars and original
   review date. Use plain text; no HTML.
3. Select Direct customer or Customer authorized. Optionally enter an accurate
   HTTPS Google Maps source URL. Do not use a generic business map URL as though
   it identified a specific review.
4. Confirm permission to publish. A draft can be saved without permission.
5. Enable Public and optionally Featured. Use **Save changes** to persist.
6. Optionally set Display from / Display until in `Asia/Ho_Chi_Minh`. The UI
   converts these studio wall-clock values into UTC, independently of browser
   timezone. The original review date is separate and displayed on the card.
7. Change Display order to reorder (smaller first). Use list status/search/sort
   controls and pagination to manage any number of entries.
8. Preview uses the same card as Home. Hide unpublishes immediately; deleting
   requires confirmation. Withdrawing permission unpublishes and removes Featured.

Public visibility requires Public + confirmed permission + a currently active
schedule. Start is inclusive, end is exclusive. Empty start means immediate;
empty end means no expiration. End must be after start. No cron is required.
Public requests are not cached so each fetch reevaluates the current schedule;
an already-open page refreshes its data when reloaded or paginated.

Home requests 12 testimonials per page and exposes Previous/Next. Featured comes
first, then display order, then original review date descending, then stable ID.
Empty collections hide the section. Source links open a new tab with
`noopener noreferrer`; entries without sources remain regular readable cards.

This is a manual CMS. It does not synchronize Google Reviews, require Google
OAuth/Places/Billing, or display an official Google average. No old Google review
text is imported. Test fixtures are restricted to automated tests.

## Deployment

Cloudflare Pages: root `local-small-tattoo-ui`, build `npm ci && npm run build`,
output `dist`, set `VITE_API_URL` to the Render API origin. Include `public`
assets; Pages serves these via `dist`. Keep SPA fallback behavior for deep links.
The repository also retains its existing Wrangler static-assets deployment
(`npm run deploy`); no hosting migration is performed by this refactor.

Deploy the API before or alongside the UI because the public review response
now uses `{ items, pagination }`. Existing robots, sitemap, canonical and Open
Graph behavior are retained; no curated aggregate rating is added.

See [the refactor report](../docs/refactor-report.md) for the file inventory,
API/schema details, checks and remaining operational steps.
