import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end configuration for the public site.
 *
 * The suite builds the public app and serves the production bundle, then drives
 * it with a real browser. The registration API is intercepted per-test so the
 * suite does not require the backend to be running.
 */
export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "public-site",
      testMatch: /public-site\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "public-site-mobile",
      testMatch: /public-site\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "admin-app",
      testMatch: /admin-app\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:4174" },
    },
  ],
  webServer: [
    {
      command: "npm run preview -w @cyberwolf/public-site -- --port 4173 --host 127.0.0.1",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      cwd: "../..",
    },
    {
      command: "npm run preview -w @cyberwolf/private-admin -- --port 4174 --host 127.0.0.1",
      url: "http://127.0.0.1:4174",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      cwd: "../..",
    },
  ],
});
