import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";

/**
 * Private admin Firebase initialisation. This uses a SEPARATE Firebase app
 * configuration from the public site (its own VITE_ADMIN_* variables) and is
 * only ever bundled into the admin application.
 *
 * The admin never talks to Firestore directly for registration or audit data —
 * those reads go through the trusted backend, which enforces authorization
 * independently of the security rules.
 */
export interface AdminFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const config: AdminFirebaseConfig = {
  apiKey: import.meta.env.VITE_ADMIN_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_ADMIN_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_ADMIN_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_ADMIN_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_ADMIN_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_ADMIN_FIREBASE_APP_ID ?? "",
};

let app: FirebaseApp | null = null;
let emulatorConnected = false;

export function isAdminFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

function getApp(): FirebaseApp {
  if (!app) app = initializeApp(config, "cyberwolf-admin");
  return app;
}

export function getAdminAuth(): Auth {
  const auth = getAuth(getApp());
  // Dev-only emulator wiring: guarded by an explicit flag AND a dev build, so a
  // production admin deployment always authenticates against real Firebase.
  if (!emulatorConnected) {
    emulatorConnected = true;
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
      const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || "127.0.0.1";
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    }
  }
  return auth;
}
