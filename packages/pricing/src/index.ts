import { COURSE_IDS, type CourseId, type PriceBreakdown } from "@cyberwolf/shared-types";

/**
 * Centralised pricing rules. This is the ONLY place pricing constants live.
 * The frontend uses it for a preview; the trusted backend uses the exact same
 * function to compute the authoritative amount. A client-supplied price is
 * never trusted.
 *
 * Business data (confirmed):
 *   - Original price per single course: ₹12,000
 *   - Single-course offer price:        ₹8,500  (saving ₹3,500)
 *   - Two-course bundle offer price:    ₹12,500 (assumed original ₹24,000,
 *                                                 assumed saving ₹11,500)
 *   - Zero courses:                     ₹0, submission disabled
 *   - More than two courses:            rejected
 */

export const ORIGINAL_PRICE_PER_COURSE = 12_000;
export const SINGLE_COURSE_OFFER_PRICE = 8_500;
export const TWO_COURSE_BUNDLE_PRICE = 12_500;

export const MIN_COURSES = 0;
export const MAX_COURSES = 2;

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

export function isCourseId(value: unknown): value is CourseId {
  return typeof value === "string" && (COURSE_IDS as readonly string[]).includes(value);
}

/**
 * Deduplicate course ids while preserving order and validating each value.
 * Throws {@link PricingError} for unknown ids.
 */
export function normalizeCourseIds(courseIds: readonly string[]): CourseId[] {
  const seen = new Set<CourseId>();
  const result: CourseId[] = [];
  for (const id of courseIds) {
    if (!isCourseId(id)) {
      throw new PricingError(`Unknown course id: ${String(id)}`);
    }
    if (!seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }
  return result;
}

/**
 * Compute the authoritative price breakdown for a set of selected courses.
 *
 * @throws {PricingError} when more than two distinct courses are selected or
 *   an unknown course id is supplied.
 */
export function calculatePrice(courseIds: readonly string[]): PriceBreakdown {
  const normalized = normalizeCourseIds(courseIds);
  const courseCount = normalized.length;

  if (courseCount > MAX_COURSES) {
    throw new PricingError(
      `At most ${MAX_COURSES} courses may be selected (received ${courseCount}).`,
    );
  }

  if (courseCount === 0) {
    return { courseCount: 0, originalPrice: 0, discount: 0, finalPrice: 0 };
  }

  const originalPrice = courseCount * ORIGINAL_PRICE_PER_COURSE;
  const finalPrice =
    courseCount === 1 ? SINGLE_COURSE_OFFER_PRICE : TWO_COURSE_BUNDLE_PRICE;

  return {
    courseCount,
    originalPrice,
    discount: originalPrice - finalPrice,
    finalPrice,
  };
}

/** True when the selection is eligible for submission. */
export function isSubmittable(courseIds: readonly string[]): boolean {
  try {
    const count = normalizeCourseIds(courseIds).length;
    return count >= 1 && count <= MAX_COURSES;
  } catch {
    return false;
  }
}

/** Format an integer amount as Indian Rupees, e.g. 8500 -> "₹8,500". */
export function formatINR(amount: number): string {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}
