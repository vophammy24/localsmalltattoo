# Home fixed background correction

The former implementation used an absolutely positioned, document-height image
layer with `background-repeat: repeat-y`. Its image therefore moved with the
document and repeated. It did not implement a viewport-fixed background.

## Implementation and boundaries

`HomeSharedBackground` remains the owner of the single decorative image layer.
It preloads and displays only `SITE_ASSETS.heroHome` (`/images/home/hero.webp`).
The layer uses `position: fixed`, `inset: 0`, `height: 100vh; height: 100dvh`,
`background-size: cover`, `background-position: center center` and `no-repeat`.
Cover preserves image proportions and crops to the viewport rather than the
height of all Home sections. The image has `pointer-events: none`.

The existing region wraps Hero, marquee, Styles, Founder, Location and Reviews
in their original order. Its `clip-path: inset(0)` clips the fixed descendant
to the region's painted bounds, including when Gallery is partway through the
viewport. Clipping does not change the image's viewport containing block.
`isolation: isolate` and the image's negative z-index keep the layer behind
foreground content and inside the region's stacking context.

This explicitly clips the fixed element; it does not rely on ancestor overflow
or merely cover a leaking image with an opaque Gallery. No sticky substitute,
background attachment, IntersectionObserver or JavaScript scroll handler is used.
The same clipping automatically works when scrolling back upward or resizing.
The region unmounts when navigating away from Home.

Gallery and Footer remain outside this region with their original backgrounds.
When Gallery reaches the viewport, the image is painted only above its boundary;
once the whole viewport is below the region, no part of the image is painted.
The existing dark body background prevents white flashes.

Translucent section background colors apply independently of the fixed image.
Hero, Styles, Founder, Location and Reviews all use --home-section-overlay,
black at alpha 0.7, keeping the background brightness consistent between sections.
These backgrounds scroll with their sections; the image underneath does not.
Text, portraits, controls and map iframe retain full opacity and interaction.
Review card styling, carousel, dialog, CMS, contact links and SEO are unchanged.

Ancestor inspection found no transform, filter, perspective or containment on
the Home region's ancestor chain that changes the fixed containing block.
Header filtering and animated elements elsewhere are siblings, not ancestors.
Avoid adding such containing-block properties to this ancestor chain later.
Obsolete `.home-hero__media`/`.home-hero__overlay` CSS was removed.

## Files changed for this correction

- `local-small-tattoo-ui/src/features/home/HomeSharedBackground.tsx`
- `local-small-tattoo-ui/src/styles/testimonials.css`
- `local-small-tattoo-ui/src/styles/home.css`
- `local-small-tattoo-ui/tests/home-background.spec.ts` (new)
- `local-small-tattoo-ui/README.md`
- `docs/ui-refinement-report.md`
- `docs/home-fixed-background-report.md` (new)

No API, database, business configuration, route composition, Founder/Styles data,
Gallery media, booking or authentication changes are part of this correction.

## Verification

- Frontend `npm run build`: passed.
- Full Chromium suite: **36 tests passed**.
- WebKit: **all 9 width cases passed**, with touch input and DPR 2.
- `npm run format:check` and `git diff --check`: passed. No lint script exists.

The scroll test uses real scrolling and rendered image pixels, not just computed
CSS. With foreground content temporarily hidden for measurement, it samples 16
distinctive viewport coordinates across the actual collage. The sample set has
multiple different colors, ruling out a flat fallback. Identical image samples
are compared at Hero, Styles, Founder and Reviews, and after returning upward.
The image's bounding rectangle also remains at viewport y=0.

At the Gallery boundary, the test makes Gallery/Footer backgrounds transparent
so that an unclipped image cannot be concealed. The upper viewport samples keep
the original collage pixels while samples below the boundary show only the dark
body background. Fully scrolled into Gallery/Footer, no image samples remain.
Viewport-height changes from 900px to 650px verify the dynamic viewport size and
repeat the stationary-image comparison after resizing. Tests also check one
layer, no-repeat, cover sizing, pointer-events, horizontal overflow and cleanup
on navigation away from Home.

Widths: 320, 375, 390, 430, 768, 1024, 1366, 1440 and 1920px. The optional WebKit
run uses touch support and device pixel ratio 2. It runs the same image/clipping
checks rather than replacing the fixed image with a scrolling fallback.
Chromium samples match exactly. WebKit samples permit one RGB level of
compositor rounding, with unchanged sample coordinates and fixed element bounds.

Run the normal suite with `npm run test:ui` inside the frontend. For the optional
WebKit checks in PowerShell (install its browser once):

```powershell
npx playwright install webkit
$env:HOME_BACKGROUND_BROWSER = 'webkit'
npm run test:ui -- --grep 'single fixed collage' --output test-results/webkit
Remove-Item Env:HOME_BACKGROUND_BROWSER
```

Screenshots at identical 1440x900 viewports are written to
`local-small-tattoo-ui/test-results/`:

- `fixed-background-hero-1440.png`
- `fixed-background-styles-1440.png`
- `fixed-background-founder-1440.png`
- `fixed-background-reviews-1440.png`
- `fixed-background-gallery-boundary-1440.png`
- `fixed-background-return-1440.png`

`fixed-background-return-390.png` captures the mobile foreground over the image.
Browser tests use mocked CMS and Gallery fixtures and a stub map; the background
asset itself is the actual local tattoo collage.

## Limits

The equivalent fixed layer works in tested Chromium and WebKit, so no mobile
scrolling-background fallback is needed for these engines. `100vh` is the height
fallback when dynamic viewport units are unavailable. Physical iOS Safari's
address-bar transitions and GPU painting are not verified by desktop WebKit;
the tested viewport-height resizing is an approximation. Image cropping changes
when the viewport itself changes size, as expected for cover sizing.

Vite retains the existing non-blocking main bundle-size warning (about 504 KB
minified). No deployment was performed.
