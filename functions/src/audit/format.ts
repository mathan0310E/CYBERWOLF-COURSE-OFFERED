import { randomUUID, createHash } from "node:crypto";
import type {
  AuditActorType,
  AuditCategory,
  AuditEvent,
  AuditResult,
  AuditSource,
} from "@cyberwolf/shared-types";

const RULE = "============================================================";

export interface AuditEventInput {
  actorType: AuditActorType;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  result: AuditResult;
  source: AuditSource;
  requestId: string;
  details: string;
  category: AuditCategory;
  timestamp?: string;
  eventId?: string;
}

/** Fields that must never appear in an audit `Details` line. */
const FORBIDDEN_DETAIL_PATTERNS: RegExp[] = [
  /pass(word)?\s*[:=]/i,
  /bearer\s+[A-Za-z0-9._-]{10,}/i,
  /token\s*[:=]/i,
  /secret\s*[:=]/i,
  /api[-_]?key\s*[:=]/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
];

/**
 * Sanitise a free-text detail string: collapse newlines (so the fixed-format
 * block cannot be forged), bound the length, and refuse to log anything that
 * looks like a credential.
 */
export function sanitizeDetails(details: string): string {
  const flattened = details.replace(/[\r\n]+/g, " ").trim();
  if (FORBIDDEN_DETAIL_PATTERNS.some((pattern) => pattern.test(flattened))) {
    return "[redacted: detail contained a credential-like value]";
  }
  return flattened.slice(0, 500);
}

/** Build a fully-populated audit event with server-generated id and timestamp. */
export function buildAuditEvent(input: AuditEventInput): AuditEvent {
  return {
    eventId: input.eventId ?? randomUUID(),
    timestamp: input.timestamp ?? new Date().toISOString(),
    actorType: input.actorType,
    actorId: input.actorId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    result: input.result,
    source: input.source,
    requestId: input.requestId,
    details: sanitizeDetails(input.details),
    category: input.category,
  };
}

/** Render a single audit event as the fixed plain-text block. */
export function formatAuditEvent(event: AuditEvent): string {
  return [
    RULE,
    "CYBERWOLF 360 — AUDIT EVENT",
    RULE,
    `Timestamp: ${event.timestamp}`,
    `Actor Type: ${event.actorType}`,
    `Actor ID: ${event.actorId}`,
    `Action: ${event.action}`,
    `Resource Type: ${event.resourceType}`,
    `Resource ID: ${event.resourceId}`,
    `Result: ${event.result}`,
    `Source: ${event.source}`,
    `Request ID: ${event.requestId}`,
    `Details: ${event.details}`,
    `Event ID: ${event.eventId}`,
    `Category: ${event.category}`,
    RULE,
    "",
  ].join("\n");
}

/** Deterministic SHA-256 of a formatted block, used for the hash chain. */
export function hashBlock(block: string): string {
  return createHash("sha256").update(block, "utf8").digest("hex");
}

/**
 * Parse one or more formatted blocks back into structured events. Used by the
 * admin viewer to filter a day's raw TXT content server-side.
 */
export function parseAuditEvents(text: string): AuditEvent[] {
  const events: AuditEvent[] = [];
  const blocks = text.split(RULE);
  // Blocks alternate: ["", headerBlock, bodyBlock, "", headerBlock, bodyBlock, ...]
  for (let i = 0; i < blocks.length - 1; i += 1) {
    const body = blocks[i]!;
    if (!/^\n?CYBERWOLF 360 — AUDIT EVENT\n?$/.test(body)) continue;
    const content = blocks[i + 1];
    if (!content) continue;
    const get = (label: string): string => {
      const match = new RegExp(`^${label}: (.*)$`, "m").exec(content);
      return match ? match[1]!.trim() : "";
    };
    const timestamp = get("Timestamp");
    if (!timestamp) continue;
    events.push({
      eventId: get("Event ID"),
      timestamp,
      actorType: get("Actor Type") as AuditActorType,
      actorId: get("Actor ID"),
      action: get("Action"),
      resourceType: get("Resource Type"),
      resourceId: get("Resource ID"),
      result: get("Result") as AuditResult,
      source: get("Source") as AuditSource,
      requestId: get("Request ID"),
      details: get("Details"),
      category: get("Category") as AuditCategory,
    });
  }
  return events;
}

/** UTC path segments for the audit-log storage layout. */
export function utcDateParts(date: Date): { year: string; month: string; day: string; isoDate: string } {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return { year, month, day, isoDate: `${year}-${month}-${day}` };
}
