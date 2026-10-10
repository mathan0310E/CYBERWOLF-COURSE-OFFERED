import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readRules, rulesTestAvailable } from "./helpers";

/**
 * Structural assertions on the security rules. These always run and do not need
 * the emulator: they guard against the rules being weakened by a future edit
 * (for example, accidentally allowing client writes or dropping the catch-all
 * deny).
 */

describe("firestore.rules structure", () => {
  const rules = readRules("firebase/firestore.rules");

  it("denies by default with an explicit catch-all", () => {
    expect(rules).toMatch(/match \/\{document=\*\*\}/);
    expect(rules).toMatch(/allow read, write: if false;/);
  });

  it("derives admin only from the server-set custom claim", () => {
    expect(rules).toContain("request.auth.token.admin == true");
    // No client-supplied admin flag is consulted.
    expect(rules).not.toMatch(/request\.data\.admin/);
    expect(rules).not.toMatch(/request\.resource\.data\.admin/);
  });

  it("forbids all client writes to registration and audit collections", () => {
    expect(rules).toContain("allow create, update, delete: if false;");
    const writeDenies = rules.match(/allow write: if false;/g) ?? [];
    // emailProfiles, notificationJobs, auditEvents, auditManifests, adminSettings.
    expect(writeDenies.length).toBeGreaterThanOrEqual(5);
  });

  it("allows a registrant to read only their own registration", () => {
    expect(rules).toContain("resource.data.ownerUid == request.auth.uid");
  });
});

describe("storage.rules structure", () => {
  const rules = readRules("firebase/storage.rules");

  it("denies all client access to audit log objects", () => {
    expect(rules).toMatch(/match \/audit-logs\/\{allPaths=\*\*\}/);
    expect(rules).toMatch(/allow read, write: if false;/);
  });

  it("has an explicit catch-all deny", () => {
    expect(rules).toMatch(/match \/\{allPaths=\*\*\}/);
  });
});

const describeIfEmulator = rulesTestAvailable() ? describe : describe.skip;

describeIfEmulator("firestore.rules enforced (emulator)", () => {
  // Loaded lazily so the module is only required when the emulator can run.
  let testEnv: import("@firebase/rules-unit-testing").RulesTestEnvironment;
  let rulesUnit: typeof import("@firebase/rules-unit-testing");

  beforeAll(async () => {
    rulesUnit = await import("@firebase/rules-unit-testing");
    testEnv = await rulesUnit.initializeTestEnvironment({
      projectId: "demo-cyberwolf360",
      firestore: {
        rules: readRules("firebase/firestore.rules"),
      },
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  it("prevents an unauthenticated client from reading registrations", async () => {
    const ctx = testEnv.unauthenticatedContext();
    const db = ctx.firestore();
    await expect(db.collection("registrations").doc("r1").get()).rejects.toBeTruthy();
  });

  it("prevents a client from creating a registration", async () => {
    const ctx = testEnv.authenticatedContext("user-1");
    await expect(
      ctx.firestore().collection("registrations").doc("r2").set({ ownerUid: "user-1" }),
    ).rejects.toBeTruthy();
  });

  it("prevents a client from writing audit events", async () => {
    const ctx = testEnv.authenticatedContext("user-1");
    await expect(
      ctx.firestore().collection("auditEvents").doc("e1").set({ action: "forged" }),
    ).rejects.toBeTruthy();
  });

  it("prevents a client from granting itself admin (no adminSettings write)", async () => {
    const ctx = testEnv.authenticatedContext("user-1");
    await expect(
      ctx.firestore().collection("adminSettings").doc("self").set({ admin: true }),
    ).rejects.toBeTruthy();
  });

  it("allows an admin claim to read audit metadata", async () => {
    const ctx = testEnv.authenticatedContext("admin-1", { admin: true });
    await expect(ctx.firestore().collection("auditEvents").get()).resolves.toBeTruthy();
  });
});
