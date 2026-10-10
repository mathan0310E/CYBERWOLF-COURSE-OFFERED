import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  organisationNewRegistration,
  studentRegistrationReceived,
  studentRepeatRegistration,
  organisationRepeatRegistration,
  TEMPLATE_NAMES,
} from "@backend/email/templates";
import { maskEmail } from "@backend/email/processor";
import { categoriseSmtpError } from "@backend/email/transport";
import { redact } from "@backend/shared/logger";
import { calculatePrice } from "@cyberwolf/pricing";

const details = {
  studentName: "Ada Lovelace",
  studentEmail: "ada@example.com",
  reference: "CW-20260101-ABCD1234",
  courseIds: ["cyber-security", "ethical-hacking"] as const,
  price: calculatePrice(["cyber-security", "ethical-hacking"]),
  createdAt: "2026-01-01T00:00:00.000Z",
  adminAppUrl: "http://localhost:5174",
};

describe("email templates", () => {
  it("escapes HTML metacharacters", () => {
    expect(escapeHtml('<script>"x"&\'y\'</script>')).toBe(
      "&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;",
    );
  });

  it("builds the organisation email with the required subject and figures", () => {
    const mail = organisationNewRegistration({ ...details, courseIds: [...details.courseIds] });
    expect(mail.subject).toBe("New Course Registration — CyberWolf 360");
    expect(mail.html).toContain("₹12,500");
    expect(mail.html).toContain("₹24,000");
    expect(mail.text).toContain("CW-20260101-ABCD1234");
    expect(mail.text).toContain("does not guarantee admission or payment");
  });

  it("builds the student confirmation with the tagline", () => {
    const mail = studentRegistrationReceived({ ...details, courseIds: [...details.courseIds] });
    expect(mail.subject).toContain("Registration Has Been Received");
    expect(mail.text).toContain("Learn. Secure. Build.");
    expect(mail.text).toContain("does not guarantee admission or payment");
  });

  it("keeps a distinct repeat variant from the first-time variant", () => {
    const first = studentRegistrationReceived({ ...details, courseIds: [...details.courseIds] });
    const repeat = studentRepeatRegistration({ ...details, courseIds: [...details.courseIds] });
    expect(first.text).not.toBe(repeat.text);
    expect(TEMPLATE_NAMES.studentFirst).not.toBe(TEMPLATE_NAMES.studentRepeat);
  });

  it("builds a repeat-organisation variant distinct from the first-time one", () => {
    const first = organisationNewRegistration({ ...details, courseIds: [...details.courseIds] });
    const repeat = organisationRepeatRegistration({ ...details, courseIds: [...details.courseIds] });
    expect(repeat.text).not.toBe(first.text);
  });

  it("escapes a hostile student name in HTML but not in the plain-text body", () => {
    const mail = organisationNewRegistration({
      ...details,
      studentName: '<img src=x onerror=alert(1)>',
      courseIds: [...details.courseIds],
    });
    expect(mail.html).not.toContain("<img src=x onerror=alert(1)>");
    expect(mail.html).toContain("&lt;img");
  });

  it("never contains SMTP credentials", () => {
    const mail = organisationNewRegistration({ ...details, courseIds: [...details.courseIds] });
    expect(mail.html.toLowerCase()).not.toContain("smtp_pass");
    expect(mail.text.toLowerCase()).not.toContain("password:");
  });
});

describe("email helpers", () => {
  it("masks the local part of an address", () => {
    expect(maskEmail("ada.lovelace@example.com")).toBe("ad**********@example.com");
    expect(maskEmail("a@example.com")).toBe("a*@example.com");
    expect(maskEmail("not-an-email")).toBe("***");
  });

  it("categorises SMTP errors without leaking details", () => {
    expect(categoriseSmtpError({ code: "EAUTH" })).toBe("auth");
    expect(categoriseSmtpError({ code: "ECONNECTION" })).toBe("connection");
    expect(categoriseSmtpError({ code: "EENVELOPE" })).toBe("recipient-rejected");
    expect(categoriseSmtpError(new Error("Too many messages"))).toBe("rate-limited");
    expect(categoriseSmtpError(new Error("unexpected"))).toBe("unknown");
  });
});

describe("log redaction", () => {
  it("redacts sensitive keys and recurses", () => {
    const out = redact({
      requestId: "r1",
      SMTP_PASS: "hunter2",
      nested: { apiKey: "abc", ok: "yes" } as never,
    });
    expect(out.requestId).toBe("r1");
    expect(out.SMTP_PASS).toBe("[redacted]");
    expect((out.nested as Record<string, unknown>).apiKey).toBe("[redacted]");
    expect((out.nested as Record<string, unknown>).ok).toBe("yes");
  });
});
