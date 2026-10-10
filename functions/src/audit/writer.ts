import { db, storage, auditBucketName } from "../shared/admin-app";
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
 * Durable, concurrency-safe plain-text audit writer.
 *
 * Firebase Storage has no append-to-file operation, so we never download,
 * mutate and re-upload a shared daily file. Instead:
 *
 *   1. Every event is durably queued in the `auditEvents` collection.
 *   2. A transaction assigns a per-(date, category) sequence number from a
 *      protected manifest, so concurrent writers never collide.
 *   3. An immutable, uniquely named `.txt` chunk is uploaded to Storage.
 *   4. The manifest records the chunk count and a hash-chain link.
 *   5. Failed uploads stay queued and are retried idempotently (the chunk path
 *      is derived from the sequence number, so re-uploads are harmless).
 *
 * The admin viewer reads a day's chunks and concatenates them in sequence
 * order to reconstruct the human-readable daily TXT file.
 */

const EVENTS = "auditEvents";
const MANIFESTS = "auditManifests";

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

  // Step 2 — upload the immutable chunk (deterministic path => idempotent).
  const bucket = storage().bucket(auditBucketName());
  const file = bucket.file(path);
  await file.save(block, {
    resumable: false,
    contentType: "text/plain; charset=utf-8",
    metadata: { cacheControl: "private, no-store", metadata: { immutable: "true" } },
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
  const snap = await db()
    .collection(EVENTS)
    .where("chunkUploaded", "==", false)
    .orderBy("timestamp", "asc")
    .limit(limit)
    .get();

  let processed = 0;
  let failed = 0;
  for (const doc of snap.docs) {
    const data = doc.data() as QueuedEvent;
    try {
      await flushEvent(data);
      processed += 1;
    } catch (error) {
      failed += 1;
      logger.error("Audit chunk upload failed; will retry", {
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
  const bucket = storage().bucket(auditBucketName());
  const [year, month, day] = date.split("-");
  const prefix = `audit-logs/${year}/${month}/${day}/`;
  const [files] = await bucket.getFiles({ prefix });
  const matching = files
    .filter((f) => f.name.startsWith(prefix) && f.name.includes(`${category}-${date}-`))
    .sort((a, b) => a.name.localeCompare(b.name));

  const parts: string[] = [];
  for (const file of matching) {
    const [contents] = await file.download();
    parts.push(contents.toString("utf8"));
  }
  return parts.join("");
}

/** List the dates that have audit chunks, newest first. */
export async function listAuditDates(limit = 90): Promise<string[]> {
  const snap = await db().collection(MANIFESTS).orderBy("date", "desc").limit(limit).get();
  return snap.docs.map((doc) => doc.id);
}

/** Read a manifest for admin metadata (counts, hash-chain tip). */
export async function readManifest(date: string): Promise<AuditManifest | null> {
  const snap = await db().collection(MANIFESTS).doc(date).get();
  return snap.exists ? (snap.data() as AuditManifest) : null;
}
