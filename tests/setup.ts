/**
 * Global test setup. Puts the backend into emulator mode so the mail transport
 * uses a JSON transport and no real Firebase/SMTP service is contacted.
 */
process.env.FUNCTIONS_EMULATOR = process.env.FUNCTIONS_EMULATOR ?? "true";
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT ?? "demo-cyberwolf360";
process.env.FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET ?? "demo-cyberwolf360.appspot.com";
// Restrict CORS to the two known local apps for deterministic tests.
process.env.ALLOWED_ORIGINS =
  process.env.ALLOWED_ORIGINS ?? "http://localhost:5173,http://localhost:5174";

export const EMULATOR_AVAILABLE = process.env.FIREBASE_EMULATOR_AVAILABLE === "true";
