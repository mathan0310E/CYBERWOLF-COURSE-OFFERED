/**
 * Public Firestore query helper kept intentionally minimal.
 *
 * The public site does NOT read registration data from Firestore: the security
 * rules deny client reads. Registration submission and status checks go through
 * the trusted backend API. This module exists only for small public lookups and
 * to keep a single import surface for Firebase usage in the public app.
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";

export interface PublicFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const config: PublicFirebaseConfig = {
  apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_PUBLIC_FIREBASE_APP_ID ?? "",
};

let app: FirebaseApp | null = null;
let emulatorsConnected = false;

/** True when the public Firebase config has been supplied. */
export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

/**
 * Connect to the local Firebase Emulator Suite when explicitly opted in.
 * Dev-only: guarded by `VITE_USE_FIREBASE_EMULATORS` (never set in a
 * production build) and only in a dev build, so a real deployment always
 * talks to the production Firebase project.
 */
function connectEmulatorsIfEnabled(auth: Auth, db: Firestore): void {
  if (emulatorsConnected) return;
  emulatorsConnected = true;
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_FIREBASE_EMULATORS !== "true") return;
  const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || "127.0.0.1";
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
}

function getApp(): FirebaseApp {
  if (!app) app = initializeApp(config);
  return app;
}

export function getPublicAuth(): Auth {
  const auth = getAuth(getApp());
  connectEmulatorsIfEnabled(auth, getFirestore(getApp()));
  return auth;
}

export function getPublicDb(): Firestore {
  const db = getFirestore(getApp());
  connectEmulatorsIfEnabled(getAuth(getApp()), db);
  return db;
}
