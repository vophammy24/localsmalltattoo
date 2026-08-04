# Local Small Tattoo UI Starter

Starter frontend for the agreed public sitemap. This phase implements:

- Shared responsive Header
- Full-screen mobile menu
- Shared Footer
- Design tokens
- Complete Home page
- Placeholder routes for Booking, Styles, About Us, Artist, Gallery, and Contact

## Stack

- React
- TypeScript
- Vite
- React Router
- Plain CSS organized by tokens, global rules, layout, and page styles

## Requirements

Use a Node.js version supported by the installed Vite release.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
├── app/
│   └── App.tsx
├── components/
│   ├── common/
│   │   ├── ButtonLink.tsx
│   │   └── SectionHeading.tsx
│   └── layout/
│       ├── Footer.tsx
│       ├── Header.tsx
│       └── PublicLayout.tsx
├── data/
│   ├── home.ts
│   └── navigation.ts
├── features/home/
│   ├── ArtistSection.tsx
│   ├── CustomerGallerySection.tsx
│   ├── FinalCtaSection.tsx
│   ├── HeroSection.tsx
│   ├── LocationReviewSection.tsx
│   ├── MarqueeTicker.tsx
│   └── TattooStylesSection.tsx
├── pages/
│   ├── ComingSoonPage.tsx
│   └── HomePage.tsx
├── styles/
│   ├── global.css
│   ├── home.css
│   ├── layout.css
│   └── tokens.css
├── types/
│   └── content.ts
└── main.tsx
```

## Font note

The CSS requests `DejaVu Serif` for the brand and large headings and uses Georgia as a fallback. Merriweather is currently loaded from Google Fonts for body content.

For a production site, add your own web-licensed DejaVu Serif `.woff2` files under `public/fonts/` and define `@font-face` in `src/styles/tokens.css`. Font files are intentionally not included in this starter.

## Images

All files inside `public/images/` are temporary SVG placeholders. Replace them with optimized Cloudinary image URLs after the backend/content-management phase.

## Current routes

```text
/                    Home implemented
/booking             Placeholder
/styles              Placeholder
/about               Placeholder
/artists              Placeholder
/artists/:slug        Placeholder
/gallery              Placeholder
/contact              Placeholder
```

## Next implementation order

1. Booking page and booking form UI
2. Styles page rendered from dynamic category data
3. About page
4. Artist listing and artist detail
5. Filterable Gallery
6. Contact page with map
7. Admin authentication and dashboard
8. Connect frontend to Node.js API, MongoDB Atlas, and Cloudinary
