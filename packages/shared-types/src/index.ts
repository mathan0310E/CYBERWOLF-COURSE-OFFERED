/**
 * Shared, non-sensitive domain types for CyberWolf 360.
 *
 * Nothing in this package may contain secrets, admin-only UI, SMTP settings,
 * service-account data or any private credential. It is safe to import from
 * both the public site and the private admin application.
 */

/** Canonical course identifiers. Only these values are ever persisted. */
export const COURSE_IDS = [
  "cyber-security",
  "ai-web-development",
  "ethical-hacking",
] as const;

export type CourseId = (typeof COURSE_IDS)[number];

export interface Course {
  id: CourseId;
  name: string;
  /** Short general marketing description. Not a verified syllabus. */
  description: string;
  /** Lucide icon name rendered by the consuming app. */
  icon: string;
}

export const COURSES: readonly Course[] = [
  {
    id: "cyber-security",
    name: "Cyber Security",
    description:
      "Explore cybersecurity fundamentals, common security threats, and defensive security practices.",
    icon: "ShieldCheck",
  },
  {
    id: "ai-web-development",
    name: "AI & Web Development",
    description:
      "Explore artificial intelligence concepts alongside modern web development.",
    icon: "Bot",
  },
  {
    id: "ethical-hacking",
    name: "Ethical Hacking",
    description:
      "Discover ethical hacking principles and the foundations of authorized security testing.",
    icon: "Terminal",
  },
] as const;

export function getCourseById(id: CourseId): Course | undefined {
  return COURSES.find((course) => course.id === id);
}

/** Registration lifecycle status. */
export type RegistrationStatus =
  | "received"
  | "under-review"
  | "contacted"
  | "confirmed"
  | "declined"
  | "cancelled";

/** Authoritative, server-calculated pricing for a registration. */
export interface PriceBreakdown {
  courseCount: number;
  /** Sum of individual original prices. */
  originalPrice: number;
  /** Discount applied against the original price. */
  discount: number;
  /** Authoritative amount payable. */
  finalPrice: number;
}

/** Stored registration record (never publicly readable). */
export interface Registration {
  id: string;
  /** Human-readable, server-generated reference shown to the student. */
  reference: string;
  fullName: string;
  email: string;
  /** Normalized (lower-cased, trimmed) email used for first-time detection. */
  normalizedEmail: string;
  mobile: string;
  courseIds: CourseId[];
  educationOrOccupation?: string;
  city?: string;
  message?: string;
  price: PriceBreakdown;
  status: RegistrationStatus;
  privacyConsent: boolean;
  consentAt: string;
  createdAt: string;
  updatedAt: string;
  requestId: string;
}

/** Payload returned to the public site after a successful registration. */
export interface RegistrationReceipt {
  reference: string;
  courseIds: CourseId[];
  price: PriceBreakdown;
  status: RegistrationStatus;
  createdAt: string;
  /** True when this was the first registration for the normalized email. */
  firstTimeEmail: boolean;
}

/** Audit actor categories. */
export type AuditActorType = "admin" | "registrant" | "visitor" | "system";
export type AuditResult = "SUCCESS" | "FAILURE" | "DENIED";
export type AuditSource = "public-site" | "private-admin" | "backend";

/** Audit categories map 1:1 to the TXT file names. */
export const AUDIT_CATEGORIES = [
  "audit",
  "registration",
  "admin",
  "security",
  "email",
  "errors",
] as const;

export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

/** A single structured audit event before it is rendered to TXT. */
export interface AuditEvent {
  eventId: string;
  timestamp: string;
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
}

/** Email notification job lifecycle. */
export type EmailJobStatus =
  | "queued"
  | "processing"
  | "accepted"
  | "confirmed"
  | "failed";

export type EmailRecipientType = "organisation" | "student";

export interface EmailJob {
  id: string;
  registrationId: string;
  recipientType: EmailRecipientType;
  /** Masked email address safe to display in the admin UI. */
  maskedRecipient: string;
  template: string;
  status: EmailJobStatus;
  attemptCount: number;
  lastAttemptAt?: string;
  lastErrorCategory?: string;
  /** Idempotency key preventing duplicate sends during retries. */
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

/** Standard API error envelope returned by the trusted backend. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    requestId: string;
    /** Field-level validation issues, when applicable. */
    issues?: Array<{ path: string; message: string }>;
  };
}

/**
 * Public company contact details, sourced from the Cyber Wolf website
 * (cyberwolf360.in). These are the only verified contact values used by the
 * platform; no other contact details are invented.
 */
export const COMPANY = {
  legalName: "Cyber Wolf",
  displayName: "CyberWolf 360",
  tagline: "Learn. Secure. Build.",
  website: "https://www.cyberwolf360.in",
  email: "info@cyberwolf360.in",
  phones: ["+91 63798 69678", "+91 78259 88139"],
} as const;

export type Company = typeof COMPANY;
