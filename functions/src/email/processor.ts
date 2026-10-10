import { db } from "../shared/admin-app";
import { logger } from "../shared/logger";
import { recordAuditEvent } from "../audit/writer";
import { getMailTransport, categoriseSmtpError, mailFromAddress } from "./transport";
import { renderTemplate, type TemplateData, type TemplateName, TEMPLATE_NAMES } from "./templates";
import type { EmailJob, EmailRecipientType } from "@cyberwolf/shared-types";

/**
 * Durable email workflow.
 *
 *  1. The registration path creates durable `notificationJobs` documents and
 *     does NOT send inline (a mail failure must never lose a registration).
 *  2. `processEmailJobs` claims queued jobs, sends through Nodemailer, and
 *     records the outcome.
 *  3. Transient failures are retried with bounded exponential backoff.
 *  4. An idempotency key prevents duplicate sends across retries.
 *
 * The transport is injectable so tests can supply a mock SMTP transport.
 */

const JOBS = "notificationJobs";

const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 60_000; // 1 minute, doubling: 1, 2, 4, 8 min

export interface MailSender {
  sendMail(message: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
    headers: Record<string, string>;
  }): Promise<{ accepted: string[]; response?: string; messageId?: string }>;
}

/** Mask an email address for display in the admin UI. */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(1, local.length - visible.length))}${domain}`;
}

export interface JobTemplateDetails {
  studentName: string;
  studentEmail: string;
  reference: string;
  courseIds: TemplateData["courseIds"];
  price: TemplateData["price"];
  createdAt: string;
  adminAppUrl?: string;
}

function templateFor(recipientType: EmailRecipientType, firstTime: boolean): TemplateName {
  if (recipientType === "organisation") {
    return firstTime ? TEMPLATE_NAMES.organisationFirst : TEMPLATE_NAMES.organisationRepeat;
  }
  return firstTime ? TEMPLATE_NAMES.studentFirst : TEMPLATE_NAMES.studentRepeat;
}

/**
 * Create durable notification jobs for a registration. Idempotent per
 * (registrationId, recipientType): an existing job is reused, never duplicated.
 */
export async function enqueueRegistrationEmails(params: {
  registrationId: string;
  studentEmail: string;
  organisationEmail: string;
  firstTime: boolean;
  details: JobTemplateDetails;
  requestId: string;
}): Promise<EmailJob[]> {
  const now = new Date().toISOString();
  const targets: Array<{ type: EmailRecipientType; recipient: string }> = [
    { type: "organisation", recipient: params.organisationEmail },
    { type: "student", recipient: params.studentEmail },
  ];

  const created: EmailJob[] = [];
  for (const target of targets) {
    const jobId = `${params.registrationId}__${target.type}`;
    const idempotencyKey = `${params.registrationId}:${target.type}:${params.firstTime ? "first" : "repeat"}`;
    const ref = db().collection(JOBS).doc(jobId);
    const existing = await ref.get();
    if (existing.exists) {
      created.push(existing.data() as EmailJob);
      continue;
    }
    const job: EmailJob = {
      id: jobId,
      registrationId: params.registrationId,
      recipientType: target.type,
      maskedRecipient: maskEmail(target.recipient),
      template: templateFor(target.type, params.firstTime),
      status: "queued",
      attemptCount: 0,
      idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };
    // Store the real recipient privately; only the masked form is shown in UI.
    await ref.set({ ...job, recipient: target.recipient, details: params.details });
    created.push(job);

    await recordAuditEvent({
      actorType: "system",
      actorId: "email-queue",
      action: "email.queued",
      resourceType: "notificationJob",
      resourceId: jobId,
      result: "SUCCESS",
      source: "backend",
      requestId: params.requestId,
      details: `Notification queued for ${target.type}`,
      category: "email",
    });
  }
  return created;
}

interface StoredJob extends EmailJob {
  recipient: string;
  details: JobTemplateDetails;
}

function backoffMs(attempt: number): number {
  return BASE_BACKOFF_MS * 2 ** Math.max(0, attempt - 1);
}

/**
 * Claim and process queued/failed jobs that are due. Idempotent: the
 * deterministic job id and idempotency key mean a retry never creates a second
 * notification, and a job already marked `accepted` is skipped.
 */
export async function processEmailJobs(
  sender?: MailSender,
  limit = 25,
): Promise<{ processed: number; sent: number; failed: number }> {
  const transport = sender ?? (getMailTransport() as unknown as MailSender);
  const snap = await db()
    .collection(JOBS)
    .where("status", "in", ["queued", "failed"])
    .orderBy("createdAt", "asc")
    .limit(limit)
    .get();

  let processed = 0;
  let sent = 0;
  let failed = 0;
  const nowMs = Date.now();

  for (const doc of snap.docs) {
    const job = doc.data() as StoredJob;
    processed += 1;

    // Respect backoff for previously failed jobs.
    if (job.status === "failed" && job.lastAttemptAt) {
      const due = new Date(job.lastAttemptAt).getTime() + backoffMs(job.attemptCount);
      if (nowMs < due) continue;
    }
    // Bounded retries.
    if (job.attemptCount >= MAX_ATTEMPTS) continue;

    const attempt = job.attemptCount + 1;
    const attemptAt = new Date().toISOString();
    await doc.ref.update({ status: "processing", attemptCount: attempt, lastAttemptAt: attemptAt, updatedAt: attemptAt });

    const rendered = renderTemplate(job.template as TemplateName, job.details);

    try {
      const info = await transport.sendMail({
        from: mailFromAddress(),
        to: job.recipient,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
        headers: { "X-CyberWolf-Job": job.id, "X-Idempotency-Key": job.idempotencyKey },
      });
      // SMTP acceptance is NOT proof of delivery — record it as `accepted`.
      await doc.ref.update({
        status: "accepted",
        lastErrorCategory: null,
        smtpResponse: (info.response ?? "").slice(0, 200),
        updatedAt: new Date().toISOString(),
      });
      sent += 1;

      await recordAuditEvent({
        actorType: "system",
        actorId: "email-processor",
        action: "email.accepted",
        resourceType: "notificationJob",
        resourceId: job.id,
        result: "SUCCESS",
        source: "backend",
        requestId: job.registrationId,
        details: `SMTP accepted ${job.template}`,
        category: "email",
      });
    } catch (error) {
      const category = categoriseSmtpError(error);
      const isFinal = attempt >= MAX_ATTEMPTS;
      await doc.ref.update({
        status: "failed",
        lastErrorCategory: category,
        updatedAt: new Date().toISOString(),
      });
      failed += 1;
      logger.warn("Email send failed", {
        action: "email.send",
        resourceId: job.id,
        attempt,
        category,
        final: isFinal,
      });

      await recordAuditEvent({
        actorType: "system",
        actorId: "email-processor",
        action: isFinal ? "email.failed" : "email.retry-scheduled",
        resourceType: "notificationJob",
        resourceId: job.id,
        result: "FAILURE",
        source: "backend",
        requestId: job.registrationId,
        details: `Attempt ${attempt} failed (${category})`,
        category: "email",
      });
    }
  }
  return { processed, sent, failed };
}

/** Manually retry a single job (admin action). Reuses the original job. */
export async function retryEmailJob(
  jobId: string,
  requestId: string,
  sender?: MailSender,
): Promise<EmailJob> {
  const ref = db().collection(JOBS).doc(jobId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error(`Notification job ${jobId} not found`);
  }
  const job = snap.data() as StoredJob;
  await ref.update({ status: "queued", attemptCount: 0, updatedAt: new Date().toISOString() });

  await recordAuditEvent({
    actorType: "admin",
    actorId: "admin",
    action: "email.manual-retry",
    resourceType: "notificationJob",
    resourceId: jobId,
    result: "SUCCESS",
    source: "private-admin",
    requestId,
    details: `Manual retry requested for ${job.template}`,
    category: "email",
  });

  await processEmailJobs(sender, 5).catch(() => undefined);
  const updated = await ref.get();
  return updated.data() as EmailJob;
}
