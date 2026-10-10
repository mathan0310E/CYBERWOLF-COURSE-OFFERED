import { describe, expect, it } from "vitest";
import {
  buildAuditEvent,
  formatAuditEvent,
  hashBlock,
  parseAuditEvents,
  sanitizeDetails,
  utcDateParts,
} from "@backend/audit/format";

describe("audit event formatting", () => {
  const base = {
    actorType: "registrant" as const,
    actorId: "ada@example.com",
    action: "registration.created",
    resourceType: "registration",
    resourceId: "reg-1",
    result: "SUCCESS" as const,
    source: "public-site" as const,
    requestId: "req-1",
    details: "Registered for 1 course(s)",
    category: "registration" as const,
  };

  it("produces the documented fixed-format block", () => {
    const event = buildAuditEvent(base);
    const text = formatAuditEvent(event);
    expect(text).toContain("CYBERWOLF 360 — AUDIT EVENT");
    expect(text).toContain("Action: registration.created");
    expect(text).toContain("Result: SUCCESS");
    expect(text).toContain("Request ID: req-1");
    expect(text).toContain("Event ID:");
    // Three rules: block start, after the header, and block end.
    expect(text.split("============================================================").length).toBe(4);
  });

  it("round-trips through the parser", () => {
    const event = buildAuditEvent(base);
    const text = formatAuditEvent(event) + formatAuditEvent(buildAuditEvent({ ...base, action: "registration.viewed" }));
    const parsed = parseAuditEvents(text);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]!.action).toBe("registration.created");
    expect(parsed[0]!.result).toBe("SUCCESS");
    expect(parsed[0]!.eventId).toBe(event.eventId);
    expect(parsed[1]!.action).toBe("registration.viewed");
  });

  it("generates distinct server-side ids and timestamps", () => {
    const a = buildAuditEvent(base);
    const b = buildAuditEvent(base);
    expect(a.eventId).not.toBe(b.eventId);
    expect(new Date(a.timestamp).toString()).not.toBe("Invalid Date");
  });

  it("hashes a block deterministically", () => {
    expect(hashBlock("hello")).toBe(hashBlock("hello"));
    expect(hashBlock("hello")).not.toBe(hashBlock("hello!"));
  });

  it("derives UTC date parts", () => {
    const parts = utcDateParts(new Date("2026-03-04T23:59:59.000Z"));
    expect(parts).toEqual({ year: "2026", month: "03", day: "04", isoDate: "2026-03-04" });
  });
});

describe("audit detail sanitisation", () => {
  it("collapses newlines so the block cannot be forged", () => {
    const sanitized = sanitizeDetails("line one\nAction: forged\nResult: DENIED");
    expect(sanitized).not.toContain("\n");
    expect(sanitized).toBe("line one Action: forged Result: DENIED");
  });

  it("redacts credential-like details", () => {
    expect(sanitizeDetails("password: hunter2")).toContain("redacted");
    expect(sanitizeDetails("Authorization: Bearer abcdefghijklmnop")).toContain("redacted");
    expect(sanitizeDetails("api_key=ABCDEF123456")).toContain("redacted");
    expect(sanitizeDetails("-----BEGIN RSA PRIVATE KEY-----")).toContain("redacted");
  });

  it("bounds the length of a detail string", () => {
    expect(sanitizeDetails("x".repeat(1000)).length).toBe(500);
  });
});
