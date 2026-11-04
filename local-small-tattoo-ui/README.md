# Local Small Tattoo UI

React, TypeScript, Vite and React Router. Public pages: Home, Booking, Styles,
About, Gallery, Contact and /reviews. Authenticated management lives at /admin.

## Development and verification

Use Node 24 (or a Node release supported by the installed Vite version).

```sh
npm ci
npm run dev
npm run build
npx playwright install chromium
npm run test:ui
npm run format:check
```

VITE_API_URL is the API origin without /api; default: http://localhost:5000.
Browser tests mock API responses and map content with synthetic fixtures. API
integration tests use a disposable local MongoDB instance, never production.
There is no lint script. Build checks TypeScript; Prettier checks formatting.

## How to change the logo

The existing approved format is PNG: public/brand/logo.png. Replace that file.
For SVG, place the approved public/brand/logo.svg and change SITE_ASSETS.logo in
src/config/siteAssets.ts and the favicon MIME type in src/main.tsx. Header,
Footer and intro share BrandLogo and fall back to the business name on failure.

## How to change the Hero image

Replace public/images/home/hero.webp. The older 800px/1200px variants are retained
but are not used by the fixed Home background. The original source is
public/images/home/hero.png (1620 x 1073). Paths live in
src/config/siteAssets.ts. HomeSharedBackground preloads and displays one source,
hero.webp, at every viewport size. Missing images leave
the dark fallback and readable foreground content. Hero text remains in CMS.

## How to change the Founder image

Replace public/images/about/founder.webp. The supplied public/about/founder.jpg
was converted to a 900 x 1351 WebP, approximately 115 KB. SITE_ASSETS.founder is
shared by Home and About. Preserve the image's proportions or update its width,
height and CSS aspect ratio in FounderSection/testimonials.css. Missing portraits
fall back to text. CMS name, biography, heading, signature and visibility remain
editable; the obsolete image upload control is replaced by local-file guidance.

## How to edit business information

Edit src/config/siteConfig.ts for identity, phone, email, social URLs, map URLs,
address and all seven days of opening hours. Current address/hours were copied
from the repository's API DEFAULT_SETTINGS: 52-54 Tran Thanh Mai, An Hai, Son Tra,
Da Nang, Vietnam; daily 10:00-20:00, Asia/Ho_Chi_Minh. No production database was
read or modified. Confirm these repository values before deployment if the live
CMS differs. Production canonical origin follows the supplied .com.vn domain.

Home, Contact, Footer, Booking, marquee and Home JSON-LD use this configuration.
Address and hours are read-only in Admin Business Settings. Historical MongoDB
fields remain intact. Description, coordinates and booking notice remain dynamic;
the provider still fetches for these fields. Contact renders fixed details even
if that API is unavailable. Directions/review-list/write-review links retain the
existing configured URLs; use a specific authorized source URL on each review.

## How to manage reviews

The **Google Maps rating summary** panel in /admin/reviews accepts the average
rating (1-5, one decimal place) and the actual total count shown on Google Maps.
Enable **Show Google Maps rating summary** and save to publish these values on
Home and /reviews, even if no individual testimonials have been entered. The
public label identifies Google Maps and says the studio updates it manually.
These values do not synchronize automatically; update them when Google changes.
Disable the switch to return to the calculated customer-testimonial summary.
The summary does not create review cards or change pagination counts.

Visit /admin/reviews. Enter original customer wording, rating and reviewDate.
Confirm permission and enable Public. Optionally enable Featured, set Display
order (smaller first), and schedule Display from / Display until in studio time.
Withdrawing permission unpublishes the entry. No review content, rating or date
is changed automatically, and featured flags are never changed by public reads.

Eligibility is Public + confirmed permission + active publication window.
The start is inclusive; the end is exclusive. Empty boundaries are unrestricted.
Sorting is featured first, displayOrder ascending, reviewDate descending, stable
ID ascending. Mobile Home requests at most three entries using this ordering:
featured entries first, then public non-featured entries to fill remaining slots.

Desktop Home shows three equal-width cards at >=1200px; tablet shows two at
768-1199px. Cards have independent content heights with max-height: 256.7px.
CSS clamps to four lines; ResizeObserver and font readiness determine whether
Read More is needed. All cards open the complete original text in a dialog.
The Google Maps link opens independently in a new tab with noopener noreferrer.

The native dialog has explicit focus wrapping, Escape, overlay, X and Close
controls, focus restoration, viewport-constrained internal scrolling and body
scroll locking. It appears in the browser top layer above floating contacts.

Desktop arrows, focused keyboard arrows and horizontal swipes advance one
review. A modulo window and one temporary entering item animate via transform;
a navigation lock prevents overlapping transitions. No cloned collection is
created. Small collections show unique cards with no unnecessary controls.
Reduced-motion users get immediate navigation. Twelve-item API pages load on
demand, with at most three cached pages per mounted carousel. There is no autoplay.

/reviews displays all eligible reviews, 12 per page, with the same cards/dialog.
It has its own title, description, canonical, Open Graph and sitemap entry.
View All Reviews links from Home; Header navigation is unchanged.

Relative dates use reviewDate only, never createdAt. Date-only values mean
midnight in Asia/Ho_Chi_Minh. Invalid, timezone-less or future dates are omitted.
Minutes, hours, days, weeks, months and years use Intl.RelativeTimeFormat.
The original value remains in time[datetime]; one shared one-minute timer updates
all mounted dates and is cleaned up when no dates remain mounted.

GET /api/public/reviews retains data.items and data.pagination and adds
data.summary = { averageRating: number | null, totalReviews: number }.
The backend averages only eligible ratings, across all pages, independently of
the featured filter. Empty collections return null/zero and no fake rating UI.
The fallback label is Based on X customer reviews; this is a manual CMS statistic.
The optional data.googleMapsSummary contains the separately entered Google Maps
averageRating, totalReviews and server-recorded updatedAt, or null when disabled.
Protected GET/PATCH /api/admin/reviews/google-summary manages this snapshot in
the existing BusinessSettings document. Existing documents default to disabled;
no migration or review import is required. Other Business Settings saves retain it.
There is no Google API integration or curated AggregateRating structured data.

Responses use no-store so a new request reevaluates publication eligibility.
Carousel page caching lasts for the mounted component; reload or revisit for
fresh CMS/schedule changes. About CMS reads share a 30-second request cache;
publishing invalidates it. Individual review cards never fetch data.

## Shared background and responsive controls

HomeSharedBackground wraps Hero, marquee, Styles, Founder, Location and Reviews
in their original order, ending before Featured Gallery. One decorative layer
uses one viewport-fixed collage with cover sizing, center positioning and no
repetition. Foreground content scrolls over the stationary image. The region's
clip-path: inset(0) clips even the fixed descendant at its exact boundaries while
preserving the viewport as the image's containing block. No scroll handlers,
background-attachment, sticky substitute or repeated section images are used.
Do not add transform, filter, perspective or containment to the region/ancestors;
those can change the containing block of a fixed descendant.

Section background alphas and card alpha are in src/styles/testimonials.css.
Hero, Styles, Founder, Location and Reviews share --home-section-overlay
(black at 70% opacity) for consistent brightness. The fixed layer ignores pointer events, so the lazy
map iframe stays interactive. Gallery and
Footer retain their own backgrounds. Mobile contact actions collapse behind a
44px toggle, with safe-area positioning; all original contact links remain.

See [fixed background verification](../docs/home-fixed-background-report.md) for
real scrolling, image landmark comparisons and Gallery-boundary tests.

## Deployment

Deploy the API with summary support before/alongside the frontend. No database
migration, collection deletion, seed data or Google API credentials are required.
Cloudflare uses root local-small-tattoo-ui, build npm ci && npm run build, output
dist; set VITE_API_URL to the API origin and preserve SPA fallback for /reviews.
The existing Wrangler deployment script is retained. Include local static assets
and confirm the supplied production domain/DNS before deploying. Nothing is
automatically published by this change.

See [UI refinement report](../docs/ui-refinement-report.md) for the implementation
inventory and validation details.
