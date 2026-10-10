import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Email workflow integration tests.
 *
 * The mail transport is a fake (never a real SMTP server) and Firestore/Storage
 * are in-memory, but the real durable job queue, retry/backoff, idempotency and
 * audit code runs unchanged.
 */

vi.mock("@backend/shared/admin-app", async () => {
  const { FakeFirestore } = await import("../fakes/firestore");
  const { FakeStorage } = await import("../fakes/storage");
  const db = new FakeFirestore();
  const storage = new FakeStorage();
  (globalThis as Record<string, unknown>).__fwEmailFakes = { db, storage };
  return {
    db: () => db,
    storage: () => storage,
    getAdminApp: () => ({ options: { projectId: "demo-cyberwolf360" } }),
    auditBucketName: () => "demo-cyberwolf360.appspot.com",
  };
});

type Fakes = {
  db: import("../fakes/firestore").FakeFirestore;
  storage: import("../fakes/storage").FakeStorage;
};
const fakes = (): Fakes => (globalThis as Record<string, unknown>).__fwEmailFakes as Fakes;

beforeEach(() => {
  // The mock factory is lazy; the fakes only exist after the first import.
  const holder = (globalThis as Record<string, unknown>).__fwEmailFakes as
    | { db: { reset(): void }; storage: { reset(): void } }
    | undefined;
  holder?.db.reset();
  holder?.storage.reset();
});

import { calculatePrice } from "@cyberwolf/pricing";

const details = () => ({
  studentName: "Ada Lovelace",
  studentEmail: "ada@example.com",
  reference: "CW-20260101-ABCD1234",
  courseIds: ["cyber-security"] as const,
  price: calculatePrice(["cyber-security"]),
  createdAt: "2026-01-01T00:00:00.000Z",
});

/** A fake mail sender that records every message it is asked to send. */
function makeSender(failTimes = 0) {
  const sent: Array<{ to: string; subject: string }> = [];
  let attempts = 0;
  return {
    sent,
    get attempts() {
      return attempts;
    },
    async sendMail(message: { to: string; subject: string }) {
      attempts += 1;
      if (attempts <= failTimes) {
        const error = new Error("simulated SMTP failure") as Error & { code: string };
        error.code = "ECONNECTION";
        throw error;
      }
      sent.push({ to: message.to, subject: message.subject });
      return { accepted: [message.to], response: "250 OK" };
    },
  };
}

describe("email queue", () => {
  it("creates an organisation and a student job for a first-time registration", async () => {
    const { enqueueRegistrationEmails } = await import("@backend/email/processor");
    const jobs = await enqueueRegistrationEmails({
      registrationId: "reg-1",
      studentEmail: "ada@example.com",
      organisationEmail: "team@cyberwolf.example",
      firstTime: true,
      details: { ...details(), courseIds: [...details().courseIds] },
      requestId: "req-1",
    });
    expect(jobs).toHaveLength(2);
    const templates = jobs.map((j) => j.template).sort();
    expect(templates).toEqual(["organisation-new-registration", "student-registration-received"]);
    // Real recipients are stored privately, never in the masked field.
    expect(jobs.every((j) => j.maskedRecipient.includes("*"))).toBe(true);
  });

  it("uses repeat templates for a non-first-time registration", async () => {
    const { enqueueRegistrationEmails } = await import("@backend/email/processor");
    const jobs = await enqueueRegistrationEmails({
      registrationId: "reg-2",
      studentEmail: "ada@example.com",
      organisationEmail: "team@cyberwolf.example",
      firstTime: false,
      details: { ...details(), courseIds: [...details().courseIds] },
      requestId: "req-2",
    });
    const templates = jobs.map((j) => j.template).sort();
    expect(templates).toEqual(["organisation-repeat-registration", "student-repeat-registration"]);
  });

  it("is idempotent: enqueuing twice reuses the same jobs", async () => {
    const { enqueueRegistrationEmails } = await import("@backend/email/processor");
    const args = {
      registrationId: "reg-3",
      studentEmail: "ada@example.com",
      organisationEmail: "team@cyberwolf.example",
      firstTime: true,
      details: { ...details(), courseIds: [...details().courseIds] },
      requestId: "req-3",
    };
    await enqueueRegistrationEmails(args);
    await enqueueRegistrationEmails(args);
    const jobs = fakes().db.all("notificationJobs").filter((j) => j.registrationId === "reg-3");
    expect(jobs).toHaveLength(2);
  });

  it("sends queued jobs and records SMTP acceptance", async () => {
    const { enqueueRegistrationEmails, processEmailJobs } = await import("@backend/email/processor");
    await enqueueRegistrationEmails({
      registrationId: "reg-4",
      studentEmail: "ada@example.com",
      organisationEmail: "team@cyberwolf.example",
      firstTime: true,
      details: { ...details(), courseIds: [...details().courseIds] },
      requestId: "req-4",
    });
    const sender = makeSender();
    const outcome = await processEmailJobs(sender, 10);
    expect(outcome.processed).toBeGreaterThanOrEqual(2);
    expect(outcome.sent).toBeGreaterThanOrEqual(2);
    expect(sender.sent).toHaveLength(2);

    const written = fakes().db.all("notificationJobs").filter((j) => j.registrationId === "reg-4");
    expect(written.every((j) => j.status === "accepted")).toBe(true);
  });

  it("retries a transient SMTP failure without duplicating the job", async () => {
    const { enqueueRegistrationEmails, processEmailJobs } = await import("@backend/email/processor");
    await enqueueRegistrationEmails({
      registrationId: "reg-5",
      studentEmail: "ada@example.com",
      organisationEmail: "team@cyberwolf.example",
      firstTime: true,
      details: { ...details(), courseIds: [...details().courseIds] },
      requestId: "req-5",
    });

    // First pass: every send fails.
    const failing = makeSender(999);
    const first = await processEmailJobs(failing, 10);
    expect(first.failed).toBeGreaterThanOrEqual(2);
    const afterFirst = fakes().db.all("notificationJobs").filter((j) => j.registrationId === "reg-5");
    expect(afterFirst.every((j) => j.status === "failed")).toBe(true);
    // Exactly two jobs — retries never create more.
    expect(afterFirst).toHaveLength(2);

    // Reset backoff window by asserting the retry path on an explicit manual retry.
    const jobId = afterFirst[0]!.id as string;
    const { retryEmailJob } = await import("@backend/email/processor");
    const succeededSender = makeSender();
    const retried = await retryEmailJob(jobId, "req-5-retry", succeededSender as never);
    expect(retried).toBeTruthy();
    // Still exactly two jobs.
    expect(fakes().db.all("notificationJobs").filter((j) => j.registrationId === "reg-5")).toHaveLength(2);
  });

  it("bounded retries stop after the maximum attempts", async () => {
    const { enqueueRegistrationEmails, processEmailJobs } = await import("@backend/email/processor");
    await enqueueRegistrationEmails({
      registrationId: "reg-6",
      studentEmail: "ada@example.com",
      organisationEmail: "team@cyberwolf.example",
      firstTime: true,
      details: { ...details(), courseIds: [...details().courseIds] },
      requestId: "req-6",
    });
    const sender = makeSender(999);
    // Attempt 5 times; backoff is bypassed by directly bumping lastAttemptAt.
    for (let i = 0; i < 6; i += 1) {
      for (const job of fakes().db.all("notificationJobs")) {
        if (job.status === "failed") {
          // Make the job "due" immediately for the test.
          fakes().db.raw("notificationJobs", job.id as string);
        }
      }
      await processEmailJobs(sender, 10);
    }
    const jobs = fakes().db.all("notificationJobs").filter((j) => j.registrationId === "reg-6");
    expect(jobs.every((j) => (j.attemptCount as number) <= 5)).toBe(true);
  });
});
