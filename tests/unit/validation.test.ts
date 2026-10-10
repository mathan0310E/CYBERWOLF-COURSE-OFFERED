import { describe, expect, it } from "vitest";
import {
  normalizeEmail,
  registrationInputSchema,
  auditQuerySchema,
  registrationQuerySchema,
  exportRequestSchema,
} from "@cyberwolf/validation";

const validInput = {
  fullName: "Ada Lovelace",
  email: "Ada@Example.com",
  mobile: "+91 98765 43210",
  courseIds: ["cyber-security"],
  college: "Government Engineering College",
  degree: "btech",
  yearOfStudy: "third",
  privacyConsent: true,
};

describe("registration validation", () => {
  it("accepts a minimal valid submission", () => {
    const result = registrationInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects a submission without consent", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, privacyConsent: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("privacyConsent"))).toBe(true);
    }
  });

  it("rejects zero courses", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, courseIds: [] });
    expect(result.success).toBe(false);
  });

  it("rejects three courses", () => {
    const result = registrationInputSchema.safeParse({
      ...validInput,
      courseIds: ["cyber-security", "ai-web-development", "ethical-hacking"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate course ids", () => {
    const result = registrationInputSchema.safeParse({
      ...validInput,
      courseIds: ["cyber-security", "cyber-security"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown course id", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, courseIds: ["bogus"] });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid mobile number", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, mobile: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown extra fields (strict schema)", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, isAdmin: true, price: 1 });
    expect(result.success).toBe(false);
  });

  it("requires a college or institution", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, college: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("college"))).toBe(true);
    }
  });

  it("requires a valid degree or programme", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, degree: "phd" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("degree"))).toBe(true);
    }
  });

  it("requires a valid year of study", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, yearOfStudy: "sixth" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("yearOfStudy"))).toBe(true);
    }
  });

  it("rejects a client-supplied price by refusing unknown keys", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, finalPrice: 1 });
    expect(result.success).toBe(false);
  });

  it("bounds the free-text message length", () => {
    const result = registrationInputSchema.safeParse({ ...validInput, message: "x".repeat(1001) });
    expect(result.success).toBe(false);
  });
});

describe("email normalization", () => {
  it("lower-cases and trims", () => {
    expect(normalizeEmail("  Ada@Example.COM ")).toBe("ada@example.com");
  });

  it("preserves plus-addressing (no alias stripping)", () => {
    expect(normalizeEmail("ada+cyberwolf@example.com")).toBe("ada+cyberwolf@example.com");
  });

  it("does not treat gmail dots as aliases", () => {
    expect(normalizeEmail("a.d.a@gmail.com")).toBe("a.d.a@gmail.com");
  });
});

describe("admin query schemas", () => {
  it("applies safe pagination defaults", () => {
    const parsed = registrationQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(25);
    expect(parsed.sortDir).toBe("desc");
  });

  it("caps page size", () => {
    expect(registrationQuerySchema.safeParse({ pageSize: 500 }).success).toBe(false);
  });

  it("validates the audit date format", () => {
    expect(auditQuerySchema.safeParse({ date: "2026-01-02" }).success).toBe(true);
    expect(auditQuerySchema.safeParse({ date: "02-01-2026" }).success).toBe(false);
  });

  it("restricts export kinds", () => {
    expect(exportRequestSchema.safeParse({ kind: "registrations" }).success).toBe(true);
    expect(exportRequestSchema.safeParse({ kind: "everything" }).success).toBe(false);
  });
});
