import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Security-rules test configuration.
 *
 * These tests run against the Firebase Emulator Suite (Firestore + Storage
 * rules). The emulator requires Java; when it is not available the suite skips
 * cleanly instead of failing, so `npm run test:security` is CI-safe.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/security/**/*.test.ts"],
    setupFiles: [path.join(__dirname, "setup.ts")],
    pool: "forks",
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
