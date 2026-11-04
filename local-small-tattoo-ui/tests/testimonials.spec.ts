import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { studioDateTime, studioTimeToUtc } from "../src/features/reviews/utils/testimonialTime";
import { formatRelativeReviewDate } from "../src/utils/formatRelativeReviewDate";
import { SITE_CONFIG } from "../src/config/siteConfig";
test.beforeEach(({ page }) => {
  page.on("pageerror", (error) => console.error("Browser error:", error.message));
});

const fixture = (index: number) => ({
  _id: String(index),
  customerName: `Test fixture ${index}`,
  rating: (index % 5) + 1,
  content:
    index === 1
      ? "Short synthetic review."
      : "Synthetic UI test text only. " + "A long testimonial with careful details. ".repeat(30),
  reviewDate: "2026-10-19T17:00:00.000Z",
  sourceType: "DIRECT_CUSTOMER",
  sourceUrl: index === 1 ? "https://www.google.com/maps/reviews/test-fixture" : "",
  isFeatured: false,
  displayOrder: index,
  isPublic: true,
  permissionConfirmed: true,
  adminNote: "private fixture",
  publishFrom: null,
  publishUntil: null,
});
async function mock(page: Page, empty = false) {
  await page.clock.install({ time: new Date("2026-11-04T08:00:00+07:00") });
  await page.route("https://www.google.com/maps**", (route) =>
    route.fulfill({ body: "<html><body>Map fixture</body></html>", contentType: "text/html" }),
  );
  await page.addInitScript(() => sessionStorage.setItem("lst-home-intro-viewed", "true"));
  await page.route("http://localhost:5000/api/**", async (route) => {
    const url = new URL(route.request().url());
    let data: unknown = {};
    if (url.pathname.endsWith("/auth/me"))
      data = {
        admin: {
          id: "test-admin",
          fullName: "Test Admin",
          email: "test@example.test",
          role: "OWNER",
        },
      };
    else if (url.pathname.endsWith("/business-settings"))
      data = {
        settings: {
          businessName: "OLD DATABASE NAME",
          description: "Studio description",
          contact: { phoneNumber: "WRONG DATABASE PHONE", email: "wrong@example.test" },
          address: { addressLine: "Test studio", city: "Da Nang", country: "Vietnam" },
          location: { googleMapsUrl: "https://invalid.example/old-map", googleMapsEmbedUrl: "" },
          openingHours: [],
          socialLinks: { instagram: "https://invalid.example/old-social" },
        },
      };
    else if (url.pathname === "/api/admin/reviews")
      data = {
        items: [fixture(1)],
        pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
        counts: { total: 1, published: 1, draft: 0, scheduled: 0, expired: 0 },
      };
    else if (url.pathname === "/api/public/reviews") {
      const limit = Number(url.searchParams.get("limit") ?? 12);
      const p = Number(url.searchParams.get("page") ?? 1);
      data = {
        items: empty
          ? []
          : Array.from({ length: Math.min(limit, 15 - (p - 1) * limit) }, (_, i) => ({
              ...fixture((p - 1) * limit + i + 1),
              isFeatured: p === 1 && i < 2,
            })),
        summary: { averageRating: empty ? null : 3, totalReviews: empty ? 0 : 15 },
        pagination: {
          page: p,
          limit,
          total: empty ? 0 : 15,
          totalPages: empty ? 1 : Math.ceil(15 / limit),
        },
      };
    } else if (url.pathname.includes("/tattoo-styles")) data = { items: [] };
    else if (url.pathname.includes("/gallery"))
      data = { items: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
    else if (url.pathname.includes("/pages/about")) {
      await route.fulfill({ status: 404, json: { success: false, message: "No CMS fixture" } });
      return;
    }
    await route.fulfill({ json: { success: true, data } });
  });
}
test("studio wall-clock conversion is independent of browser timezone", () => {
  expect(studioTimeToUtc("2026-11-05T08:00")).toBe("2026-11-05T01:00:00.000Z");
  expect(studioTimeToUtc("2026-10-20")).toBe("2026-10-19T17:00:00.000Z");
  expect(studioDateTime("2026-11-30T16:59:00Z")).toBe("2026-11-30T23:59");
  expect(() => studioTimeToUtc("2026-02-30")).toThrow();
});
for (const width of [320, 360, 375, 390, 414, 430, 768, 820, 1024, 1280, 1366, 1440, 1536, 1920])
  test("Home responsive cards and local assets at " + width + "px", async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mock(page);
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/");
    const cards = page.locator(".testimonials-grid .review-card");
    await expect(cards).toHaveCount(width < 768 ? 3 : width < 1200 ? 2 : 3);
    await expect(page.locator(".reviews-summary")).toContainText("Based on 15 customer reviews");
    await expect(page.locator(".reviews-summary")).toContainText("3.0 / 5");
    const reviewBounds = await page.locator("#customer-reviews").boundingBox();
    expect(reviewBounds?.x).toBe(0);
    expect(reviewBounds?.width).toBe(width);
    await expect(page.locator(".site-footer__bottom a")).toHaveText(["Privacy", "Terms"]);
    const borders = await page
      .locator(".home-shared-background > section, .home-shared-background > .marquee")
      .evaluateAll((sections) =>
        sections.map((section) => {
          const style = getComputedStyle(section);
          return [style.borderTopWidth, style.borderBottomWidth];
        }),
      );
    expect(borders.every(([top, bottom]) => top === "0px" && bottom === "0px")).toBe(true);
    for (const selector of [".site-header", ".site-footer__bottom"]) {
      expect(
        await page.locator(selector).evaluate((node) => {
          const style = getComputedStyle(node);
          return parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        }),
      ).toBeGreaterThan(0);
    }
    if (width >= 768) {
      const next = page.getByRole("button", { name: "Next reviews" });
      await expect(next.locator("svg")).toBeVisible();
      expect(await next.evaluate((node) => getComputedStyle(node).borderRadius)).toBe("50%");
    }
    await expect(page.locator(".review-card").first()).not.toContainText("Read More");
    await expect(page.locator(".review-card").nth(1)).toContainText("Read More");
    const heights = await cards.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().height),
    );
    expect(heights[0]).toBeLessThan(heights[1]!);
    expect(Math.max(...heights)).toBeLessThanOrEqual(256.7);
    expect(
      await page
        .locator(".home-shared-background__media")
        .evaluate((node) => getComputedStyle(node).backgroundImage),
    ).toContain("/images/home/hero");
    await page.locator(".founder-section").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator(".founder-section__portrait img")
          .evaluate((node: HTMLImageElement) => node.naturalWidth),
      )
      .toBe(900);
    await expect(page.locator(".site-header__brand img")).toHaveAttribute("src", "/brand/logo.png");
    await expect(page.locator(".site-footer__contact")).toContainText(
      SITE_CONFIG.address.addressLine,
    );
    await expect(page.locator(".location-review__details")).toContainText("10:00-20:00");
    await expect(page.locator(".review-card__source").first()).toHaveAttribute("target", "_blank");
    await expect(page.locator(".review-card time").first()).toHaveText("2 weeks ago");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(requests.some((url) => url.includes("res.cloudinary.com"))).toBe(false);
    expect(requests.filter((url) => /\/images\/home\/hero.*webp/.test(url))).toHaveLength(1);
    const shared = page.locator(".home-shared-background");
    await expect(shared.locator(".founder-section")).toHaveCount(1);
    await expect(shared.locator("#customer-reviews")).toHaveCount(1);
    await expect(shared.locator(".home-featured-gallery, .site-footer")).toHaveCount(0);
    expect(
      await page
        .locator(".location-review iframe")
        .evaluate((node) => getComputedStyle(node).pointerEvents),
    ).toBe("auto");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    if (width === 390 || width === 1440)
      await page.screenshot({ path: "test-results/home-" + width + ".png", fullPage: true });
  });

test("infinite carousel advances, reverses, loads pages and wraps without duplicate cards", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mock(page);
  await page.goto("/");
  const cards = page.locator(".review-card__header strong");
  const next = page.getByRole("button", { name: "Next reviews" });
  const previous = page.getByRole("button", { name: "Previous reviews" });
  await expect(cards).toHaveText(["Test fixture 1", "Test fixture 2", "Test fixture 3"]);
  await next.click();
  await page.clock.runFor(350);
  await expect(cards).toHaveText(["Test fixture 2", "Test fixture 3", "Test fixture 4"]);
  await previous.click();
  await page.clock.runFor(350);
  await expect(cards).toHaveText(["Test fixture 1", "Test fixture 2", "Test fixture 3"]);
  await previous.click();
  await page.clock.runFor(350);
  await expect(cards).toHaveText(["Test fixture 15", "Test fixture 1", "Test fixture 2"]);
  await next.click();
  await page.clock.runFor(350);
  await expect(cards).toHaveText(["Test fixture 1", "Test fixture 2", "Test fixture 3"]);
  await page.getByRole("region", { name: "Customer reviews" }).focus();
  await page.keyboard.press("ArrowRight");
  await page.clock.runFor(350);
  await expect(cards.first()).toHaveText("Test fixture 2");
});

test("review dialog preserves full content, traps focus, restores focus, and closes with Escape, button and overlay", async ({
  page,
}) => {
  await mock(page);
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Read review by Test fixture 2", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".review-dialog__body")).toHaveText(fixture(2).content);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  await page.clock.runFor(350);
  await expect(dialog).toBeVisible();
  await expect(page.locator(".review-card__header strong").first()).toHaveText("Test fixture 1");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await expect(dialog.getByRole("button", { name: "Close review", exact: true })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  await page.screenshot({ path: "test-results/review-modal.png" });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await trigger.click();
  await page.mouse.click(1, 1);
  await expect(dialog).toHaveCount(0);
});

test("mobile View All shows paginated reviews with SEO and modal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mock(page);
  await page.goto("/");
  await expect(page.locator(".review-card")).toHaveCount(3);
  await expect(page.locator(".reviews-controls")).toHaveCount(0);
  await page.getByRole("link", { name: "View All Reviews", exact: true }).click();
  await expect(page).toHaveURL(/\/reviews$/);
  await expect(page.locator(".review-card")).toHaveCount(12);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    SITE_CONFIG.siteUrl + "/reviews",
  );
  await page.screenshot({ path: "test-results/reviews-page.png", fullPage: true });
  await page
    .getByRole("navigation", { name: "Testimonial pages" })
    .getByRole("button", { name: "Next" })
    .click();
  await expect(page.locator(".review-card")).toHaveCount(3);
  await expect(page.locator(".review-card__header strong").first()).toHaveText("Test fixture 13");
  await page.locator(".review-card__detail").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("relative review dates handle boundaries, singular units, invalid and future dates", () => {
  const now = Date.parse("2026-11-04T12:00:00+07:00");
  const ago = (seconds: number) => new Date(now - seconds * 1000).toISOString();
  for (const [seconds, expected] of [
    [0, "Just now"],
    [60, "1 minute ago"],
    [120, "2 minutes ago"],
    [3600, "1 hour ago"],
    [86400, "1 day ago"],
    [604800, "1 week ago"],
    [2592000, "1 month ago"],
    [31536000, "1 year ago"],
  ] as const)
    expect(formatRelativeReviewDate(ago(seconds), now)).toBe(expected);
  for (const value of ["", "invalid", "2026-02-30", "2027-01-01", "2026-11-04T01:00"])
    expect(formatRelativeReviewDate(value, now)).toBe("");
});

test("no published entries hides the section; broken static assets keep content readable", async ({
  page,
}) => {
  await mock(page, true);
  await page.route("**/brand/logo.png", (route) => route.abort());
  await page.route("**/images/home/*.webp", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("#customer-reviews")).toHaveCount(0);
  await expect(page.locator(".home-hero__title")).toContainText("Local.");
  await expect(page.locator(".home-shared-background__media img")).toHaveCount(0);
  await expect(page.locator(".site-header__brand")).toContainText(SITE_CONFIG.businessName);
});
test("admin form, preview, permission, schedule, UTC payload and draft/edit controls", async ({
  page,
}) => {
  await mock(page);
  let saved: Record<string, unknown> | undefined;
  await page.route("**/api/admin/reviews", async (route) => {
    if (route.request().method() === "POST") {
      saved = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        json: { success: true, data: { item: { ...saved, _id: "new" } } },
      });
    } else await route.fallback();
  });
  await page.goto("/admin/reviews");
  await expect(page.getByRole("heading", { name: "Customer testimonials" })).toBeVisible();
  await page.getByRole("button", { name: "+ Add testimonial" }).click();
  const form = page.locator(".testimonial-editor");
  await form.getByLabel("Customer name").fill("TEST fixture only");
  await form.getByLabel("Rating").selectOption("3");
  await form.getByLabel("Testimonial content").fill("Synthetic authorized test fixture.");
  await form.getByLabel("Original review date").fill("2026-10-20");
  await form.getByLabel("Display from").fill("2026-11-05T08:00");
  await form.getByLabel("Display until").fill("2026-11-05T07:00");
  await form.getByLabel("Public", { exact: true }).check();
  await form.getByRole("button", { name: "Save changes" }).click();
  await expect(form.getByText("Confirm permission before publishing.")).toBeVisible();
  await expect(form.getByText("End must be after start.")).toBeVisible();
  await form.getByLabel("Display until").fill("2026-11-30T23:59");
  await form.getByLabel("Permission to publish confirmed").check();
  await form.getByLabel("Featured", { exact: true }).check();
  await expect(form.locator(".review-card time")).toHaveText("2 weeks ago");
  await form.getByRole("button", { name: "Save changes" }).click();
  await expect.poll(() => saved?.rating).toBe(3);
  expect(saved?.publishFrom).toBe("2026-11-05T01:00:00.000Z");
  expect(saved?.publishUntil).toBe("2026-11-30T16:59:00.000Z");
  expect(saved?.reviewDate).toBe("2026-10-19T17:00:00.000Z");
  await page.getByRole("alertdialog").getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).first().click();
  await expect(form.getByLabel("Customer name")).toHaveValue("Test fixture 1");
  await form.getByLabel("Permission to publish confirmed").uncheck();
  await expect(form.getByLabel("Public", { exact: true })).not.toBeChecked();
  await expect(form.getByLabel("Featured", { exact: true })).not.toBeChecked();
});

for (const count of [1, 2, 3])
  test("desktop handles " + count + " reviews without duplicates or controls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await mock(page);
    await page.route("**/api/public/reviews?**", (route) =>
      route.fulfill({
        json: {
          success: true,
          data: {
            items: Array.from({ length: count }, (_, i) => fixture(i + 1)),
            summary: { averageRating: 3, totalReviews: count },
            pagination: { page: 1, limit: 12, total: count, totalPages: 1 },
          },
        },
      }),
    );
    await page.goto("/");
    await expect(page.locator(".review-card")).toHaveCount(count);
    await expect(page.locator(".reviews-controls")).toHaveCount(0);
  });

for (const viewport of [
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 1440, height: 900 },
])
  test(
    "populated Home, Gallery lightbox and contact controls at " +
      viewport.width +
      "x" +
      viewport.height,
    async ({ page }) => {
      await page.setViewportSize(viewport);
      await mock(page);
      const image = {
        url: "/images/home/hero.webp",
        publicId: "fixture",
        alt: "Synthetic gallery fixture using existing tattoo photo",
        width: 1620,
        height: 1073,
      };
      await page.route("**/api/public/tattoo-styles*", (route) =>
        route.fulfill({
          json: {
            success: true,
            data: {
              items: Array.from({ length: 5 }, (_, i) => ({
                _id: "style-" + i,
                name: "Test style " + i,
                slug: "test-style-" + i,
                shortDescription: "Synthetic style fixture",
                coverImage: image,
                galleryImages: [],
                displayOrder: i,
                isFeatured: true,
              })),
            },
          },
        }),
      );
      await page.route("**/api/public/gallery?**", (route) =>
        route.fulfill({
          json: {
            success: true,
            data: {
              items: Array.from({ length: 4 }, (_, i) => ({
                _id: "gallery-" + i,
                title: "Synthetic test work " + i,
                image,
                type: "TATTOO_WORK",
                tattooStyleIds: [],
                displayOrder: i,
                isPublished: true,
                isFeatured: true,
              })),
              pagination: { page: 1, limit: 12, total: 4, totalPages: 1 },
            },
          },
        }),
      );
      await page.goto("/");
      await expect(page.locator(".home-featured-gallery")).toBeVisible();
      await expect(page.locator(".home-shared-background .home-featured-gallery")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const first = page.locator(".home-featured-gallery .gallery-card").first();
      await first.click();
      await expect(page.getByRole("dialog", { name: "Gallery image viewer" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog", { name: "Gallery image viewer" })).toHaveCount(0);
      if (viewport.width < 768) {
        await page.getByRole("button", { name: "Open contact options" }).click();
        await expect(page.getByRole("link", { name: "Open Messenger", exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Close contact options" }).click();
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
        await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("button", { name: "Open menu", exact: true })).toHaveAttribute(
          "aria-expanded",
          "false",
        );
      }
    },
  );
