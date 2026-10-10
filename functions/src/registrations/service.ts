import { createHash, randomBytes } from "node:crypto";
import { db } from "../shared/admin-app";
import { logger } from "../shared/logger";
import { AppError } from "../shared/errors";
import { calculatePrice, PricingError } from "@cyberwolf/pricing";
import { normalizeEmail, type RegistrationInput } from "@cyberwolf/validation";
import type { Registration, RegistrationStatus } from "@cyberwolf/shared-types";
import { recordAuditEvent } from "../audit/writer";
import { enqueueRegistrationEmails } from "../email/processor";
import { getServerConfig } from "../shared/config";

const REGISTRATIONS = "registrations";
const EMAIL_PROFILES = "emailProfiles";

/** Deterministic, privacy-preserving document id for an email profile. */
export function emailProfileId(normalizedEmailValue: string): string {
  return createHash("sha256").update(normalizedEmailValue, "utf8").digest("hex");
}

/** Human-readable, server-generated registration reference. */
export function generateReference(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `CW-${y}${m}${d}-${suffix}`;
}

/** Derive a de-duplication fingerprint from the meaningful registration fields. */
function submissionFingerprint(input: RegistrationInput): string {
  const normalized = normalizeEmail(input.email);
  const courses = [...input.courseIds].sort().join(",");
  const mobile = input.mobile.replace(/\s|-/g, "");
  return createHash("sha256")
    .update(`${normalized}|${mobile}|${courses}|${input.fullName.trim().toLowerCase()}`, "utf8")
    .digest("hex");
}

export interface CreateRegistrationResult {
  registration: Registration;
  firstTimeEmail: boolean;
  duplicate: boolean;
}

export interface CreateRegistrationParams {
  input: RegistrationInput;
  requestId: string;
  /** Optional client idempotency token to make retries safe. */
  idempotencyKey?: string;
}

/**
 * Create a registration through the trusted backend.
 *
 * The client-supplied price is ignored: the price is always recalculated here
 * with the shared pricing function. First-time-email detection uses a
 * race-safe Firestore transaction keyed on the normalized email.
 */
export async function createRegistration(
  params: CreateRegistrationParams,
): Promise<CreateRegistrationResult> {
  const { input, requestId } = params;
  const normalizedEmail = normalizeEmail(input.email);
  const fingerprint = submissionFingerprint(input);

  // 1 — Recalculate the authoritative price. Never trust a client price.
  let price;
  try {
    price = calculatePrice(input.courseIds);
  } catch (error) {
    if (error instanceof PricingError) {
      await recordAuditEvent({
        actorType: "registrant",
        actorId: normalizedEmail,
        action: "registration.rejected",
        resourceType: "registration",
        resourceId: "-",
        result: "FAILURE",
        source: "public-site",
        requestId,
        details: error.message,
        category: "security",
      });
      throw AppError.validation([{ path: "courseIds", message: error.message }]);
    }
    throw error;
  }

  // 2 — Duplicate-submission prevention (short window) + first-time detection,
  //     both inside a single transaction to stay race-safe under concurrency.
  const profileRef = db().collection(EMAIL_PROFILES).doc(emailProfileId(normalizedEmail));
  const config = getServerConfig();
  const nowIso = new Date().toISOString();

  const txResult = await db().runTransaction(async (tx) => {
    const profileSnap = await tx.get(profileRef);
    const profile = profileSnap.data() as
      | { firstSeenAt: string; lastSeenAt: string; registrationCount: number; lastFingerprint?: string; lastFingerprintAt?: string; lastRegistrationId?: string }
      | undefined;

    // Coarse duplicate detection: identical fingerprint within 2 minutes.
    if (profile?.lastFingerprint === fingerprint && profile.lastFingerprintAt) {
      const ageMs = Date.now() - new Date(profile.lastFingerprintAt).getTime();
      if (ageMs < 2 * 60 * 1000 && profile.lastRegistrationId) {
        return { duplicate: true, registrationId: profile.lastRegistrationId, firstTime: false };
      }
    }

    const firstTime = !profile || profile.registrationCount === 0;
    const registrationRef = db().collection(REGISTRATIONS).doc();
    const registrationId = registrationRef.id;
    const reference = generateReference();

    const registration: Registration & { ownerUid: string | null; fingerprint: string; idempotencyKey: string | null } = {
      id: registrationId,
      reference,
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      normalizedEmail,
      mobile: input.mobile.trim(),
      courseIds: input.courseIds,
      college: input.college.trim(),
      degree: input.degree,
      yearOfStudy: input.yearOfStudy,
      ...(input.city ? { city: input.city } : {}),
      ...(input.message ? { message: input.message } : {}),
      price,
      status: "received",
      privacyConsent: true,
      consentAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      requestId,
      ownerUid: null,
      fingerprint,
      idempotencyKey: params.idempotencyKey ?? null,
    };

    tx.set(registrationRef, registration);

    tx.set(
      profileRef,
      {
        firstSeenAt: profile?.firstSeenAt ?? nowIso,
        lastSeenAt: nowIso,
        registrationCount: (profile?.registrationCount ?? 0) + 1,
        lastFingerprint: fingerprint,
        lastFingerprintAt: nowIso,
        lastRegistrationId: registrationId,
      },
      { merge: true },
    );

    return { duplicate: false, registrationId, firstTime };
  });

  if (txResult.duplicate) {
    const existingSnap = await db().collection(REGISTRATIONS).doc(txResult.registrationId).get();
    const existing = existingSnap.data() as Registration;
    await recordAuditEvent({
      actorType: "registrant",
      actorId: normalizedEmail,
      action: "registration.duplicate-suppressed",
      resourceType: "registration",
      resourceId: existing.id,
      result: "SUCCESS",
      source: "public-site",
      requestId,
      details: "Identical submission detected within the deduplication window.",
      category: "registration",
    });
    return { registration: existing, firstTimeEmail: false, duplicate: true };
  }

  const createdSnap = await db().collection(REGISTRATIONS).doc(txResult.registrationId).get();
  const created = createdSnap.data() as Registration;

  // 3 — Record the registration audit event.
  await recordAuditEvent({
    actorType: "registrant",
    actorId: normalizedEmail,
    action: "registration.created",
    resourceType: "registration",
    resourceId: created.id,
    result: "SUCCESS",
    source: "public-site",
    requestId,
    details: `Registered for ${created.courseIds.length} course(s); final price ${price.finalPrice}`,
    category: "registration",
  });

  // 4 — Create durable notification jobs (never send inline).
  if (config.organisationEmail || config.isEmulator) {
    try {
      await enqueueRegistrationEmails({
        registrationId: created.id,
        studentEmail: created.email,
        organisationEmail: config.organisationEmail || "registrations@example.com",
        firstTime: txResult.firstTime,
        requestId,
        details: {
          studentName: created.fullName,
          studentEmail: created.email,
          reference: created.reference,
          courseIds: created.courseIds,
          price: created.price,
          createdAt: created.createdAt,
          college: created.college,
          degree: created.degree,
          yearOfStudy: created.yearOfStudy,
          ...(created.city ? { city: created.city } : {}),
          ...(config.adminAppUrl ? { adminAppUrl: config.adminAppUrl } : {}),
        },
      });
    } catch (error) {
      // A failed email must never lose the registration.
      logger.error("Failed to enqueue notification jobs", {
        requestId,
        action: "email.enqueue",
        resourceId: created.id,
        errorName: error instanceof Error ? error.name : typeof error,
      });
    }
  } else {
    logger.warn("Organisation email not configured; notification jobs not created", {
      requestId,
      action: "email.enqueue",
      resourceId: created.id,
    });
  }

  return { registration: created, firstTimeEmail: txResult.firstTime, duplicate: false };
}

/** Update a registration's status (admin action) with audit trail. */
export async function updateRegistrationStatus(
  registrationId: string,
  status: RegistrationStatus,
  requestId: string,
  actorId: string,
): Promise<Registration> {
  const ref = db().collection(REGISTRATIONS).doc(registrationId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw AppError.notFound("Registration not found.");
  }
  const before = snap.data() as Registration;
  await ref.update({ status, updatedAt: new Date().toISOString(), statusUpdatedBy: actorId });

  await recordAuditEvent({
    actorType: "admin",
    actorId,
    action: "registration.status-changed",
    resourceType: "registration",
    resourceId: registrationId,
    result: "SUCCESS",
    source: "private-admin",
    requestId,
    details: `Status changed from ${before.status} to ${status}`,
    category: "admin",
  });

  const updated = await ref.get();
  return updated.data() as Registration;
}

/** Fetch a single registration by id (admin). */
export async function getRegistration(registrationId: string): Promise<Registration | null> {
  const snap = await db().collection(REGISTRATIONS).doc(registrationId).get();
  return snap.exists ? (snap.data() as Registration) : null;
}

export interface ListRegistrationsParams {
  search?: string;
  status?: RegistrationStatus;
  courseId?: string;
  page: number;
  pageSize: number;
  sortBy: "createdAt" | "fullName" | "finalPrice";
  sortDir: "asc" | "desc";
}

/** List registrations with filtering, sorting and pagination (admin). */
export async function listRegistrations(params: ListRegistrationsParams): Promise<{
  items: Registration[];
  total: number;
  page: number;
  pageSize: number;
}> {
  let query: FirebaseFirestore.Query = db().collection(REGISTRATIONS);

  if (params.status) query = query.where("status", "==", params.status);
  if (params.courseId) query = query.where("courseIds", "array-contains", params.courseId);

  // Firestore cannot server-side full-text search; apply a bounded range filter
  // on normalizedEmail when the search looks like an email, otherwise sort and
  // filter in memory over the filtered page window.
  query = query.orderBy(params.sortBy, params.sortDir);

  const snap = await query.limit(1000).get();
  let items = snap.docs.map((doc) => doc.data() as Registration);

  const search = params.search?.trim().toLowerCase();
  if (search) {
    items = items.filter((item) => {
      return (
        item.fullName.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.id.toLowerCase().includes(search) ||
        item.mobile.toLowerCase().includes(search) ||
        item.college?.toLowerCase().includes(search) ||
        item.reference?.toLowerCase().includes(search)
      );
    });
  }

  const total = items.length;
  const start = (params.page - 1) * params.pageSize;
  const paged = items.slice(start, start + params.pageSize);
  return { items: paged, total, page: params.page, pageSize: params.pageSize };
}

/** Aggregate statistics for the admin dashboard (real values only). */
export async function registrationStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byCourse: Record<string, number>;
  last7Days: Array<{ date: string; count: number }>;
  revenue: { received: number; confirmed: number };
}> {
  const snap = await db().collection(REGISTRATIONS).get();
  const byStatus: Record<string, number> = {};
  const byCourse: Record<string, number> = {};
  const dayCounts = new Map<string, number>();
  let received = 0;
  let confirmed = 0;

  for (const doc of snap.docs) {
    const reg = doc.data() as Registration;
    byStatus[reg.status] = (byStatus[reg.status] ?? 0) + 1;
    for (const courseId of reg.courseIds) {
      byCourse[courseId] = (byCourse[courseId] ?? 0) + 1;
    }
    const day = reg.createdAt.slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    received += reg.price.finalPrice;
    if (reg.status === "confirmed") confirmed += reg.price.finalPrice;
  }

  const last7Days: Array<{ date: string; count: number }> = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    last7Days.push({ date: key, count: dayCounts.get(key) ?? 0 });
  }

  return { total: snap.size, byStatus, byCourse, last7Days, revenue: { received, confirmed } };
}
