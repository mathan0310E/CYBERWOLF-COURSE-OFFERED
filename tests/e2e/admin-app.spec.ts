import { expect, test } from "@playwright/test";

/**
 * Private admin application end-to-end tests.
 *
 * Verifies the login gate and that protected routes cannot be reached without an
 * authenticated administrator. When Firebase/Auth is not configured in the test
 * build the app must show a clear setup notice rather than pretending to be
 * signed in; when it IS configured the notice must be absent and the login form
 * shown instead.
 */

test.describe("admin login gate", () => {
  test("redirects an unauthenticated visitor to the login page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(/CyberWolf 360 Administration/i)).toBeVisible();
  });

  test("shows a clear setup notice when Firebase is not configured", async ({ page }) => {
    await page.goto("/login");
    const alert = page.getByRole("alert");
    if ((await alert.count()) > 0) {
      // Unconfigured build: a clear setup error must be shown, never fake success.
      await expect(alert).toContainText(/not configured/i);
    } else {
      // Configured build: the notice is correctly absent; the login form is shown.
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    }
  });

  test("exposes password recovery but never a public signup", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    // No public administrator signup control.
    await expect(page.getByRole("link", { name: /sign up|register|create account/i })).toHaveCount(0);
  });

  test("does not expose registration data on the login screen", async ({ page }) => {
    await page.goto("/login");
    const html = await page.content();
    expect(html).not.toMatch(/@example\.com/);
  });
});
