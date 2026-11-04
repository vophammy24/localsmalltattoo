# Home UI and responsive refinement

## Implementation

- Cause of equal-height cards: implicit Grid stretch and time margin-top:auto.
  Cards now align to the top, height:auto, max-height:256.7px, no minimum height.
  Four-line CSS clamping, measured overflow and font readiness control Read More.
- Existing TestimonialCard/TestimonialsSection are reused on Home, /reviews and
  CMS preview. Full text is never shortened in storage. Source URLs are validated
  before rendering as standalone external links; no nested interactive elements.
- ReviewDialog uses native dialog/showModal and a portal. It restores trigger
  focus, wraps Tab/Shift+Tab, supports X/Close/Escape/backdrop, locks body scroll,
  and scrolls internally within the dynamic viewport. The top layer covers the
  floating contacts. Review text uses plain React text, without HTML injection.
- Home: >=1200px three cards; 768-1199px two; smaller screens at most three vertical
  featured-first entries with displayOrder sorting and public fallback entries.
- Desktop uses modulo windows, one entering item, CSS transform animations,
  stable review IDs and a navigation lock. Arrows, keyboard and swipe are
  supported. Small collections have no duplicates. Reduced motion skips animation.
  Twelve-item pages load on demand; memory holds at most three cached API pages.
- /reviews adds a complete paginated public list, semantic heading, modal,
  external source links, SEO and sitemap entry. Header remains unchanged.
- Shared relative-date utility handles original reviewDate, explicit UTC offsets,
  studio-midnight date-only input, invalid/future values and singular/plural.
  One shared one-minute clock updates mounted time elements with cleanup.
- API summary uses MongoDB aggregation over the same publication filter used by
  public listing: public, permission confirmed, active start/end window. Summary
  is independent of pagination and featured filter. Empty summary is null/zero.
  Existing data.items/pagination contracts and Admin CRUD schema are retained.
- Fixed SITE_CONFIG address and seven-day hours come from repository defaults.
  Home, Contact, Footer, Booking, marquee and JSON-LD consume these values.
  Historical admin fields remain read-only; records are retained. Dynamic
  description/coordinates/booking notice still use the Business Settings API.
- Founder uses public/images/about/founder.webp, converted from the supplied
  local public/about/founder.jpg, 900x1351, approximately 115 KB. Home and About
  reuse FounderSection; CMS text remains dynamic. Image failure preserves text.
- HomeSharedBackground surrounds all sections through Reviews in existing order.
  The follow-up correction uses one viewport-fixed image with no repetition,
  clipped to the region, and translucent section overlays. Gallery and Footer
  sit outside the region. See [fixed background report](home-fixed-background-report.md).
- Transparent content sections and dark translucent cards retain contrast.
  Decorative layers never intercept map pointer events. Header/hero typography
  stays within 320px layouts. Mobile contacts collapse with 44px controls and
  safe-area support. About request caching avoids duplicate concurrent CMS reads.

## Files created

- local-small-tattoo-ui/src/features/home/HomeSharedBackground.tsx
- local-small-tattoo-ui/src/features/reviews/components/ReviewDate.tsx
- local-small-tattoo-ui/src/features/reviews/components/ReviewDialog.tsx
- local-small-tattoo-ui/src/features/reviews/components/ReviewSource.tsx
- local-small-tattoo-ui/src/pages/ReviewsPage.tsx
- local-small-tattoo-ui/src/utils/formatRelativeReviewDate.ts
- local-small-tattoo-ui/public/images/about/founder.webp
- docs/ui-refinement-report.md

## Files modified

- API: src/controllers/testimonial.controller.ts; tests/testimonials.test.ts.
- UI src/app/App.tsx; config/siteConfig.ts; config/siteAssets.ts.
- UI components/common/FloatingContactButtons.tsx; components/layout/Footer.tsx.
- UI features/about/api/aboutApi.ts; booking/components/StudioInformation.tsx;
  businessSettings/BusinessSettingsContext.tsx.
- UI features/home/HeroSection.tsx; FounderSection.tsx;
  LocationReviewSection.tsx; MarqueeTicker.tsx.
- UI features/reviews/api/testimonialApi.ts; types/testimonial.ts;
  components/TestimonialCard.tsx; components/TestimonialsSection.tsx.
- UI pages/HomePage.tsx; ContactPage.tsx; admin/AdminBusinessSettingsPage.tsx;
  admin/AdminAboutPage.tsx; styles/testimonials.css; tests/testimonials.spec.ts.
- UI public/sitemap.xml; public/robots.txt; README.md.
- Root .prettierignore excludes generated browser reports.

The supplied logo.png and source founder.jpg are preserved. No database schema
or stored business/review content was changed, and nothing was deployed.

## Verification and operational notes

Frontend npm run build and backend npm run build pass. All 27 Playwright tests
and all 6 backend integration tests pass. Prettier format:check and git diff
--check pass. Vite reports a non-blocking main bundle warning (approximately
505 KB minified, 148 KB gzip); broader route splitting remains an optional
performance follow-up. Browser tests cover all
requested widths (320, 360, 375, 390, 414, 430, 768, 820, 1024, 1280, 1366, 1440,
1536, 1920), plus landscape, card heights/clamping, local assets, source URLs,
carousel next/previous/wrap/incremental pages, three-card mobile selection,
/reviews pagination/SEO, dialog focus/close methods, date boundaries, small
collections and regression of populated Gallery, menus and contact controls.
Backend integration tests cover summary accuracy with varied ratings, feature
filter independence, mobile fill order, permissions, scheduling boundaries,
privacy, pagination, validation, CRUD and Booking/Gallery/Styles/About regression.

Screenshots are saved by Playwright in local-small-tattoo-ui/test-results:
home-390.png, home-1440.png, review-modal.png, reviews-page.png. Browser tests use
synthetic API fixtures and a stub map; they do not claim live Google Maps or
production CMS verification. No lint script exists. Formatting uses Prettier.

Before production deployment, confirm the address/hours copied from repository
defaults match the live business and confirm the supplied .com.vn canonical
origin. No production database credentials were used to verify live settings.
Deploy API summary support before/alongside the UI and preserve SPA deep links.
Retain the original founder source for future exports. Real-device Safari,
VoiceOver/TalkBack and live map directions still warrant deployment smoke checks.
