#!/usr/bin/env node
/**
 * Local runner for the trusted backend.
 *
 * The backend is normally deployed as the `api` Cloud Function. This script
 * runs the exact same Express app (functions/lib/app.js) as a standalone HTTP
 * server so the full stack can be exercised locally against REAL Firebase
 * (Firestore / Storage / Auth) using the Admin SDK's application-default
 * credentials.
 *
 * It serves under the Firebase emulator URL shape
 * (`/<projectId>/<region>/api`) so the two Vite applications — whose
 * VITE_API_BASE_URL points at the emulator host — can talk to it unchanged.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./secrets/<key>.json \
 *     node scripts/serve-api.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/** Minimal .env loader (no dependency): fills process.env without overriding. */
function loadEnvFile(file) {
  let raw;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(ROOT, "functions", ".env"));

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "cyber-wolf-course-offer";
const REGION = process.env.FUNCTION_REGION || "us-central1";
const FUNCTION_NAME = "api";
const PORT = Number.parseInt(process.env.PORT || "5001", 10);
const BASE_PATH = `/${PROJECT_ID}/${REGION}/${FUNCTION_NAME}`;

// The Admin SDK reads this to target the production project instead of an
// emulator. Set before the app (and therefore firebase-admin) is imported.
process.env.GCLOUD_PROJECT = PROJECT_ID;
if (!process.env.FIREBASE_PROJECT_ID) process.env.FIREBASE_PROJECT_ID = PROJECT_ID;

const { buildApp } = await import("../functions/lib/app.js");

const { default: express } = await import("express");

const app = buildApp();
// Mount the API under the Firebase-style path so the two Vite apps (whose
// VITE_API_BASE_URL already includes `/<project>/<region>/api`) reach it
// unchanged. The real Cloud Function strips the function-name prefix the same
// way before the Express app handles the request.
const root = express();
root.use(BASE_PATH, app);
root.listen(PORT, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(
    `[serve-api] trusted backend on http://127.0.0.1:${PORT}${BASE_PATH}\n` +
      `[serve-api] project=${PROJECT_ID} credentials=${process.env.GOOGLE_APPLICATION_CREDENTIALS ? "file" : "default"}`,
  );
});
