import { expect, test } from "@playwright/test";

const consent = "I agree to the use of my information for booking purposes only.";

test.beforeEach(async ({ page }) => {
  await page.route("https://challenges.cloudflare.com/turnstile/**", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.turnstile = {
      ready: fn => fn(), render: (element, options) => {
        element.textContent = "Verified in test"; options.callback("fixture-token"); return "test-id";
      }, remove: () => {}
    };`,
    }),
  );
});

test("desktop booking validates on blur, searches calling codes, and preserves input on API errors", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let requests = 0;
  const keys: string[] = [];
  await page.route("**/api/public/bookings", (route) => {
    const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    const request = route.request();
    requests++;
    keys.push(request.headers()["idempotency-key"]!);
    expect(request.headers()["x-turnstile-token"]).toBe("fixture-token");
    const body = request.postData()!;
    expect(body).toContain("+12025550143");
    expect(body).toContain("whatsapp");
    expect(body).not.toContain("preferredTimePeriods");
    return route.fulfill({
      status: requests === 1 ? 503 : 201,
      headers,
      json:
        requests === 1
          ? {
              success: false,
              message: "Try again.",
              errors: { email: ["Check your email address."] },
            }
          : { success: true, data: { bookingCode: "TEST", status: "PENDING" } },
    });
  });
  await page.goto("/booking");
  const fullName = page.getByLabel("Full name");
  const phone = page.getByLabel("Phone number");
  const email = page.getByRole("textbox", { name: "Email", exact: true });
  const submit = page.getByRole("button", { name: "Send booking request" });
  await expect(page.locator(".booking-field__error").filter({ hasText: /\S/ })).toHaveCount(0);
  await expect(page.getByLabel(consent)).not.toBeChecked();
  await fullName.focus();
  await phone.focus();
  await expect(page.getByText("Enter your full name.")).toBeVisible();
  await fullName.focus();
  await expect(page.locator("#fullName-error")).toBeEmpty();
  await fullName.fill("Booking Fixture");
  await phone.fill("202 555 0143");
  await page.getByRole("button", { name: /Country code: Vietnam/ }).click();
  const countrySearch = page.getByRole("combobox", { name: "Search countries or calling codes" });
  await expect(countrySearch).toBeFocused();
  await countrySearch.fill("+1");
  await expect(page.getByRole("option", { name: "United States +1" })).toBeVisible();
  await expect(page.locator("#phoneNumber-error")).toBeEmpty();
  await countrySearch.fill("United States");
  await countrySearch.press("Enter");
  await expect(phone).toBeFocused();
  await expect(
    page.getByRole("button", { name: /Country code: United States/ }).locator("img"),
  ).toBeVisible();
  await email.fill("hello@example.test");
  await page.getByRole("checkbox", { name: "WhatsApp" }).check();
  await submit.click();
  await expect(page.getByLabel(consent)).toBeFocused();
  await expect(page.getByText("Agree to the booking consent to continue.")).toBeVisible();
  await page.getByLabel(consent).check();
  await submit.click();
  await expect(email).toBeFocused();
  await expect(page.getByText("Check your email address.")).toBeVisible();
  await expect(fullName).toHaveValue("Booking Fixture");
  await expect(phone).toHaveValue("202 555 0143");
  await submit.click();
  await expect(
    page.getByText(
      "Thank you! We've received your booking request. Our team will contact you to confirm your appointment.",
    ),
  ).toBeVisible();
  expect(requests).toBe(2);
  expect(keys[0]).toBe(keys[1]);
});

test("mobile form stacks with no overflow and validates image selection immediately", async ({
  page,
}) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/booking");
    const upload = page.locator("#referenceImages");
    await expect(upload).toBeAttached();
    const grid = page.locator(".booking-form__grid");
    expect(
      await grid.evaluate(
        (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
      ),
    ).toBe(1);
    expect(
      await page.locator(".booking-form").evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    await upload.setInputFiles({
      name: "note.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("invalid"),
    });
    await expect(page.getByText("Choose a JPG, PNG, WebP, HEIC or HEIF image.")).toBeVisible();
    await upload.setInputFiles({
      name: "reference.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kYuoAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    const remove = page.getByRole("button", { name: "Remove reference.png" });
    await expect(remove).toBeVisible();
    await remove.click();
    await expect(remove).toHaveCount(0);
    await expect(page.locator("#referenceImages-error")).toBeEmpty();
    await expect(page.getByText(/Morning|Afternoon|Evening/, { exact: true })).toHaveCount(0);
  }
});
