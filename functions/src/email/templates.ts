import type { CourseId, PriceBreakdown } from "@cyberwolf/shared-types";
import { COURSES, COMPANY, degreeLabel, getCourseById, studyYearLabel } from "@cyberwolf/shared-types";
import { formatINR } from "@cyberwolf/pricing";

/**
 * HTML + plain-text email templates. Every user-controlled value is escaped
 * before it is interpolated into HTML. These templates never include SMTP
 * credentials and never claim that admission or payment is confirmed.
 */

/** Escape a value for safe interpolation into HTML text or attributes. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface TemplateData {
  studentName: string;
  studentEmail: string;
  reference: string;
  courseIds: CourseId[];
  price: PriceBreakdown;
  createdAt: string;
  adminAppUrl?: string;
  /** Student academic context (optional so older jobs still render). */
  college?: string;
  degree?: string;
  yearOfStudy?: string;
  city?: string;
}

const BRAND = {
  bg: "#090B10",
  card: "#171D27",
  accent: "#73F59B",
  accent2: "#9B7CFF",
  text: "#F5F7FA",
  muted: "#A4ADBB",
  border: "#242B37",
};

/** Verified company contact line appended to plain-text messages. */
const CONTACT_TEXT = `${COMPANY.legalName} · ${COMPANY.email} · ${COMPANY.phones[0]} · ${COMPANY.website.replace(/^https?:\/\//, "")}`;

function courseListText(courseIds: CourseId[]): string {
  return courseIds.map((id) => `- ${getCourseById(id)?.name ?? id}`).join("\n");
}

/** Human-readable academic lines, used by both HTML and plain-text variants. */
function academicLines(data: TemplateData): Array<{ label: string; value: string }> {
  const lines: Array<{ label: string; value: string }> = [];
  if (data.college) lines.push({ label: "College", value: data.college });
  if (data.degree) lines.push({ label: "Degree / programme", value: degreeLabel(data.degree) });
  if (data.yearOfStudy) lines.push({ label: "Year of study", value: studyYearLabel(data.yearOfStudy) });
  if (data.city) lines.push({ label: "City", value: data.city });
  return lines;
}

function academicRowsHtml(data: TemplateData): string {
  return academicLines(data)
    .map(
      (line) =>
        `<tr><td style="padding:6px 0;color:${BRAND.muted};">${escapeHtml(line.label)}</td><td style="color:${BRAND.text};">${escapeHtml(line.value)}</td></tr>`,
    )
    .join("");
}

function courseListHtml(courseIds: CourseId[]): string {
  return courseIds
    .map((id) => {
      const name = escapeHtml(getCourseById(id)?.name ?? id);
      return `<li style="margin:4px 0;color:${BRAND.text};">${name}</li>`;
    })
    .join("");
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:24px;background:${BRAND.bg};font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
    <tr><td style="padding-bottom:16px;">
      <div style="font-size:20px;font-weight:700;color:${BRAND.text};letter-spacing:0.5px;">
        CyberWolf<span style="color:${BRAND.accent};">360</span>
      </div>
      <div style="font-size:12px;color:${BRAND.muted};letter-spacing:2px;text-transform:uppercase;">Learn. Secure. Build.</div>
    </td></tr>
    <tr><td style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;padding:24px;">
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding-top:16px;font-size:12px;color:${BRAND.muted};">
      This is a transactional message about your CyberWolf 360 registration.<br />
      ${escapeHtml(COMPANY.legalName)} · <a href="mailto:${escapeHtml(COMPANY.email)}" style="color:${BRAND.muted};">${escapeHtml(COMPANY.email)}</a> · ${escapeHtml(COMPANY.phones[0])} · <a href="${escapeHtml(COMPANY.website)}" style="color:${BRAND.muted};">${escapeHtml(COMPANY.website.replace(/^https?:\/\//, ""))}</a>
    </td></tr>
  </table>
</body></html>`;
}

/** Email 1 — sent to the organisation. */
export function organisationNewRegistration(data: TemplateData): { subject: string; html: string; text: string } {
  const subject = "New Course Registration — CyberWolf 360";
  const price = data.price;

  const html = shell(
    subject,
    `<h1 style="margin:0 0 8px;font-size:18px;color:${BRAND.text};">New course registration</h1>
     <p style="margin:0 0 16px;color:${BRAND.muted};font-size:14px;">A new registration has been received.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
       <tr><td style="padding:6px 0;color:${BRAND.muted};width:170px;">Student name</td><td style="color:${BRAND.text};">${escapeHtml(data.studentName)}</td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Student email</td><td style="color:${BRAND.text};">${escapeHtml(data.studentEmail)}</td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Reference</td><td style="color:${BRAND.accent};font-family:monospace;">${escapeHtml(data.reference)}</td></tr>
       ${academicRowsHtml(data)}
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Courses</td><td><ul style="margin:0;padding-left:18px;">${courseListHtml(data.courseIds)}</ul></td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Original price</td><td style="color:${BRAND.text};">${escapeHtml(formatINR(price.originalPrice))}</td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Discount</td><td style="color:${BRAND.text};">${escapeHtml(formatINR(price.discount))}</td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Final price</td><td style="color:${BRAND.accent};font-weight:700;">${escapeHtml(formatINR(price.finalPrice))}</td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Received (UTC)</td><td style="color:${BRAND.text};">${escapeHtml(data.createdAt)}</td></tr>
     </table>
     ${
       data.adminAppUrl
         ? `<p style="margin:16px 0 0;font-size:13px;"><a href="${escapeHtml(data.adminAppUrl)}" style="color:${BRAND.accent2};">Open the private admin application</a></p>`
         : ""
     }`,
  );

  const text = [
    "CYBERWOLF 360 — NEW COURSE REGISTRATION",
    "Learn. Secure. Build.",
    "",
    `Student name: ${data.studentName}`,
    `Student email: ${data.studentEmail}`,
    `Reference: ${data.reference}`,
    ...academicLines(data).map((line) => `${line.label}: ${line.value}`),
    "Courses:",
    courseListText(data.courseIds),
    `Original price: ${formatINR(price.originalPrice)}`,
    `Discount: ${formatINR(price.discount)}`,
    `Final price: ${formatINR(price.finalPrice)}`,
    `Received (UTC): ${data.createdAt}`,
    data.adminAppUrl ? `Admin: ${data.adminAppUrl}` : "",
    "",
    "This registration submission does not guarantee admission or payment.",
    "",
    CONTACT_TEXT,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject, html, text };
}

/** Email 2 — sent to the student (first-time registration). */
export function studentRegistrationReceived(data: TemplateData): { subject: string; html: string; text: string } {
  const subject = "Your CyberWolf 360 Registration Has Been Received";
  const price = data.price;

  const html = shell(
    subject,
    `<h1 style="margin:0 0 8px;font-size:18px;color:${BRAND.text};">Thank you, ${escapeHtml(data.studentName)}</h1>
     <p style="margin:0 0 16px;color:${BRAND.muted};font-size:14px;">We have received your course registration.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
       <tr><td style="padding:6px 0;color:${BRAND.muted};width:170px;">Reference</td><td style="color:${BRAND.accent};font-family:monospace;">${escapeHtml(data.reference)}</td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Courses</td><td><ul style="margin:0;padding-left:18px;">${courseListHtml(data.courseIds)}</ul></td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Original price</td><td style="color:${BRAND.text};">${escapeHtml(formatINR(price.originalPrice))}</td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Savings</td><td style="color:${BRAND.text};">${escapeHtml(formatINR(price.discount))}</td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Final price</td><td style="color:${BRAND.accent};font-weight:700;">${escapeHtml(formatINR(price.finalPrice))}</td></tr>
     </table>
     <p style="margin:16px 0 0;color:${BRAND.muted};font-size:13px;">
       Submitting this registration does not guarantee admission or payment. Our team will follow up using the contact details you provided.
     </p>
     <p style="margin:16px 0 0;color:${BRAND.text};font-weight:600;">Learn. Secure. Build.</p>`,
  );

  const text = [
    `Thank you, ${data.studentName}.`,
    "We have received your CyberWolf 360 course registration.",
    "",
    `Reference: ${data.reference}`,
    "Courses:",
    courseListText(data.courseIds),
    `Original price: ${formatINR(price.originalPrice)}`,
    `Savings: ${formatINR(price.discount)}`,
    `Final price: ${formatINR(price.finalPrice)}`,
    "",
    "Submitting this registration does not guarantee admission or payment.",
    "Learn. Secure. Build.",
    "",
    CONTACT_TEXT,
  ].join("\n");

  return { subject, html, text };
}

/** Organisation notification for a repeat registration (no welcome variant). */
export function organisationRepeatRegistration(data: TemplateData): { subject: string; html: string; text: string } {
  const base = organisationNewRegistration(data);
  const subject = "Repeat Course Registration — CyberWolf 360";
  // Distinguish the body so the repeat notification is not a copy of the
  // first-time message: the organisation sees that this address has registered
  // before.
  const html = base.html
    .replace("New course registration", "Repeat course registration")
    .replace(
      "A new registration has been received.",
      "A further registration has been received from an email address that has registered before.",
    );
  const text = base.text.replace(
    "CYBERWOLF 360 — NEW COURSE REGISTRATION",
    "CYBERWOLF 360 — REPEAT COURSE REGISTRATION",
  );
  return { subject, html, text };
}

/** Student confirmation for a repeat registration (no first-time welcome). */
export function studentRepeatRegistration(data: TemplateData): { subject: string; html: string; text: string } {
  const subject = "Your CyberWolf 360 Registration Has Been Received";
  const price = data.price;
  const html = shell(
    subject,
    `<h1 style="margin:0 0 8px;font-size:18px;color:${BRAND.text};">Registration received</h1>
     <p style="margin:0 0 16px;color:${BRAND.muted};font-size:14px;">We have received another registration from you.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
       <tr><td style="padding:6px 0;color:${BRAND.muted};width:170px;">Reference</td><td style="color:${BRAND.accent};font-family:monospace;">${escapeHtml(data.reference)}</td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Courses</td><td><ul style="margin:0;padding-left:18px;">${courseListHtml(data.courseIds)}</ul></td></tr>
       <tr><td style="padding:6px 0;color:${BRAND.muted};">Final price</td><td style="color:${BRAND.accent};font-weight:700;">${escapeHtml(formatINR(price.finalPrice))}</td></tr>
     </table>
     <p style="margin:16px 0 0;color:${BRAND.muted};font-size:13px;">Submitting this registration does not guarantee admission or payment.</p>`,
  );
  const text = [
    "We have received another CyberWolf 360 registration from you.",
    "",
    `Reference: ${data.reference}`,
    "Courses:",
    courseListText(data.courseIds),
    `Final price: ${formatINR(price.finalPrice)}`,
    "",
    "Submitting this registration does not guarantee admission or payment.",
    "Learn. Secure. Build.",
    "",
    CONTACT_TEXT,
  ].join("\n");
  return { subject, html, text };
}

export const TEMPLATE_NAMES = {
  organisationFirst: "organisation-new-registration",
  organisationRepeat: "organisation-repeat-registration",
  studentFirst: "student-registration-received",
  studentRepeat: "student-repeat-registration",
} as const;

export type TemplateName = (typeof TEMPLATE_NAMES)[keyof typeof TEMPLATE_NAMES];

export function renderTemplate(name: TemplateName, data: TemplateData): { subject: string; html: string; text: string } {
  switch (name) {
    case TEMPLATE_NAMES.organisationFirst:
      return organisationNewRegistration(data);
    case TEMPLATE_NAMES.organisationRepeat:
      return organisationRepeatRegistration(data);
    case TEMPLATE_NAMES.studentFirst:
      return studentRegistrationReceived(data);
    case TEMPLATE_NAMES.studentRepeat:
      return studentRepeatRegistration(data);
    default:
      return studentRegistrationReceived(data);
  }
}

export { COURSES };
