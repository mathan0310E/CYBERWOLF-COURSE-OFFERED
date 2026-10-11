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

/** Degree / programme a college student is currently pursuing. */
export const DEGREE_PROGRAMS = [
  "btech",
  "be",
  "bsc",
  "bca",
  "bcom",
  "ba",
  "mtech",
  "me",
  "msc",
  "mca",
  "mba",
  "diploma",
  "other",
] as const;

export type DegreeProgram = (typeof DEGREE_PROGRAMS)[number];

export const DEGREE_PROGRAM_LABELS: Record<DegreeProgram, string> = {
  btech: "B.Tech",
  be: "B.E.",
  bsc: "B.Sc",
  bca: "BCA",
  bcom: "B.Com",
  ba: "B.A.",
  mtech: "M.Tech",
  me: "M.E.",
  msc: "M.Sc",
  mca: "MCA",
  mba: "MBA",
  diploma: "Diploma",
  other: "Other",
};

/** Current year of study for a college student. */
export const STUDY_YEARS = [
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "graduated",
] as const;

export type StudyYear = (typeof STUDY_YEARS)[number];

export const STUDY_YEAR_LABELS: Record<StudyYear, string> = {
  first: "1st year",
  second: "2nd year",
  third: "3rd year",
  fourth: "4th year",
  fifth: "5th year",
  graduated: "Graduated",
};

/** Department / branch a college student belongs to. Required on the form. */
export const DEPARTMENTS = [
  "cse",
  "it",
  "ai-ds",
  "ai-ml",
  "ece",
  "eee",
  "mechanical",
  "civil",
  "chemical",
  "biotech",
  "commerce",
  "management",
  "arts-science",
  "other",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const DEPARTMENT_LABELS: Record<Department, string> = {
  cse: "Computer Science & Engineering",
  it: "Information Technology",
  "ai-ds": "AI & Data Science",
  "ai-ml": "AI & ML",
  ece: "Electronics & Communication",
  eee: "Electrical & Electronics",
  mechanical: "Mechanical Engineering",
  civil: "Civil Engineering",
  chemical: "Chemical Engineering",
  biotech: "Biotechnology",
  commerce: "Commerce",
  management: "Management / Business",
  "arts-science": "Arts & Science",
  other: "Other",
};

export function degreeLabel(value: string): string {
  return DEGREE_PROGRAM_LABELS[value as DegreeProgram] ?? value;
}

export function studyYearLabel(value: string): string {
  return STUDY_YEAR_LABELS[value as StudyYear] ?? value;
}

export function departmentLabel(value: string): string {
  return DEPARTMENT_LABELS[value as Department] ?? value;
}

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
  /** College or institution the student attends. */
  college: string;
  /** Degree / programme currently being pursued. */
  degree: DegreeProgram;
  /** Current year of study. */
  yearOfStudy: StudyYear;
  /** Department / branch. Required. */
  department: Department;
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
 * Public company details, verified from the Cyber Wolf website
 * (cyberwolf360.in) — specifically its published Organization/Person
 * structured data and footer. These are the only company values used by the
 * platform; nothing here is invented.
 */
export const COMPANY = {
  legalName: "Cyber Wolf",
  displayName: "CyberWolf 360",
  tagline: "Learn. Secure. Build.",
  /** Strapline used by Cyber Wolf for its services. */
  servicesTagline: "Cybersecurity, VAPT & Compliance",
  description:
    "Cyber Wolf provides cybersecurity services, VAPT, compliance, managed SOC, training and SaaS solutions for startups, enterprises and institutions.",
  website: "https://www.cyberwolf360.in",
  email: "info@cyberwolf360.in",
  supportEmail: "contact@cyberwolf360.in",
  eventsEmail: "events@cyberwolf360.in",
  phones: ["+91 63798 69678", "+91 78259 88139"],
  address: {
    street: "No. 3A, 10th Street, Gandhi Nagar",
    locality: "Tiruvannamalai",
    region: "Tamil Nadu",
    postalCode: "606601",
    country: "IN",
  },
  founder: { name: "Tamilselvan S", jobTitle: "Founder & CEO, CISO" },
  socials: {
    linkedin: "https://www.linkedin.com/company/cyberwolf-team/",
    instagram: "https://www.instagram.com/cyber_wolf_team",
    whatsapp: "https://whatsapp.com/channel/0029VbAmBt7GufIqh9iwND05",
  },
} as const;

export type Company = typeof COMPANY;

/**
 * The registered address as a single, correctly-ordered display line:
 * "No. 3A, 10th Street, Gandhi Nagar, Tiruvannamalai, Tamil Nadu 606601".
 * Derived from {@link COMPANY} so the parts and the display form never drift.
 */
export const COMPANY_ADDRESS_LINE =
  `${COMPANY.address.street}, ${COMPANY.address.locality}, ${COMPANY.address.region} ${COMPANY.address.postalCode}` as const;
