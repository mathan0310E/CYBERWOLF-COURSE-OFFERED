import { defineConfig } from "vitest/config";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "..");

/**
 * Unit + integration test configuration.
 *
 * These tests do not require the Firebase emulators or Java: the backend's
 * authoritative logic (pricing, validation, formatting, authorization, email
 * workflow, secret redaction) is exercised with the Firestore/Storage and SMTP
 * boundaries injected as fakes. Emulator-backed tests live under
 * tests/integration and are guarded by FIREBASE_EMULATOR_AVAILABLE.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.ts",
    ],
    exclude: ["tests/e2e/**", "**/node_modules/**"],
    setupFiles: [path.join(__dirname, "setup.ts")],
    pool: "threads",
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
  resolve: {
    alias: {
      "@cyberwolf/shared-types": path.join(repoRoot, "packages/shared-types/src/index.ts"),
      "@cyberwolf/pricing": path.join(repoRoot, "packages/pricing/src/index.ts"),
      "@cyberwolf/validation": path.join(repoRoot, "packages/validation/src/index.ts"),
      "@backend": path.join(repoRoot, "functions/src"),
    },
  },
});
