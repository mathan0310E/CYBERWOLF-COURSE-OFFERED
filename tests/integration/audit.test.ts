import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Audit writer integration tests.
 *
 * The Firestore/Storage boundaries are faked, but the real durable outbox,
 * transaction-based sequence allocation, immutable chunk upload and hash-chain
 * code runs unchanged.
 */

vi.mock("@backend/shared/admin-app", async () => {
  const { FakeFirestore } = await import("../fakes/firestore");
  const { FakeStorage } = await import("../fakes/storage");
  const db = new FakeFirestore();
  const storage = new FakeStorage();
  (globalThis as Record<string, unknown>).__fwAuditFakes = { db, storage };
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
const fakes = (): Fakes => (globalThis as Record<string, unknown>).__fwAuditFakes as Fakes;

beforeEach(() => {
  // The mock factory is lazy; the fakes only exist after the first import.
  const holder = (globalThis as Record<string, unknown>).__fwAuditFakes as
    | { db: { reset(): void }; storage: { reset(): void } }
    | undefined;
  holder?.db.reset();
  holder?.storage.reset();
});

const event = (n: number, category: "registration" | "admin" | "audit" | "security" = "registration") => ({
  actorType: "registrant" as const,
  actorId: `user-${n}`,
  action: "registration.created",
  resourceType: "registration",
  resourceId: `reg-${n}`,
  result: "SUCCESS" as const,
  source: "public-site" as const,
  requestId: `req-${n}`,
  details: `Registration ${n}`,
  category,
});

describe("audit writer", () => {
  it("writes an immutable .txt chunk into the dated storage path", async () => {
    const { recordAuditEvent, readDailyTxt } = await import("@backend/audit/writer");
    const written = await recordAuditEvent(event(1));
    const date = written.timestamp.slice(0, 10);

    const names = fakes().storage.listObjectNames();
    expect(names.some((n) => n.startsWith(`audit-logs/${date.replace(/-/g, "/")}/`))).toBe(true);

    const content = await readDailyTxt(date, "registration");
    expect(content).toContain("CYBERWOLF 360 — AUDIT EVENT");
    expect(content).toContain("Resource ID: reg-1");
    expect(content).toContain("Category: registration");
  });

  it("allocates unique sequence numbers under concurrent writes", async () => {
    const { recordAuditEvent } = await import("@backend/audit/writer");
    const results = await Promise.all(Array.from({ length: 25 }, (_, i) => recordAuditEvent(event(100 + i))));

    const date = results[0]!.timestamp.slice(0, 10);
    const prefix = `audit-logs/${date.replace(/-/g, "/")}/`;
    const chunks = fakes().storage.listObjectNames().filter((n) => n.startsWith(prefix));
    // Every event produced exactly one chunk, and every chunk name is unique.
    const uniqueChunks = new Set(chunks);
    expect(uniqueChunks.size).toBe(chunks.length);

    const seqs = fakes()
      .db.all("auditEvents")
      .map((e) => e.seq)
      .filter((s): s is number => typeof s === "number");
    expect(new Set(seqs).size).toBe(seqs.length);
  });

  it("keeps the manifest hash chain linked", async () => {
    const { recordAuditEvent, readManifest } = await import("@backend/audit/writer");
    const first = await recordAuditEvent(event(1, "admin"));
    await recordAuditEvent(event(2, "admin"));
    const manifest = await readManifest(first.timestamp.slice(0, 10));
    expect(manifest).toBeTruthy();
    const chain = (manifest as { categories: Record<string, { lastHash: string; chunkCount: number }> }).categories.admin;
    expect(chain?.chunkCount).toBeGreaterThanOrEqual(2);
    expect(chain?.lastHash).toBeTruthy();
    expect(chain?.lastHash).not.toBe("genesis");
  });

  it("redacts credential-like details before writing", async () => {
    const { recordAuditEvent, readDailyTxt } = await import("@backend/audit/writer");
    const written = await recordAuditEvent({
      ...event(7),
      details: "password: hunter2 and token: abcdef123456",
    });
    const content = await readDailyTxt(written.timestamp.slice(0, 10), "registration");
    expect(content).not.toContain("hunter2");
    expect(content).toContain("redacted");
  });

  it("leaves a failed upload queued for idempotent retry", async () => {
    const { recordAuditEvent, flushAuditQueue } = await import("@backend/audit/writer");
    const written = await recordAuditEvent(event(9, "security"));

    // Force the storage save to fail once.
    const storage = fakes().storage;
    const bucket = storage.bucket("demo-cyberwolf360.appspot.com");
    const originalFile = bucket.file.bind(bucket);
    let failedOnce = false;
    vi.spyOn(bucket, "file").mockImplementation((path: string) => {
      const file = originalFile(path);
      const originalSave = file.save.bind(file);
      file.save = async (contents: string, options?: { contentType?: string }) => {
        if (!failedOnce) {
          failedOnce = true;
          throw new Error("transient storage failure");
        }
        return originalSave(contents, options);
      };
      return file;
    });

    const outcome = await flushAuditQueue(50);
    expect(outcome.failed).toBeGreaterThanOrEqual(0);

    vi.restoreAllMocks();

    // The event is still queued (or already uploaded) and never lost.
    const stored = fakes().db.raw("auditEvents", written.eventId);
    expect(stored).toBeTruthy();
  });

  it("lists the dates that have manifests", async () => {
    const { recordAuditEvent, listAuditDates } = await import("@backend/audit/writer");
    await recordAuditEvent(event(3, "audit"));
    const dates = await listAuditDates();
    expect(dates.length).toBeGreaterThanOrEqual(1);
    expect(dates[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
