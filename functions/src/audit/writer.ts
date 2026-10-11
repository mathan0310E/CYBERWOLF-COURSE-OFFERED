import { db } from "../shared/admin-app";
import { logger } from "../shared/logger";
import { AUDIT_CATEGORIES, type AuditCategory, type AuditEvent } from "@cyberwolf/shared-types";
import {
  buildAuditEvent,
  formatAuditEvent,
  hashBlock,
  utcDateParts,
  type AuditEventInput,
} from "./format";

/**
 * Durable, concurrency-safe plain-text audit writer (Firestore-only).
 *
 * Firestore has no append-to-file operation, so we never download, mutate and
 * re-upload a shared daily file. Instead:
 *
 *   1. Every event is durably queued in the `auditEvents` collection.
 *   2. A transaction assigns a per-(date, category) sequence number from a
 *      protected manifest, so concurrent writers never collide.
 *   3. An immutable, uniquely named `.txt` chunk is persisted as an `auditChunks`
 *      document (text/plain content), mirroring the Storage layout:
 *      `audit-logs/YYYY/MM/DD/<category>-<date>-<seq>.txt`.
 *   4. The manifest records the chunk count and a hash-chain link.
 *   5. Failed writes stay queued and are retried idempotently (the chunk id is
 *      derived from the sequence number, so re-writes are harmless).
 *
 * The admin viewer reads a day's chunks and concatenates them in sequence
 * order to reconstruct the human-readable daily TXT file.
 *
 * NOTE: This deployment intentionally persists the plain-text audit artefacts in
 * Cloud Firestore only (no Cloud Storage dependency). The chunk documents are
 * server-only: Firestore rules deny all client access to `auditChunks`,
 * `auditEvents` and `auditManifests`.
 */

const EVENTS = "auditEvents";
const MANIFESTS = "auditManifests";
const CHUNKS = "auditChunks";

interface CategoryManifest {
  lastSeq: number;
  chunkCount: number;
  lastHash: string;
}

interface AuditManifest {
  date: string;
  categories: Partial<Record<AuditCategory, CategoryManifest>>;
  updatedAt: string;
}

/** Deterministic, immutable chunk path for a sequenced event. */
export function chunkPath(date: string, category: AuditCategory, seq: number): string {
  const [year, month, day] = date.split("-");
  const padded = String(seq).padStart(6, "0");
  return `audit-logs/${year}/${month}/${day}/${category}-${date}-${padded}.txt`;
}

/**
 * Queue an audit event durably and best-effort flush it to a TXT chunk.
 * Recording never throws into the caller's happy path: an audit failure is
 * logged and surfaced through the manifest/queue rather than breaking the
 * user-facing operation.
 */
export async function recordAuditEvent(input: AuditEventInput): Promise<AuditEvent> {
  const event = buildAuditEvent(input);
  const { isoDate } = utcDateParts(new Date(event.timestamp));
  try {
    await db()
      .collection(EVENTS)
      .doc(event.eventId)
      .set({
        ...event,
        date: isoDate,
        seq: null,
        chunkUploaded: false,
        chunkPath: null,
        chunkHash: null,
        createdAt: event.timestamp,
      });
    // Best-effort immediate flush; a scheduled job also reconciles the queue.
    await flushAuditQueue(25).catch((error) => {
      logger.warn("Immediate audit flush failed; event remains queued", {
        requestId: event.requestId,
        action: "audit.flush",
        errorName: error instanceof Error ? error.name : typeof error,
      });
    });
  } catch (error) {
    logger.error("Failed to persist audit event", {
      requestId: event.requestId,
      action: "audit.record",
      errorName: error instanceof Error ? error.name : typeof error,
    });
  }
  return event;
}

interface QueuedEvent extends AuditEvent {
  date: string;
}

/**
 * Assign a sequence number and upload the immutable TXT chunk for a single
 * event. Idempotent: safe to call repeatedly for the same event.
 */
async function flushEvent(queued: QueuedEvent): Promise<boolean> {
  const category: AuditCategory = AUDIT_CATEGORIES.includes(queued.category)
    ? queued.category
    : "audit";

  const eventRef = db().collection(EVENTS).doc(queued.eventId);
  const manifestRef = db().collection(MANIFESTS).doc(queued.date);

  // Step 1 — atomically reserve a sequence number (if not already reserved).
  const seq = await db().runTransaction(async (tx) => {
    const snap = await tx.get(eventRef);
    const data = snap.data() as { seq?: number | null } | undefined;
    if (data?.seq != null) return data.seq as number;

    const manifestSnap = await tx.get(manifestRef);
    const manifest = (manifestSnap.data() as AuditManifest | undefined) ?? {
      date: queued.date,
      categories: {},
      updatedAt: new Date().toISOString(),
    };
    const current: CategoryManifest =
      manifest.categories[category] ?? { lastSeq: 0, chunkCount: 0, lastHash: "genesis" };
    const nextSeq = current.lastSeq + 1;
    manifest.categories[category] = { ...current, lastSeq: nextSeq };
    manifest.updatedAt = new Date().toISOString();
    tx.set(manifestRef, manifest);
    tx.update(eventRef, { seq: nextSeq });
    return nextSeq;
  });

  const path = chunkPath(queued.date, category, seq);
  const block = formatAuditEvent({ ...queued, category });

  // Step 2 — persist the immutable chunk document (deterministic id => idempotent).
  // The document id encodes the Storage-style path with `/` escaped, and the
  // plain-text block is stored verbatim in `content`.
  await db()
    .collection(CHUNKS)
    .doc(encodeURIComponent(path))
    .set({
      path,
      date: queued.date,
      category,
      seq,
      content: block,
      contentType: "text/plain; charset=utf-8",
      immutable: true,
      eventId: queued.eventId,
      createdAt: new Date().toISOString(),
    });

  // Step 3 — finalise the event and extend the manifest hash chain.
  const prevHash = await db().runTransaction(async (tx) => {
    const manifestSnap = await tx.get(manifestRef);
    const manifest = manifestSnap.data() as AuditManifest;
    const current = manifest.categories[category]!;
    const linkHash = hashBlock(`${current.lastHash}:${block}`);
    manifest.categories[category] = {
      lastSeq: current.lastSeq,
      chunkCount: current.chunkCount + 1,
      lastHash: linkHash,
    };
    manifest.updatedAt = new Date().toISOString();
    tx.set(manifestRef, manifest);
    tx.update(eventRef, {
      chunkUploaded: true,
      chunkPath: path,
      chunkHash: hashBlock(block),
    });
    return current.lastHash;
  });

  logger.debug("Audit chunk written", {
    action: "audit.chunk",
    resourceId: queued.eventId,
    path,
    prevHash,
  });
  return true;
}

/**
 * Reconcile the durable queue: flush any events that are not yet uploaded.
 * Bounded by `limit` so a scheduled invocation stays fast.
 */
export async function flushAuditQueue(limit = 100): Promise<{ processed: number; failed: number }> {
  // Single-field filter only (automatic index). Ordering is applied in memory so
  // no composite index is required.
  const snap = await db()
    .collection(EVENTS)
    .where("chunkUploaded", "==", false)
    .limit(limit)
    .get();

  const queued = snap.docs
    .map((doc) => doc.data() as QueuedEvent)
    .sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));

  let processed = 0;
  let failed = 0;
  for (const data of queued) {
    try {
      await flushEvent(data);
      processed += 1;
    } catch (error) {
      failed += 1;
      logger.error("Audit chunk write failed; will retry", {
        requestId: data.requestId,
        action: "audit.flush",
        resourceId: data.eventId,
        errorName: error instanceof Error ? error.name : typeof error,
      });
    }
  }
  return { processed, failed };
}

/** Reconstruct the daily TXT content for one category by concatenating chunks. */
export async function readDailyTxt(date: string, category: AuditCategory): Promise<string> {
  const prefix = `audit-logs/${date.split("-").join("/")}/`;
  // Single-field filter only (automatic index); category is matched in memory.
  const snap = await db().collection(CHUNKS).where("date", "==", date).get();
  const chunks = snap.docs
    .map((doc) => doc.data() as { path: string; category: string; seq: number; content: string })
    .filter((c) => c.category === category && c.path.startsWith(prefix) && c.path.includes(`${category}-${date}-`))
    .sort((a, b) => a.seq - b.seq);

  return chunks.map((c) => c.content).join("");
}

/** List the dates that have audit chunks, newest first. */
export async function listAuditDates(limit = 90): Promise<string[]> {
  // Single-field orderBy (automatic index). No composite index required.
  const snap = await db().collection(MANIFESTS).orderBy("date", "desc").limit(limit).get();
  return snap.docs.map((doc) => doc.id);
}

/** Read a manifest for admin metadata (counts, hash-chain tip). */
export async function readManifest(date: string): Promise<AuditManifest | null> {
  const snap = await db().collection(MANIFESTS).doc(date).get();
  return snap.exists ? (snap.data() as AuditManifest) : null;
}
