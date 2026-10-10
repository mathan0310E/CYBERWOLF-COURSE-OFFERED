import { getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";

/**
 * Initialise the Firebase Admin SDK exactly once. In the emulator suite the
 * SDK connects to the emulators automatically through the *_EMULATOR_HOST
 * environment variables; no service-account key is required locally.
 */
let cachedApp: App | null = null;

export function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps();
  if (existing.length > 0) {
    cachedApp = existing[0]!;
    return cachedApp;
  }
  cachedApp = initializeApp({
    credential: applicationDefault(),
    projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  return cachedApp;
}

let cachedDb: Firestore | null = null;
export function db(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getAdminApp());
    // Ignore undefined optional fields rather than throwing.
    try {
      cachedDb.settings({ ignoreUndefinedProperties: true });
    } catch {
      /* settings may already be applied */
    }
  }
  return cachedDb;
}

export function auth(): Auth {
  return getAuth(getAdminApp());
}

export function storage(): Storage {
  return getStorage(getAdminApp());
}

/** Resolve the configured audit bucket name, falling back to the default. */
export function auditBucketName(): string {
  const explicit = process.env.AUDIT_BUCKET;
  if (explicit) return explicit;
  const app = getAdminApp();
  const bucket = app.options.storageBucket;
  if (bucket) return bucket;
  const projectId = app.options.projectId || "demo-cyberwolf360";
  return `${projectId}.appspot.com`;
}
