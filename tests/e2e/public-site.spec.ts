import { expect, test } from "@playwright/test";

/**
 * Public-site end-to-end tests.
 *
 * Uses real production build output. Registration POSTs are intercepted so the
 * suite is deterministic and needs no live backend.
 */

test.describe("public home page", () => {
  // Record a consent decision up front so the fixed cookie banner cannot overlap
  // page content during these navigation tests.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "cyberwolf360.cookieConsent.v1",
        JSON.stringify({ decision: "essential", decidedAt: new Date().toISOString() }),
      );
    });
  });

  test("shows the brand, tagline and hero copy", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /CyberWolf/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn. Secure. Build.");
    await expect(page.getByText(/Build Your Skills in Cybersecurity/i)).toBeVisible();
  });

  test("navigation works and never exposes an admin link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/admin/i)).toHaveCount(0);

    // Courses/Pricing/About/FAQ are in-page sections, reached by anchor. They
    // are intentionally NOT surfaced as nav links anymore; the only top-level
    // navigation is the Enroll CTA.
    await expect(page.locator("#courses")).toBeAttached();
    await expect(page.locator("#pricing")).toBeAttached();
    await expect(page.locator("#about")).toBeAttached();
    await expect(page.locator("#faq")).toBeAttached();

    const primaryNav = page.getByRole("navigation", { name: "Primary" });
    await expect(primaryNav.getByRole("link", { name: "Courses" })).toHaveCount(0);
    await expect(primaryNav.getByRole("link", { name: "Pricing" })).toHaveCount(0);

    // Keyboard-operable navigation to the pricing section via the hero CTA.
    await page.getByRole("link", { name: "View Pricing" }).click();
    await expect(page).toHaveURL(/#pricing$/);
    await expect(page.locator("#pricing-heading")).toBeVisible();
  });

  test("does not expose Courses/Pricing/About/FAQ as separate routes", async ({ page }) => {
    for (const path of ["/courses", "/pricing", "/about", "/faq", "/privacy", "/terms"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    }
  });

  test("shows the formatted address and icon-only social links", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(
      footer.getByText("No. 3A, 10th Street, Gandhi Nagar, Tiruvannamalai, Tamil Nadu 606601"),
    ).toBeVisible();
    // Social links are icon-only, so they are matched by their accessible name.
    for (const name of ["LinkedIn", "Instagram", "WhatsApp"]) {
      await expect(footer.getByRole("link", { name: new RegExp(name, "i") })).toBeVisible();
    }
  });
});

test.describe("courses and pricing", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "cyberwolf360.cookieConsent.v1",
        JSON.stringify({ decision: "essential", decidedAt: new Date().toISOString() }),
      );
    });
  });

  test("lists the three courses with the confirmed descriptions", async ({ page }) => {
    await page.goto("/");
    const courses = page.locator("#courses");
    await expect(courses.getByText("Cyber Security").first()).toBeVisible();
    await expect(courses.getByText("AI & Web Development").first()).toBeVisible();
    await expect(courses.getByText("Ethical Hacking").first()).toBeVisible();
  });

  test("pricing shows the single-course and two-course offers", async ({ page }) => {
    await page.goto("/");
    const pricing = page.locator("#pricing");
    await expect(pricing.getByText(/8,500/).first()).toBeVisible();
    await expect(pricing.getByText(/12,500/).first()).toBeVisible();
    await expect(pricing.getByText(/12,000/).first()).toBeVisible();
    await expect(pricing.getByText(/24,000/).first()).toBeVisible();
  });
});

test.describe("cookie consent and legal dialogs", () => {
  test("shows the cookie banner on first visit and remembers the choice", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("region", { name: /Cookie consent/i });
    await expect(banner).toBeVisible();

    await banner.getByRole("button", { name: "Accept all" }).click();
    await expect(banner).toBeHidden();

    // The decision persists across a reload (stored in local storage).
    await page.reload();
    await expect(page.getByRole("region", { name: /Cookie consent/i })).toBeHidden();
    await expect(page.getByText(/Cookie choice: Accepted all/i)).toBeVisible();
  });

  test("opens the Privacy, Terms and Cookie policies as in-page dialogs", async ({ page }) => {
    await page.goto("/");
    // Dismiss the banner first so it does not overlap the footer.
    await page.getByRole("region", { name: /Cookie consent/i }).getByRole("button", { name: "Essential only" }).click();

    const legal = page.getByRole("navigation", { name: /Legal/i });
    await legal.getByRole("button", { name: "Privacy Policy" }).click();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
    await page.keyboard.press("Escape");

    await legal.getByRole("button", { name: "Terms of Service" }).click();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Terms of Service" })).toBeVisible();
    await page.keyboard.press("Escape");

    await legal.getByRole("button", { name: "Cookie Policy" }).click();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Cookie Policy" })).toBeVisible();
  });

  test("Cookie settings re-opens the banner", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("region", { name: /Cookie consent/i }).getByRole("button", { name: "Accept all" }).click();
    await expect(page.getByRole("region", { name: /Cookie consent/i })).toBeHidden();

    await page.getByRole("navigation", { name: /Legal/i }).getByRole("button", { name: "Cookie settings" }).click();
    await expect(page.getByRole("region", { name: /Cookie consent/i })).toBeVisible();
  });
});

test.describe("registration form", () => {
  // The cookie banner is fixed to the bottom of the viewport; dismiss it so it
  // cannot overlap the form controls during these tests.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "cyberwolf360.cookieConsent.v1",
        JSON.stringify({ decision: "essential", decidedAt: new Date().toISOString() }),
      );
    });
  });

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
    await page.getByLabel(/Department/i).selectOption("cse");
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
    await page.getByLabel(/Department/i).selectOption("it");
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
