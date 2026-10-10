#!/usr/bin/env node
/**
 * Provision or update a CyberWolf 360 administrator.
 *
 * This script sets the `admin` custom claim ONLY from trusted server-side code.
 * There is no public administrator sign-up: use this script or the Firebase
 * console. Never hardcode credentials; pass them via the environment.
 *
 * Usage (local dev, against the emulator):
 *   PROVISION_ADMIN_EMAIL=admin@example.com \
 *   PROVISION_ADMIN_PASSWORD='a-strong-password' \
 *   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
 *   GCLOUD_PROJECT=demo-cyberwolf360 \
 *   node scripts/provision-admin.mjs
 *
 * Usage (production, with Application Default Credentials or a service account):
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json \
 *   PROVISION_ADMIN_EMAIL=admin@example.com \
 *   PROVISION_ADMIN_PASSWORD='a-strong-password' \
 *   node scripts/provision-admin.mjs
 */

import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const email = required("PROVISION_ADMIN_EMAIL");
  const password = required("PROVISION_ADMIN_PASSWORD");

  if (password.length < 12) {
    console.error("Refusing to provision: PROVISION_ADMIN_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
    });
  }

  const auth = getAuth();

  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log(`Found existing user ${email} (uid ${user.uid}); updating password.`);
    user = await auth.updateUser(user.uid, { password, emailVerified: true });
  } catch (error) {
    if (error?.code === "auth/user-not-found") {
      console.log(`Creating new user ${email}.`);
      user = await auth.createUser({ email, password, emailVerified: true });
    } else {
      throw error;
    }
  }

  // Admin is granted solely through the custom claim below.
  await auth.setCustomUserClaims(user.uid, { admin: true });
  // Force-refresh tokens so the claim takes effect immediately.
  await auth.revokeRefreshTokens(user.uid);

  console.log(`Admin provisioned: ${email} (uid ${user.uid}).`);
  console.log("The account now carries the { admin: true } custom claim.");
  console.log("Sign in to the private admin application. It is a separate deployment.");
}

main().catch((error) => {
  console.error("Provisioning failed:", error?.message ?? error);
  process.exit(1);
});
