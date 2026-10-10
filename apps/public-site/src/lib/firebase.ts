/**
 * Public Firestore query helper kept intentionally minimal.
 *
 * The public site does NOT read registration data from Firestore: the security
 * rules deny client reads. Registration submission and status checks go through
 * the trusted backend API. This module exists only for small public lookups and
 * to keep a single import surface for Firebase usage in the public app.
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

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

/** True when the public Firebase config has been supplied. */
export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

function getApp(): FirebaseApp {
  if (!app) app = initializeApp(config);
  return app;
}

export function getPublicAuth(): Auth {
  return getAuth(getApp());
}

export function getPublicDb(): Firestore {
  return getFirestore(getApp());
}
