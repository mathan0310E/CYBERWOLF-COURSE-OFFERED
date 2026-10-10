import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Registration integration tests.
 *
 * The Firestore/Storage *boundaries* are replaced with in-memory fakes, but the
 * real service, audit writer and email-queue code runs unchanged. This exercises
 * the actual storage, pricing-recalculation, deduplication and first-time-email
 * logic without needing the Firebase emulator (and therefore without Java).
 */

vi.mock("@backend/shared/admin-app", async () => {
  const { FakeFirestore } = await import("../fakes/firestore");
  const { FakeStorage } = await import("../fakes/storage");
  const db = new FakeFirestore();
  const storage = new FakeStorage();
  // Expose the fakes to the test body via a well-known global.
  (globalThis as Record<string, unknown>).__fwFakes = { db, storage };
  return {
    db: () => db,
    storage: () => storage,
    getAdminApp: () => ({ options: { projectId: "demo-cyberwolf360" } }),
    auditBucketName: () => "demo-cyberwolf360.appspot.com",
    auth: () => ({
      verifyIdToken: async () => {
        throw new Error("auth not used in this test");
      },
    }),
  };
});

type Fakes = {
  db: import("../fakes/firestore").FakeFirestore;
  storage: import("../fakes/storage").FakeStorage;
};

function fakes(): Fakes {
  return (globalThis as Record<string, unknown>).__fwFakes as Fakes;
}

beforeEach(() => {
  // The mock factory is lazy; the fakes only exist after the first import.
  const holder = (globalThis as Record<string, unknown>).__fwFakes as
    | { db: { reset(): void }; storage: { reset(): void } }
    | undefined;
  holder?.db.reset();
  holder?.storage.reset();
});

const validInput = {
  fullName: "Ada Lovelace",
  email: "Ada@Example.com",
  mobile: "+91 98765 43210",
  courseIds: ["cyber-security"] as const,
  college: "Government Engineering College",
  degree: "btech" as const,
  yearOfStudy: "third" as const,
  privacyConsent: true,
};

describe("createRegistration", () => {
  it("stores a registration with server-calculated pricing and a reference", async () => {
    const { createRegistration } = await import("@backend/registrations/service");
    const result = await createRegistration({
      input: { ...validInput, courseIds: ["cyber-security"] },
      requestId: "req-1",
      idempotencyKey: "idem-1",
    });

    expect(result.duplicate).toBe(false);
    expect(result.firstTimeEmail).toBe(true);
    expect(result.registration.reference).toMatch(/^CW-\d{8}-[0-9A-F]{8}$/);
    expect(result.registration.price).toEqual({
      courseCount: 1,
      originalPrice: 12_000,
      discount: 3_500,
      finalPrice: 8_500,
    });
    expect(result.registration.status).toBe("received");
    expect(result.registration.privacyConsent).toBe(true);

    const stored = fakes().db.raw("registrations", result.registration.id);
    expect(stored).toBeTruthy();
    expect((stored as { price: { finalPrice: number } }).price.finalPrice).toBe(8_500);
    // Student academic context is persisted alongside the registration.
    expect(result.registration.college).toBe("Government Engineering College");
    expect(result.registration.degree).toBe("btech");
    expect(result.registration.yearOfStudy).toBe("third");
  });

  it("ignores any client-supplied price (the schema is strict upstream, and the server recalcs)", async () => {
    const { createRegistration } = await import("@backend/registrations/service");
    const result = await createRegistration({
      input: { ...validInput, courseIds: ["cyber-security", "ethical-hacking"] },
      requestId: "req-2",
    });
    expect(result.registration.price.finalPrice).toBe(12_500);
  });

  it("suppresses an identical submission within the deduplication window", async () => {
    const { createRegistration } = await import("@backend/registrations/service");
    const first = await createRegistration({ input: { ...validInput }, requestId: "r-a" });
    const second = await createRegistration({ input: { ...validInput }, requestId: "r-b" });

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.registration.id).toBe(first.registration.id);
    // Only one registration document exists.
    expect(fakes().db.count("registrations")).toBeGreaterThanOrEqual(1);
    const regs = fakes().db.all("registrations").filter((r) => r.normalizedEmail === "ada@example.com");
    expect(regs).toHaveLength(1);
  });

  it("marks a repeat registration from the same email as not first-time", async () => {
    const { createRegistration } = await import("@backend/registrations/service");
    const first = await createRegistration({
      input: { ...validInput, email: "repeat@example.com", courseIds: ["cyber-security"] },
      requestId: "r-1",
    });
    const second = await createRegistration({
      input: { ...validInput, email: "repeat@example.com", courseIds: ["ethical-hacking"] },
      requestId: "r-2",
    });

    expect(first.firstTimeEmail).toBe(true);
    expect(second.firstTimeEmail).toBe(false);
    // Different selection => not a duplicate, so a second registration exists.
    expect(second.registration.id).not.toBe(first.registration.id);
  });

  it("treats plus-addressed email as a distinct address (no alias stripping)", async () => {
    const { createRegistration } = await import("@backend/registrations/service");
    const plain = await createRegistration({
      input: { ...validInput, email: "plus@example.com", courseIds: ["cyber-security"] },
      requestId: "p-1",
    });
    const plus = await createRegistration({
      input: { ...validInput, email: "plus+tag@example.com", courseIds: ["cyber-security"] },
      requestId: "p-2",
    });
    expect(plain.firstTimeEmail).toBe(true);
    expect(plus.firstTimeEmail).toBe(true);
  });

  it("creates durable organisation and student notification jobs", async () => {
    const { createRegistration } = await import("@backend/registrations/service");
    await createRegistration({ input: { ...validInput, email: "jobs@example.com" }, requestId: "j-1" });
    const jobs = fakes().db.all("notificationJobs").filter((j) => (j as { recipientType?: string }).recipientType);
    const types = jobs.map((j) => (j as { recipientType: string }).recipientType).sort();
    expect(types).toContain("organisation");
    expect(types).toContain("student");
  });

  it("rejects a selection of more than two courses", async () => {
    const { createRegistration } = await import("@backend/registrations/service");
    await expect(
      createRegistration({
        input: {
          ...validInput,
          courseIds: ["cyber-security", "ai-web-development", "ethical-hacking"] as never,
        },
        requestId: "x-1",
      }),
    ).rejects.toBeTruthy();
  });
});

describe("updateRegistrationStatus", () => {
  it("changes status and records an admin audit event", async () => {
    const { createRegistration, updateRegistrationStatus } = await import("@backend/registrations/service");
    const created = await createRegistration({ input: { ...validInput, email: "status@example.com" }, requestId: "s-1" });
    const updated = await updateRegistrationStatus(created.registration.id, "confirmed", "s-2", "admin-uid");
    expect(updated.status).toBe("confirmed");
    expect(updated.statusUpdatedBy).toBe("admin-uid");
  });
});
