import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Audit writer integration tests.
 *
 * The Firestore boundary is faked, but the real durable outbox,
 * transaction-based sequence allocation, immutable chunk persistence and
 * hash-chain code runs unchanged. Audit chunks are stored in Firestore
 * (`auditChunks`) — no Cloud Storage dependency.
 */

vi.mock("@backend/shared/admin-app", async () => {
  const { FakeFirestore } = await import("../fakes/firestore");
  const db = new FakeFirestore();
  (globalThis as Record<string, unknown>).__fwAuditFakes = { db };
  return {
    db: () => db,
    getAdminApp: () => ({ options: { projectId: "demo-cyberwolf360" } }),
  };
});

type Fakes = {
  db: import("../fakes/firestore").FakeFirestore;
};
const fakes = (): Fakes => (globalThis as Record<string, unknown>).__fwAuditFakes as Fakes;

beforeEach(() => {
  // The mock factory is lazy; the fakes only exist after the first import.
  const holder = (globalThis as Record<string, unknown>).__fwAuditFakes as
    | { db: { reset(): void } }
    | undefined;
  holder?.db.reset();
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
  it("writes an immutable .txt chunk into the dated Firestore path", async () => {
    const { recordAuditEvent, readDailyTxt } = await import("@backend/audit/writer");
    const written = await recordAuditEvent(event(1));
    const date = written.timestamp.slice(0, 10);

    const chunks = fakes().db.all("auditChunks");
    const prefix = `audit-logs/${date.replace(/-/g, "/")}/`;
    expect(chunks.some((c) => String(c.path).startsWith(prefix))).toBe(true);

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
    const chunks = fakes().db.all("auditChunks").filter((c) => String(c.path).startsWith(prefix));
    // Every event produced exactly one chunk, and every chunk path is unique.
    expect(chunks.length).toBe(25);
    const uniqueChunks = new Set(chunks.map((c) => c.path));
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

  it("leaves a failed chunk write queued for idempotent retry", async () => {
    const { recordAuditEvent, flushAuditQueue } = await import("@backend/audit/writer");
    const db = fakes().db;

    // Force the first auditChunks write to fail, simulating a transient error.
    const originalCollection = db.collection.bind(db);
    let failedOnce = false;
    vi.spyOn(db, "collection").mockImplementation((name: string) => {
      const col = originalCollection(name);
      if (name !== "auditChunks") return col;
      const originalDoc = col.doc.bind(col);
      col.doc = (id?: string) => {
        const ref = originalDoc(id);
        const originalSet = ref.set.bind(ref);
        ref.set = async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
          if (!failedOnce) {
            failedOnce = true;
            throw new Error("transient firestore failure");
          }
          return originalSet(data, options);
        };
        return ref;
      };
      return col;
    });

    const written = await recordAuditEvent(event(9, "security"));
    // The immediate flush failed, so the event must still be queued, not lost.
    expect(fakes().db.raw("auditEvents", written.eventId)).toBeTruthy();

    // A later flush retries idempotently and succeeds.
    const outcome = await flushAuditQueue(50);
    expect(outcome.failed).toBe(0);
    vi.restoreAllMocks();

    const stored = fakes().db.raw("auditEvents", written.eventId) as { chunkUploaded?: boolean } | undefined;
    expect(stored?.chunkUploaded).toBe(true);
  });

  it("lists the dates that have manifests", async () => {
    const { recordAuditEvent, listAuditDates } = await import("@backend/audit/writer");
    await recordAuditEvent(event(3, "audit"));
    const dates = await listAuditDates();
    expect(dates.length).toBeGreaterThanOrEqual(1);
    expect(dates[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
