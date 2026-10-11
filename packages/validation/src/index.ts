import { z } from "zod";
import {
  COURSE_IDS,
  DEGREE_PROGRAMS,
  DEPARTMENTS,
  STUDY_YEARS,
  type CourseId,
  type DegreeProgram,
  type Department,
  type StudyYear,
} from "@cyberwolf/shared-types";
import { MAX_COURSES } from "@cyberwolf/pricing";

/**
 * Shared Zod schemas. The public site imports these for inline validation; the
 * trusted backend imports the *same* schemas for authoritative validation.
 * Never rely on client validation alone.
 */

/**
 * Normalize an email for first-time detection and duplicate checks.
 * Lower-cases and trims only. Plus-addressing is deliberately preserved and no
 * provider-specific alias transformation is applied.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const courseIdSchema = z.enum(COURSE_IDS as unknown as [CourseId, ...CourseId[]]);
const degreeSchema = z.enum(DEGREE_PROGRAMS as unknown as [DegreeProgram, ...DegreeProgram[]], {
  errorMap: () => ({ message: "Select your degree or programme." }),
});
const studyYearSchema = z.enum(STUDY_YEARS as unknown as [StudyYear, ...StudyYear[]], {
  errorMap: () => ({ message: "Select your year of study." }),
});
const departmentSchema = z.enum(DEPARTMENTS as unknown as [Department, ...Department[]], {
  errorMap: () => ({ message: "Select your department." }),
});

/** A reasonably strict but practical mobile number check. */
const mobileSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid mobile number.")
  .max(20, "Enter a valid mobile number.")
  .regex(/^[+]?[\d][\d\s-]{5,18}[\d]$/, "Enter a valid mobile number.");

export const registrationInputSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(120, "Name is too long."),
    email: z.string().trim().email("Enter a valid email address.").max(254),
    mobile: mobileSchema,
    courseIds: z
      .array(courseIdSchema)
      .min(1, "Select at least one course.")
      .max(MAX_COURSES, `Select at most ${MAX_COURSES} courses.`)
      // Reject duplicate ids rather than silently de-duplicating.
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "Duplicate courses are not allowed.",
      }),
    college: z
      .string()
      .trim()
      .min(2, "Enter your college or institution name.")
      .max(160, "College name is too long."),
    degree: degreeSchema,
    yearOfStudy: studyYearSchema,
    department: departmentSchema,
    city: z.string().trim().max(80).optional().or(z.literal("")),
    message: z.string().trim().max(1000).optional().or(z.literal("")),
    privacyConsent: z.boolean().refine((value) => value === true, {
      message: "You must accept the privacy policy to continue.",
    }),
  })
  .strict();

export type RegistrationInput = z.infer<typeof registrationInputSchema>;

/** Login schema for the admin app (validated client-side only; the token is authoritative). */
export const adminLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/** Query schema for admin registration listing. */
export const registrationQuerySchema = z
  .object({
    search: z.string().trim().max(200).optional(),
    status: z
      .enum(["received", "under-review", "contacted", "confirmed", "declined", "cancelled"])
      .optional(),
    courseId: courseIdSchema.optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    sortBy: z.enum(["createdAt", "fullName", "finalPrice"]).default("createdAt"),
    sortDir: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type RegistrationQuery = z.infer<typeof registrationQuerySchema>;

/** Query schema for admin audit-log retrieval. */
export const auditQuerySchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.")
      .optional(),
    category: z
      .enum(["audit", "registration", "admin", "security", "email", "errors"])
      .optional(),
    actorType: z.enum(["admin", "registrant", "visitor", "system"]).optional(),
    result: z.enum(["SUCCESS", "FAILURE", "DENIED"]).optional(),
    search: z.string().trim().max(200).optional(),
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(200).default(50),
  })
  .strict();

export type AuditQuery = z.infer<typeof auditQuerySchema>;

/** Registration status transition. */
export const registrationStatusSchema = z.object({
  status: z.enum(["received", "under-review", "contacted", "confirmed", "declined", "cancelled"]),
});

/** Manual email retry request. */
export const emailRetrySchema = z.object({
  jobId: z.string().min(1).max(200),
});

/** Export request (higher-risk action; requires reauthentication on the server). */
export const exportRequestSchema = z.object({
  kind: z.enum(["registrations", "audit"]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export { z };
