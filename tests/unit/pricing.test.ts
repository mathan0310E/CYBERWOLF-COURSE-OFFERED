import { describe, expect, it } from "vitest";
import {
  calculatePrice,
  formatINR,
  isSubmittable,
  normalizeCourseIds,
  PricingError,
  MAX_COURSES,
  ORIGINAL_PRICE_PER_COURSE,
  SINGLE_COURSE_OFFER_PRICE,
  TWO_COURSE_BUNDLE_PRICE,
} from "@cyberwolf/pricing";
import { COURSE_IDS } from "@cyberwolf/shared-types";

describe("pricing — confirmed business data", () => {
  it("charges nothing and disables submission for zero courses", () => {
    const price = calculatePrice([]);
    expect(price).toEqual({ courseCount: 0, originalPrice: 0, discount: 0, finalPrice: 0 });
    expect(isSubmittable([])).toBe(false);
  });

  it("prices one course at ₹8,500, saving ₹3,500 from ₹12,000", () => {
    const price = calculatePrice(["cyber-security"]);
    expect(price.courseCount).toBe(1);
    expect(price.originalPrice).toBe(12_000);
    expect(price.finalPrice).toBe(8_500);
    expect(price.discount).toBe(3_500);
    expect(isSubmittable(["cyber-security"])).toBe(true);
  });

  it("prices two courses at ₹12,500 against an assumed ₹24,000, saving ₹11,500", () => {
    const price = calculatePrice(["cyber-security", "ethical-hacking"]);
    expect(price.courseCount).toBe(2);
    expect(price.originalPrice).toBe(24_000);
    expect(price.finalPrice).toBe(12_500);
    expect(price.discount).toBe(11_500);
    expect(isSubmittable(["cyber-security", "ethical-hacking"])).toBe(true);
  });

  it("rejects three distinct courses", () => {
    expect(() => calculatePrice([...COURSE_IDS])).toThrow(PricingError);
    expect(isSubmittable([...COURSE_IDS])).toBe(false);
  });

  it("rejects an unknown course id", () => {
    expect(() => calculatePrice(["not-a-course"])).toThrow(PricingError);
  });

  it("is independent of selection order", () => {
    const a = calculatePrice(["ai-web-development", "cyber-security"]);
    const b = calculatePrice(["cyber-security", "ai-web-development"]);
    expect(a).toEqual(b);
  });

  it("deduplicates repeated ids rather than charging twice", () => {
    const price = calculatePrice(["cyber-security", "cyber-security"]);
    expect(price.courseCount).toBe(1);
    expect(price.finalPrice).toBe(8_500);
  });

  it("exposes the constants used across the app", () => {
    expect(ORIGINAL_PRICE_PER_COURSE).toBe(12_000);
    expect(SINGLE_COURSE_OFFER_PRICE).toBe(8_500);
    expect(TWO_COURSE_BUNDLE_PRICE).toBe(12_500);
    expect(MAX_COURSES).toBe(2);
  });

  it("formats Indian Rupees without decimals", () => {
    expect(formatINR(8_500)).toBe("₹8,500");
    expect(formatINR(12_500)).toBe("₹12,500");
  });

  it("normalizes course ids while preserving order", () => {
    expect(normalizeCourseIds(["ethical-hacking", "cyber-security"])).toEqual([
      "ethical-hacking",
      "cyber-security",
    ]);
  });
});
