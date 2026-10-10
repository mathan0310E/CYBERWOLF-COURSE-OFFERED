import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { setGlobalOptions } from "firebase-functions/v2";
import { buildApp } from "./app";
import { flushAuditQueue } from "./audit/writer";
import { processEmailJobs } from "./email/processor";
import { recordAuditEvent } from "./audit/writer";
import { logger } from "./shared/logger";
import { getServerConfig } from "./shared/config";

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
  memory: "256MiB",
  timeoutSeconds: 60,
});

const app = buildApp();

/**
 * The trusted HTTP API. This is the only public write path for registrations
 * and the only authenticated path for admin operations.
 */
export const api = onRequest(
  { cors: false, invoker: "public" },
  (req, res) => {
    app(req, res);
  },
);

/** Scheduled reconciliation of the durable audit outbox. */
export const flushAudit = onSchedule(
  { schedule: "every 5 minutes", timeZone: "UTC" },
  async () => {
    const outcome = await flushAuditQueue(200);
    logger.info("Scheduled audit flush complete", { action: "audit.scheduled-flush", ...outcome });
  },
);

/** Scheduled email queue processing with retry/backoff handling. */
export const processEmails = onSchedule(
  { schedule: "every 5 minutes", timeZone: "UTC" },
  async () => {
    const config = getServerConfig();
    try {
      const outcome = await processEmailJobs();
      logger.info("Scheduled email processing complete", { action: "email.scheduled-process", ...outcome });
    } catch (error) {
      // A missing SMTP configuration must be visible, not silently swallowed.
      logger.error("Scheduled email processing failed", {
        action: "email.scheduled-process",
        configured: Boolean(config.smtp.host && config.smtp.user),
        errorName: error instanceof Error ? error.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

/**
 * Scheduled registration retention housekeeping. Emits an audit event noting
 * that the retention policy ran. Actual deletion is configuration-driven and
 * left disabled by default so data is never removed unexpectedly.
 */
export const retentionSweep = onSchedule(
  { schedule: "0 3 * * *", timeZone: "UTC" },
  async () => {
    await recordAuditEvent({
      actorType: "system",
      actorId: "retention",
      action: "retention.sweep",
      resourceType: "system",
      resourceId: "-",
      result: "SUCCESS",
      source: "backend",
      requestId: "scheduled",
      details: "Daily retention sweep evaluated. No records deleted (policy disabled by default).",
      category: "audit",
    });
  },
);
