import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { studioDateTime, studioTimeToUtc } from "../src/features/reviews/utils/testimonialTime";
import { SITE_CONFIG } from "../src/config/siteConfig";
test.beforeEach(({ page }) => {
  page.on("pageerror", (error) => console.error("Browser error:", error.message));
});

const fixture = (index: number) => ({
  _id: String(index),
  customerName: `Test fixture ${index}`,
  rating: (index % 5) + 1,
  content: "Synthetic UI test text only. " + "A long testimonial with careful details. ".repeat(8),
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
      const p = Number(url.searchParams.get("page") ?? 1);
      data = {
        items: empty
          ? []
          : Array.from({ length: p === 1 ? 12 : 3 }, (_, i) => fixture((p - 1) * 12 + i + 1)),
        pagination: { page: p, limit: 12, total: empty ? 0 : 15, totalPages: empty ? 1 : 2 },
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
for (const width of [1440, 768, 390])
  test(`Home local assets, fixed contacts, 12 cards and pagination at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await mock(page);
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/");
    await expect(page.locator(".testimonials-grid .review-card")).toHaveCount(12);
    await expect
      .poll(() =>
        page
          .locator(".home-hero__media img")
          .evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
    expect(
      await page
        .locator(".home-hero__media img")
        .evaluate((image: HTMLImageElement) => new URL(image.currentSrc).pathname),
    ).toMatch(/^\/images\/home\/hero(?:-800|-1200)?\.webp$/);
    for (const selector of [".site-header__brand img", ".site-footer__brand img"]) {
      await expect(page.locator(selector)).toHaveAttribute("src", "/brand/logo.png");
      await expect(page.locator(selector)).toHaveJSProperty("naturalWidth", 1254);
    }
    await expect(page.locator(".site-footer__contact")).toContainText(SITE_CONFIG.contact.phone);
    await expect(page.locator(".marquee")).not.toContainText("OLD DATABASE NAME");
    await expect(page.locator(".site-footer__contact a[href^='mailto:']")).toHaveAttribute(
      "href",
      `mailto:${SITE_CONFIG.contact.email}`,
    );
    await expect(page.locator(".testimonials-grid a.review-card").first()).toHaveAttribute(
      "target",
      "_blank",
    );
    await expect(page.locator(".testimonials-grid a.review-card").first()).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    await expect(page.locator(".testimonials-grid time").first()).toHaveText("20 Oct 2026");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(
      requests.some((value) => {
        const url = new URL(value);
        return (
          url.hostname === "res.cloudinary.com" ||
          /^\/api\/admin\/(google-business|google-reviews)/.test(url.pathname)
        );
      }),
    ).toBe(false);
    await page
      .getByRole("navigation", { name: "Testimonial pages" })
      .getByRole("button", { name: "Next" })
      .click();
    await expect(page.locator(".testimonials-grid .review-card")).toHaveCount(3);
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
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
  await expect(page.locator(".home-hero__media img")).toHaveCount(0);
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
  await expect(form.locator(".review-card time")).toHaveText("20 Oct 2026");
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
