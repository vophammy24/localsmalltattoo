import { test, expect, type Page } from "@playwright/test";

// Optional WebKit run exercises the same scroll/clipping assertions with touch
// input and a high-density screen, without changing the main Chromium suite.
if (process.env.HOME_BACKGROUND_BROWSER === "webkit") {
  test.use({ browserName: "webkit", channel: "", hasTouch: true, deviceScaleFactor: 2 });
}

async function prepare(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem("lst-home-intro-viewed", "true"));
  await page.route("https://www.google.com/maps**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<body style="background:#111;color:#eee">Map test fixture</body>',
    }),
  );
  await page.route("http://localhost:5000/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const image = {
      url: "/brand/logo.png",
      alt: "Test media",
      width: 900,
      height: 900,
      publicId: "test",
    };
    let data: unknown = {};
    if (path.includes("/pages/about")) {
      await route.fulfill({ status: 404, json: { success: false } });
      return;
    }
    if (path.endsWith("/business-settings"))
      data = {
        settings: {
          description: "Test studio",
          location: {},
          address: {},
          openingHours: [],
          socialLinks: {},
        },
      };
    if (path.endsWith("/tattoo-styles"))
      data = {
        items: Array.from({ length: 5 }, (_, i) => ({
          _id: "style" + i,
          name: "Test style " + i,
          slug: "style" + i,
          coverImage: image,
          displayOrder: i,
          shortDescription: "Test style",
        })),
      };
    if (path.endsWith("/gallery"))
      data = {
        items: Array.from({ length: 4 }, (_, i) => ({
          _id: "work" + i,
          title: "Test work " + i,
          image,
          type: "TATTOO_WORK",
          tattooStyleIds: [],
          isFeatured: true,
        })),
        pagination: { page: 1, limit: 12, total: 4, totalPages: 1 },
      };
    if (path.endsWith("/reviews"))
      data = {
        items: Array.from({ length: 3 }, (_, i) => ({
          _id: "review" + i,
          customerName: "Test customer " + i,
          content: "Test customer review.",
          rating: 5,
          reviewDate: "2026-10-19T17:00:00Z",
          sourceUrl: "",
          isFeatured: true,
          displayOrder: i,
        })),
        summary: { averageRating: 5, totalReviews: 3 },
        pagination: { page: 1, limit: 12, total: 3, totalPages: 1 },
      };
    await route.fulfill({ json: { success: true, data } });
  });
  await page.goto("/");
  await expect(page.locator(".home-featured-gallery")).toBeVisible();
  const width = page.viewportSize()!.width;
  await expect(page.locator(".review-card")).toHaveCount(width >= 768 && width < 1200 ? 2 : 3);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const image = new Image();
    image.src = "/images/home/hero.webp";
    await image.decode();
    document.documentElement.style.scrollBehavior = "auto";
  });
}

async function scrollTo(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

// Preserve actual geometry/clipping, but hide foreground for the image pixel
// comparison. Transparent Gallery/Footer cannot conceal an unclipped layer.
async function probe(page: Page) {
  const screenshot = await page.screenshot({
    animations: "disabled",
    style: `
    .home-shared-background > :not(.home-shared-background__media),
    .site-header, .site-footer > *, .floating-contacts, .back-to-top,
    .home-featured-gallery > *, .customer-gallery-section > * { visibility: hidden !important; }
    .home-featured-gallery, .customer-gallery-section, .site-footer { background: transparent !important; }
  `,
  });
  return page.evaluate(async (base64) => {
    const image = new Image();
    image.src = "data:image/png;base64," + base64;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    return [0.2, 0.4, 0.6, 0.8].flatMap((x) =>
      [0.2, 0.4, 0.6, 0.8].map((y) =>
        Array.from(
          context.getImageData(Math.floor(x * image.width), Math.floor(y * image.height), 1, 1)
            .data,
        ),
      ),
    );
  }, screenshot.toString("base64"));
}

function expectSameImage(actual: number[][], expected: number[][]) {
  expect(actual.length).toBe(expected.length);
  // WebKit can round one color channel by one level when compositing the same
  // scaled image. This allows no movement; the fixed bounds are checked too.
  const tolerance = process.env.HOME_BACKGROUND_BROWSER === "webkit" ? 1 : 0;
  actual.forEach((pixel, index) => {
    pixel.forEach((channel, component) => {
      expect(Math.abs(channel - expected[index]![component]!)).toBeLessThanOrEqual(tolerance);
    });
  });
}

for (const width of [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]) {
  test(
    "single fixed collage stays anchored and clips at Gallery at " + width + "px",
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await prepare(page);
      const media = page.locator(".home-shared-background__media");
      await expect(media).toHaveCount(1);
      const css = await media.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          position: style.position,
          repeat: style.backgroundRepeat,
          size: style.backgroundSize,
          pointer: style.pointerEvents,
        };
      });
      expect(css).toEqual({
        position: "fixed",
        repeat: "no-repeat",
        size: "cover",
        pointer: "none",
      });
      const positions = await page.evaluate(() => {
        const top = (selector: string) =>
          document.querySelector(selector)!.getBoundingClientRect().top + scrollY;
        return {
          styles: top(".styles-section"),
          founder: top(".founder-section"),
          reviews: top("#customer-reviews"),
          gallery: top(".home-featured-gallery"),
          footer: top(".site-footer"),
        };
      });
      await scrollTo(page, 0);
      const reference = await probe(page);
      expect(new Set(reference.map((pixel) => pixel.join(","))).size).toBeGreaterThan(8);
      for (const [name, top] of Object.entries({
        hero: 0,
        styles: positions.styles,
        founder: positions.founder,
        reviews: Math.min(positions.reviews, positions.gallery - 900),
      })) {
        await scrollTo(page, top);
        const bounds = await media.boundingBox();
        expect(bounds?.y).toBe(0);
        expect(bounds?.height).toBe(900);
        expectSameImage(await probe(page), reference);
        if (width === 1440)
          await page.screenshot({ path: "test-results/fixed-background-" + name + "-1440.png" });
      }
      await scrollTo(page, positions.gallery - 450);
      const boundary = await probe(page);
      for (let i = 0; i < boundary.length; i++) {
        if (i % 4 < 2) expectSameImage([boundary[i]!], [reference[i]!]);
        else expect(boundary[i]).toEqual([0, 0, 0, 255]);
      }
      if (width === 1440)
        await page.screenshot({ path: "test-results/fixed-background-gallery-boundary-1440.png" });
      await scrollTo(page, positions.gallery);
      expect((await probe(page)).every((pixel) => pixel.join(",") === "0,0,0,255")).toBe(true);
      await scrollTo(page, positions.footer);
      expect((await probe(page)).every((pixel) => pixel.join(",") === "0,0,0,255")).toBe(true);
      await scrollTo(page, positions.founder);
      expectSameImage(await probe(page), reference);
      if (width === 1440 || width === 390)
        await page.screenshot({ path: "test-results/fixed-background-return-" + width + ".png" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.setViewportSize({ width, height: 650 });
      expect((await media.boundingBox())?.height).toBe(650);
      await scrollTo(page, 0);
      const resized = await probe(page);
      await scrollTo(page, positions.founder);
      expectSameImage(await probe(page), resized);
      await page.goto("/contact");
      await expect(media).toHaveCount(0);
    },
  );
}
