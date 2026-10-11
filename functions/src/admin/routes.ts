import { Router, type Request, type Response } from "express";
import {
  registrationQuerySchema,
  auditQuerySchema,
  registrationStatusSchema,
  emailRetrySchema,
  exportRequestSchema,
} from "@cyberwolf/validation";
import { asyncHandler } from "../shared/http";
import { authenticate, requireAdmin, requireRecentAuth } from "../security/auth";
import { adminActionLimiter } from "../security/middleware";
import { AppError } from "../shared/errors";
import {
  getRegistration,
  listRegistrations,
  registrationStats,
  updateRegistrationStatus,
} from "../registrations/service";
import { listAuditDates, readDailyTxt, readManifest, recordAuditEvent } from "../audit/writer";
import { parseAuditEvents } from "../audit/format";
import { processEmailJobs, retryEmailJob } from "../email/processor";
import { db } from "../shared/admin-app";
import type { EmailJob } from "@cyberwolf/shared-types";

export const adminRouter = Router();

// Every route below requires a verified administrator. Authorization is
// enforced independently on each endpoint (defence in depth).
adminRouter.use(authenticate, requireAdmin);

/** GET /api/admin/session — confirms the caller is an authorised admin. */
adminRouter.get("/session", (req: Request, res: Response) => {
  res.json({ uid: req.admin?.uid ?? null, email: req.admin?.email ?? null, admin: true });
});

/** GET /api/admin/stats — real dashboard statistics. */
adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    res.json(await registrationStats());
  }),
);

/** GET /api/admin/registrations — filtered, sorted, paginated list. */
adminRouter.get(
  "/registrations",
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = registrationQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw AppError.validation(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      );
    }
    res.json(await listRegistrations(parsed.data));
  }),
);

/** GET /api/admin/registrations/:id — single registration detail. */
adminRouter.get(
  "/registrations/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const registration = await getRegistration(id);
    if (!registration) throw AppError.notFound("Registration not found.");

    await recordAuditEvent({
      actorType: "admin",
      actorId: req.admin!.uid,
      action: "registration.viewed",
      resourceType: "registration",
      resourceId: id,
      result: "SUCCESS",
      source: "private-admin",
      requestId: req.requestId!,
      details: "Registration detail viewed.",
      category: "admin",
    });
    res.json(registration);
  }),
);

/** PATCH /api/admin/registrations/:id/status — status change (audited). */
adminRouter.patch(
  "/registrations/:id/status",
  adminActionLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = registrationStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.validation(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      );
    }
    const updated = await updateRegistrationStatus(
      String(req.params.id),
      parsed.data.status,
      req.requestId!,
      req.admin!.uid,
    );
    res.json(updated);
  }),
);

/** GET /api/admin/audit/dates — dates that have audit files. */
adminRouter.get(
  "/audit/dates",
  asyncHandler(async (req: Request, res: Response) => {
    await recordAuditEvent({
      actorType: "admin",
      actorId: req.admin!.uid,
      action: "audit.dates-listed",
      resourceType: "auditLog",
      resourceId: "-",
      result: "SUCCESS",
      source: "private-admin",
      requestId: req.requestId!,
      details: "Audit date index requested.",
      category: "audit",
    });
    res.json({ dates: await listAuditDates() });
  }),
);

/**
 * GET /api/admin/audit — filtered audit events for a day plus the raw TXT.
 * Returns structured events (for the table) and the original TXT content.
 */
adminRouter.get(
  "/audit",
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = auditQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw AppError.validation(
        parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      );
    }
    const { date, category, actorType, result, search, page, pageSize } = parsed.data;
    const day = date ?? new Date().toISOString().slice(0, 10);
    const cat = category ?? "audit";

    const raw = await readDailyTxt(day, cat);
    let events = parseAuditEvents(raw);
    if (actorType) events = events.filter((e) => e.actorType === actorType);
    if (result) events = events.filter((e) => e.result === result);
    if (search) {
      const needle = search.toLowerCase();
      events = events.filter(
        (e) =>
          e.action.toLowerCase().includes(needle) ||
          e.resourceId.toLowerCase().includes(needle) ||
          e.details.toLowerCase().includes(needle),
      );
    }

    const total = events.length;
    const start = (page - 1) * pageSize;
    const paged = events.slice(start, start + pageSize);
    const manifest = await readManifest(day);

    await recordAuditEvent({
      actorType: "admin",
      actorId: req.admin!.uid,
      action: "audit.viewed",
      resourceType: "auditLog",
      resourceId: `${day}/${cat}`,
      result: "SUCCESS",
      source: "private-admin",
      requestId: req.requestId!,
      details: "Audit log viewed.",
      category: "audit",
    });

    res.json({
      date: day,
      category: cat,
      total,
      page,
      pageSize,
      events: paged,
      raw,
      manifest,
      writeFailures: manifest ? undefined : "no-manifest",
    });
  }),
);

/** GET /api/admin/audit/download — download the raw daily TXT. */
adminRouter.get(
  "/audit/download",
  adminActionLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = auditQuerySchema.safeParse(req.query);
    if (!parsed.success) throw AppError.badRequest("Invalid download parameters.");
    const day = parsed.data.date ?? new Date().toISOString().slice(0, 10);
    const cat = parsed.data.category ?? "audit";
    const raw = await readDailyTxt(day, cat);

    await recordAuditEvent({
      actorType: "admin",
      actorId: req.admin!.uid,
      action: "audit.downloaded",
      resourceType: "auditLog",
      resourceId: `${day}/${cat}`,
      result: "SUCCESS",
      source: "private-admin",
      requestId: req.requestId!,
      details: "Audit TXT file downloaded.",
      category: "audit",
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${cat}-${day}.txt"`,
    );
    res.setHeader("Cache-Control", "no-store, private");
    res.send(raw);
  }),
);

/** GET /api/admin/emails — notification jobs for the Email Activity view. */
adminRouter.get(
  "/emails",
  asyncHandler(async (req: Request, res: Response) => {
    const snap = await db().collection("notificationJobs").limit(500).get();
    const docs = snap.docs
      .slice()
      .sort((a, b) => {
        const av = String((a.data() as EmailJob).createdAt ?? "");
        const bv = String((b.data() as EmailJob).createdAt ?? "");
        return av < bv ? 1 : av > bv ? -1 : 0;
      });
    const jobs = docs.map((doc) => {
      // Project only the fields the admin UI needs. The private recipient and
      // the template details (which contain the student's email) are never
      // returned — only the masked recipient is exposed.
      const data = doc.data() as EmailJob;
      const safe: EmailJob = {
        id: data.id,
        registrationId: data.registrationId,
        recipientType: data.recipientType,
        maskedRecipient: data.maskedRecipient,
        template: data.template,
        status: data.status,
        attemptCount: data.attemptCount,
        idempotencyKey: data.idempotencyKey,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...(data.lastAttemptAt ? { lastAttemptAt: data.lastAttemptAt } : {}),
        ...(data.lastErrorCategory ? { lastErrorCategory: data.lastErrorCategory } : {}),
      };
      return safe;
    });
    res.json({ jobs });
  }),
);

/** POST /api/admin/emails/retry — manual retry reusing the original job. */
adminRouter.post(
  "/emails/retry",
  adminActionLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = emailRetrySchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest("A valid jobId is required.");
    const job = await retryEmailJob(parsed.data.jobId, req.requestId!);
    res.json(job);
  }),
);

/** POST /api/admin/emails/process — flush the queue (also runs on a schedule). */
adminRouter.post(
  "/emails/process",
  adminActionLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const outcome = await processEmailJobs();
    await recordAuditEvent({
      actorType: "admin",
      actorId: req.admin!.uid,
      action: "email.queue-processed",
      resourceType: "notificationJob",
      resourceId: "-",
      result: "SUCCESS",
      source: "private-admin",
      requestId: req.requestId!,
      details: `Processed ${outcome.processed}; sent ${outcome.sent}; failed ${outcome.failed}`,
      category: "email",
    });
    res.json(outcome);
  }),
);

/**
 * POST /api/admin/export — higher-risk export. Requires recent reauthentication
 * (fresh ID token). Produces a TXT artefact and records the export.
 */
adminRouter.post(
  "/export",
  adminActionLimiter,
  requireRecentAuth(300),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = exportRequestSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest("Invalid export request.");

    let body = "";
    if (parsed.data.kind === "audit") {
      const day = parsed.data.date ?? new Date().toISOString().slice(0, 10);
      body = await readDailyTxt(day, "audit");
    } else {
      const snap = await db().collection("registrations").limit(5000).get();
      const regDocs = snap.docs
        .slice()
        .sort((a, b) => {
          const av = String((a.data() as { createdAt: string }).createdAt ?? "");
          const bv = String((b.data() as { createdAt: string }).createdAt ?? "");
          return av < bv ? 1 : av > bv ? -1 : 0;
        });
      const header =
        "REFERENCE\tCREATED_AT\tNAME\tEMAIL\tMOBILE\tCOURSES\tFINAL_PRICE\tSTATUS\n";
      const lines = regDocs.map((doc) => {
        const r = doc.data() as {
          reference: string;
          createdAt: string;
          fullName: string;
          email: string;
          mobile: string;
          courseIds: string[];
          price: { finalPrice: number };
          status: string;
        };
        return [
          r.reference,
          r.createdAt,
          r.fullName,
          r.email,
          r.mobile,
          r.courseIds.join("|"),
          String(r.price.finalPrice),
          r.status,
        ].join("\t");
      });
      body = header + lines.join("\n");
    }

    await recordAuditEvent({
      actorType: "admin",
      actorId: req.admin!.uid,
      action: "data.exported",
      resourceType: parsed.data.kind,
      resourceId: parsed.data.date ?? "all",
      result: "SUCCESS",
      source: "private-admin",
      requestId: req.requestId!,
      details: `Export of ${parsed.data.kind} data.`,
      category: "security",
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="cyberwolf-export-${parsed.data.kind}.txt"`);
    res.setHeader("Cache-Control", "no-store, private");
    res.send(body);
  }),
);
