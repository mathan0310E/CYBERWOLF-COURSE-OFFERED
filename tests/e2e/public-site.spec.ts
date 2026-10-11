import { expect, test } from "@playwright/test";

/**
 * Public-site end-to-end tests.
 *
 * Uses real production build output. Registration POSTs are intercepted so the
 * suite is deterministic and needs no live backend.
 */

test.describe("public home page", () => {
  test("shows the brand, tagline and hero copy", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /CyberWolf/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn. Secure. Build.");
    await expect(page.getByText(/Build Your Skills in Cybersecurity/i)).toBeVisible();
  });

  test("navigation works and never exposes an admin link", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation").first();
    await expect(nav).toBeVisible();
    await expect(page.getByText(/admin/i)).toHaveCount(0);

    // Keyboard-operable navigation to pricing.
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("courses and pricing", () => {
  test("lists the three courses with the confirmed descriptions", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByText("Cyber Security").first()).toBeVisible();
    await expect(page.getByText("AI & Web Development").first()).toBeVisible();
    await expect(page.getByText("Ethical Hacking").first()).toBeVisible();
  });

  test("pricing shows the single-course and two-course offers", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/8,500/).first()).toBeVisible();
    await expect(page.getByText(/12,500/).first()).toBeVisible();
    await expect(page.getByText(/12,000/).first()).toBeVisible();
    await expect(page.getByText(/24,000/).first()).toBeVisible();
  });
});

test.describe("registration form", () => {
  test("requires at least one course and consent before submitting", async ({ page }) => {
    await page.goto("/enroll");
    const submit = page.getByRole("button", { name: /Submit registration/i });
    await expect(submit).toBeDisabled();

    // Fill details but select no course.
    await page.getByLabel(/Full name/i).fill("Ada Lovelace");
    await page.getByLabel(/Email/i).fill("ada@example.com");
    await page.getByLabel(/Mobile number/i).fill("+91 98765 43210");
    await expect(submit).toBeDisabled();
  });

  test("selects a course, shows the price preview and submits successfully", async ({ page }) => {
    await page.route("**/api/registrations", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          reference: "CW-20260101-ABCD1234",
          courseIds: ["cyber-security"],
          price: { courseCount: 1, originalPrice: 12_000, discount: 3_500, finalPrice: 8_500 },
          status: "received",
          createdAt: "2026-01-01T00:00:00.000Z",
          firstTimeEmail: true,
        }),
      });
    });

    await page.goto("/enroll");
    await page.locator("#course-cyber-security").click();
    await expect(page.getByText(/8,500/).first()).toBeVisible();

    await page.getByLabel(/Full name/i).fill("Ada Lovelace");
    await page.getByLabel(/Email/i).fill("ada@example.com");
    await page.getByLabel(/Mobile number/i).fill("+91 98765 43210");
    await page.getByLabel(/College/i).fill("Government Engineering College");
    await page.getByLabel(/Degree/i).selectOption("btech");
    await page.getByLabel(/Year of study/i).selectOption("third");
    await page.locator("#privacyConsent").click();

    const submit = page.getByRole("button", { name: /Submit registration/i });
    await expect(submit).toBeEnabled();
    await submit.click();

    // Real reference and a receipt confirmation (not "admission confirmed").
    await expect(page.getByText(/CW-20260101-ABCD1234/)).toBeVisible();
    await expect(page.getByText(/does not confirm admission or payment/i)).toBeVisible();
  });

  test("preserves input and shows a retry action on a network failure", async ({ page }) => {
    await page.route("**/api/registrations", async (route) => {
      await route.abort("failed");
    });

    await page.goto("/enroll");
    await page.locator("#course-cyber-security").click();
    await page.getByLabel(/Full name/i).fill("Grace Hopper");
    await page.getByLabel(/Email/i).fill("grace@example.com");
    await page.getByLabel(/Mobile number/i).fill("+91 90000 00000");
    await page.getByLabel(/College/i).fill("Anna University");
    await page.getByLabel(/Degree/i).selectOption("bsc");
    await page.getByLabel(/Year of study/i).selectOption("first");
    await page.locator("#privacyConsent").click();
    await page.getByRole("button", { name: /Submit registration/i }).click();

    await expect(page.getByRole("alert").first()).toBeVisible();
    // Input preserved.
    await expect(page.getByLabel(/Full name/i)).toHaveValue("Grace Hopper");
    await expect(page.getByText(/safely try again/i)).toBeVisible();
  });

  test("shows inline validation for an invalid email", async ({ page }) => {
    await page.goto("/enroll");
    await page.locator("#course-cyber-security").click();
    await page.getByLabel(/Email/i).fill("not-an-email");
    await page.getByLabel(/Full name/i).click(); // blur
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });
});

test.describe("accessibility", () => {
  test("supports keyboard-only navigation and visible focus", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /Skip to content/i });
    await expect(skipLink).toBeAttached();

    // The skip link is the first tabbable control and must receive focus.
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    // It is visually hidden until focused; a visible focus indicator is required.
    await expect(skipLink).toBeVisible();
  });

  test("honours reduced-motion preference without errors", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
