# Local Small Tattoo refactor report

Date: 3 November 2026. Changes implemented locally; no production deployment or
destructive database operation was performed.

## 1–3. Created, modified and removed files

The full inventory appears at the end of this report. Existing modified asset
work in the workspace was preserved. The supplied logo is now in
`local-small-tattoo-ui/public/brand/logo.png`; the supplied `hero.png` remains
alongside the generated WebP variants. No new logo, photograph or testimonial
was fabricated.

Removed active Google integration files:

- `apps/api/src/controllers/google-review.controller.ts`
- `apps/api/src/services/google-business.service.ts`
- `apps/api/src/models/google-review.model.ts`
- `apps/api/src/models/google-business-connection.model.ts`
- `apps/api/src/routes/google-review.routes.ts`
- `local-small-tattoo-ui/src/features/reviews/api/googleReviewsApi.ts`

Also removed `googleapis`, active Google OAuth environment validation, connection/
sync controls and the unused hardcoded Google review array. Historical Google
collections remain untouched; there is no automatic import into testimonials.

## 4. Updated structure

```text
local-small-tattoo-ui/
  public/brand/logo.png
  public/images/home/{hero.png,hero.webp,hero-1200.webp,hero-800.webp,README.md}
  src/config/{siteAssets.ts,siteConfig.ts}
  src/features/reviews/
    api/testimonialApi.ts
    types/testimonial.ts
    utils/testimonialTime.ts
    components/{TestimonialCard,TestimonialForm,TestimonialsSection}.tsx
  src/pages/admin/AdminReviewsPage.tsx
  src/styles/testimonials.css
  tests/testimonials.spec.ts
  playwright.config.ts
apps/api/
  src/models/testimonial.model.ts
  src/validators/testimonial.validator.ts
  src/controllers/testimonial.controller.ts
  src/routes/testimonial.routes.ts
  src/middlewares/csrf.middleware.ts
  tests/testimonials.test.ts
docs/refactor-report.md
```

Existing booking, Styles, Gallery, About, business settings and admin architecture
is retained. Home/About continue sharing their existing versioned CMS document.

## 5. Testimonial schema

New model `Testimonial`, separate collection `testimonials`:

```text
customerName: required text, max 120
rating: required integer, 1–5
content: required plain text, max 5000
reviewDate: required Date (UTC)
sourceType: DIRECT_CUSTOMER | CUSTOMER_AUTHORIZED
sourceUrl: optional HTTPS Google Maps URL
isPublic: false by default
isFeatured: false by default
displayOrder: non-negative integer, default 0
publishFrom / publishUntil: nullable UTC Dates
permissionConfirmed: false by default
adminNote: private text, max 5000
createdBy / updatedBy: authenticated Admin references
createdAt / updatedAt: automatic timestamps
```

The API rejects publication without permission and invalid schedules. Hiding
clears Featured; permission withdrawal unpublishes. Public responses use an
explicit projection excluding private notes, permission, audit IDs and internal
publication metadata. Unknown mutation fields are rejected.

## 6–7. Endpoints

| Method             | Endpoint                 | Access                           |
| ------------------ | ------------------------ | -------------------------------- |
| GET, POST          | `/api/admin/reviews`     | Existing admin authentication    |
| GET, PATCH, DELETE | `/api/admin/reviews/:id` | Existing admin authentication    |
| GET                | `/api/public/reviews`    | Current publishable entries only |

Public default: `?limit=12&page=1`, optional `featured=true|false`. Per-page limits
are 1–100; there is no five-review or total database limit. Admin lists offer
server-side status filters, name/content search, order/date/name sorting and
global counts. Sorting is deterministic, ending with `_id` ascending.

## 8–9. Assets and fixed configuration

- Logo: `local-small-tattoo-ui/public/brand/logo.png` (actual PNG preserved).
- Hero: `local-small-tattoo-ui/public/images/home/hero.webp` (173,630 bytes).
- Responsive Hero: `hero-1200.webp` (114,148 bytes), `hero-800.webp` (63,406 bytes).
- Original provided photograph: `hero.png` (2,009,251 bytes), retained.
- Paths: `local-small-tattoo-ui/src/config/siteAssets.ts`.
- Contact/social/fixed links/timezone: `local-small-tattoo-ui/src/config/siteConfig.ts`.

Logo is shared by Header, Footer, splash and favicon. Hero loads locally with
responsive sources, explicit dimensions and high priority; CMS text/visibility/
CTA remain dynamic. Broken images degrade to text or the existing dark Hero.

Public contact information uses the existing default phone `+84 946 752 336`
and email `booking.localsmalltattoo@gmail.com`. The directions URL is copied
from existing configuration. No social or review URLs were invented.
Address, opening hours, map embed, coordinates, description and booking notice
remain backend-powered. Static fields and Hero image upload controls were
removed from admin forms with explanations pointing to source configuration.

## 10. CMS workflow

At `/admin/reviews`, Add testimonial → enter customer name, original text,
rating and original review date → optionally provide accurate source URL →
confirm permission → enable Public/Featured → save. Save draft keeps it hidden.
Preview uses the same card component as Home. Edit Display order to reorder;
search/status/sort and pagination support growing collections. Hide and delete
are available; deleting requires confirmation. Internal notes stay private.

## 11. Scheduling

Backend visibility: `isPublic && permissionConfirmed`, `publishFrom <= now` or
null, `publishUntil > now` or null. Start is inclusive; end is exclusive. If both
exist, start must precede end. All stored timestamps are UTC. Admin inputs and
public review dates use `SITE_CONFIG.timezone`, default `Asia/Ho_Chi_Minh`,
independently of the administrator's browser timezone. Original review date is
separate from publication dates. No cron; every public query checks the time.
`Cache-Control: no-store` prevents cached API schedules. Already-open pages get
fresh data on reload or pagination; no live timer/subscription was introduced.

## 12. Google Maps behavior

Cards without a source are ordinary articles. Cards with a validated source are
semantic anchors, opening a new tab with `rel="noopener noreferrer"`, labeled
View on Google Maps. Supported hosts and paths are documented in the API README.
HTTPS, hostname, credentials and ports are checked; unsafe schemes and lookalike
hosts are rejected. The operator must verify the source belongs to the entered
review; URL validation does not resolve short-link destinations or establish
permission. There is no scraping, synchronization, OAuth or redirect service.

The curated collection is labeled Customer Reviews and has no official Google
average or fabricated SEO aggregate rating. Global Google-review actions remain
hidden until actual URLs are supplied.

## 13–15. Verification

- UI: `npm run build` completed successfully (TypeScript + production Vite build).
- API: `npm run build` completed successfully (TypeScript).
- API: `npm test`, 6 integration tests passed using an isolated temporary MongoDB.
- UI: `npm run test:ui`, 6 Playwright tests passed in Chromium.
- Browser coverage: 1440px, 768px and 390px; loaded local assets, no horizontal
  overflow, 12 cards on page one/3 on page two, source-link attributes, original
  review dates, fixed contacts, empty data, asset failure, form validation,
  preview, permission withdrawal and studio-to-UTC payload conversion.
- API coverage: protected CRUD, URL/rating/date/text validation, CSRF rejection,
  schedule boundaries, hidden/future/expired exclusion, >5 entries, pagination,
  field privacy, deterministic sort priority, reconnect persistence and old
  Google routes returning 404.
- Regression coverage: login/logout, public/admin read routes, booking multipart
  image pipeline and appointment management, Styles CRUD, Gallery CRUD, About
  draft/publish and Business Settings save. Only Cloudinary external I/O is stubbed.
- No lint script exists. Changed source/config/documentation was formatted with
  the existing Prettier configuration. Git whitespace validation is included.

Synthetic fixtures only exist in automated tests and temporary MongoDB. No real
customer, Atlas database or production review collection was used by tests.

## 16. Render steps

Redeploy the API using existing `render.yaml`: `npm ci && npm run build`, then
`npm start`, with health check `/api/health`. Keep MongoDB, JWT, Cloudinary,
CLIENT_URL and cookie settings. Allow the database user to create the new
collection/indexes. No new runtime variable, cron or billing service is required.
This refactor does not edit the actual Render environment. Deploy API before or
alongside UI because the public review response now returns items/pagination.

An authorized operator should separately revoke the old Google account app grant,
review/remove the obsolete OAuth client if unused, then remove unused Google
variables in Render. Retained GoogleBusinessConnection records may contain old
refresh tokens; the application no longer registers, reads or exposes them.
After an approved backup/retention review, remove obsolete credentials through
an authorized database session. Old Google review data needs separate approval
for cleanup and must never be silently relabeled as authorized testimonials.

## 17. Cloudflare steps

For Pages, root `local-small-tattoo-ui`, build `npm ci && npm run build`, output
`dist`, and set `VITE_API_URL` to the API origin. Publish all generated assets and
keep SPA deep-link fallback. The repository's existing Wrangler static-assets
configuration is retained; no automatic migration from that deployment to Pages
was performed. No Google OAuth/Places/Billing variables are required by UI.

## 18. Operator inputs

Images are supplied and usable. Verify the existing phone/email/directions URL.
The following remain empty because no real values were available in repository
configuration: secondary phone; Instagram, Facebook, TikTok, Zalo, Messenger,
WhatsApp; Google review-list URL; Google write-review URL. Supply only confirmed
values in `siteConfig.ts`, rebuild and redeploy. Add authorized testimonials in
CMS; the new production collection starts empty.

## 19. Limits

Live Atlas/Cloudinary operations and hosted Render/Cloudflare behavior have not
been exercised. Cloudinary is stubbed only in regression tests, and browser tests
use API fixtures. No Artists CRUD module exists in the inspected repository, so
there is no separate Artists feature to test. Dependency installs reported npm
audit findings (API: 6; UI: 4); broad dependency/security upgrades were not part
of this refactor. No deployment, remote environment cleanup, Google credential
revocation or historical database cleanup was executed.

## Full file inventory

### Created / newly tracked assets

- `apps/api/src/controllers/testimonial.controller.ts`
- `apps/api/src/middlewares/csrf.middleware.ts`
- `apps/api/src/models/testimonial.model.ts`
- `apps/api/src/routes/testimonial.routes.ts`
- `apps/api/src/validators/testimonial.validator.ts`
- `apps/api/tests/testimonials.test.ts`
- `docs/refactor-report.md`
- `local-small-tattoo-ui/playwright.config.ts`
- `local-small-tattoo-ui/public/brand/logo.png`
- `local-small-tattoo-ui/public/images/home/README.md`
- `local-small-tattoo-ui/public/images/home/hero-1200.webp`
- `local-small-tattoo-ui/public/images/home/hero-800.webp`
- `local-small-tattoo-ui/public/images/home/hero.png`
- `local-small-tattoo-ui/public/images/home/hero.webp`
- `local-small-tattoo-ui/src/config/siteAssets.ts`
- `local-small-tattoo-ui/src/config/siteConfig.ts`
- `local-small-tattoo-ui/src/features/reviews/api/testimonialApi.ts`
- `local-small-tattoo-ui/src/features/reviews/components/TestimonialCard.tsx`
- `local-small-tattoo-ui/src/features/reviews/components/TestimonialForm.tsx`
- `local-small-tattoo-ui/src/features/reviews/components/TestimonialsSection.tsx`
- `local-small-tattoo-ui/src/features/reviews/types/testimonial.ts`
- `local-small-tattoo-ui/src/features/reviews/utils/testimonialTime.ts`
- `local-small-tattoo-ui/src/styles/testimonials.css`
- `local-small-tattoo-ui/tests/testimonials.spec.ts`

### Modified

- `apps/api/.env.example`
- `apps/api/README.md`
- `apps/api/package-lock.json`
- `apps/api/package.json`
- `apps/api/src/app.ts`
- `apps/api/src/config/env.ts`
- `apps/api/src/middlewares/error.middleware.ts`
- `local-small-tattoo-ui/.gitignore`
- `local-small-tattoo-ui/README.md`
- `local-small-tattoo-ui/index.html`
- `local-small-tattoo-ui/package-lock.json`
- `local-small-tattoo-ui/package.json`
- `local-small-tattoo-ui/src/components/common/BrandLogo.tsx`
- `local-small-tattoo-ui/src/components/common/FloatingContactButtons.tsx`
- `local-small-tattoo-ui/src/components/common/WebsiteIntro.tsx`
- `local-small-tattoo-ui/src/components/layout/Footer.tsx`
- `local-small-tattoo-ui/src/components/layout/Header.tsx`
- `local-small-tattoo-ui/src/components/legal/LegalDocuments.tsx`
- `local-small-tattoo-ui/src/components/seo/Seo.tsx`
- `local-small-tattoo-ui/src/data/home.ts`
- `local-small-tattoo-ui/src/data/navigation.ts`
- `local-small-tattoo-ui/src/features/about/data/defaultFounder.ts`
- `local-small-tattoo-ui/src/features/booking/components/StudioInformation.tsx`
- `local-small-tattoo-ui/src/features/businessSettings/api/businessSettingsApi.ts`
- `local-small-tattoo-ui/src/features/businessSettings/utils/businessSettings.ts`
- `local-small-tattoo-ui/src/features/gallery/components/GalleryLightbox.tsx`
- `local-small-tattoo-ui/src/features/home/HeroSection.tsx`
- `local-small-tattoo-ui/src/features/home/LocationReviewSection.tsx`
- `local-small-tattoo-ui/src/features/home/MarqueeTicker.tsx`
- `local-small-tattoo-ui/src/features/tattooStyles/components/TattooStyleSection.tsx`
- `local-small-tattoo-ui/src/main.tsx`
- `local-small-tattoo-ui/src/pages/ContactPage.tsx`
- `local-small-tattoo-ui/src/pages/GalleryPage.tsx`
- `local-small-tattoo-ui/src/pages/HomePage.tsx`
- `local-small-tattoo-ui/src/pages/StylesPage.tsx`
- `local-small-tattoo-ui/src/pages/admin/AdminBusinessSettingsPage.tsx`
- `local-small-tattoo-ui/src/pages/admin/AdminHomeContentPage.tsx`
- `local-small-tattoo-ui/src/pages/admin/AdminReviewsPage.tsx`
- `local-small-tattoo-ui/src/types/content.ts`

### Removed / old asset location

- `apps/api/src/controllers/google-review.controller.ts`
- `apps/api/src/models/google-business-connection.model.ts`
- `apps/api/src/models/google-review.model.ts`
- `apps/api/src/routes/google-review.routes.ts`
- `apps/api/src/services/google-business.service.ts`
- `local-small-tattoo-ui/public/logo.png`
- `local-small-tattoo-ui/src/features/reviews/api/googleReviewsApi.ts`
