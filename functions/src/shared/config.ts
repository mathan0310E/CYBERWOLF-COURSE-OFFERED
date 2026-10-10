/**
 * Server-side configuration. All values here are SECRET or backend-only and
 * must never reach the browser bundle. Nothing in this module may be imported
 * from a Vite application.
 */

export interface ServerConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
  organisationEmail: string;
  publicSiteUrl: string;
  adminAppUrl: string;
  allowedOrigins: string[];
  auditBucket?: string;
  isEmulator: boolean;
}

function readEnv(name: string, fallback = ""): string {
  const value = process.env[name];
  return value === undefined || value === null ? fallback : value;
}

function parseBoolean(value: string, fallback = false): boolean {
  if (value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

/**
 * Build the runtime configuration. In the Firebase emulator the SMTP settings
 * are optional because the mail transport is replaced with a JSON transport
 * that records messages instead of sending them.
 */
export function getServerConfig(): ServerConfig {
  const isEmulator =
    parseBoolean(readEnv("FUNCTIONS_EMULATOR")) ||
    readEnv("GCLOUD_PROJECT").startsWith("demo-");

  const allowedOrigins = readEnv("ALLOWED_ORIGINS")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return {
    smtp: {
      host: readEnv("SMTP_HOST"),
      port: Number.parseInt(readEnv("SMTP_PORT", "587"), 10) || 587,
      secure: parseBoolean(readEnv("SMTP_SECURE"), false),
      user: readEnv("SMTP_USER"),
      pass: readEnv("SMTP_PASS"),
      from: readEnv("MAIL_FROM"),
    },
    organisationEmail: readEnv("ORGANISATION_EMAIL"),
    publicSiteUrl: readEnv("PUBLIC_SITE_URL", "http://localhost:5173"),
    adminAppUrl: readEnv("ADMIN_APP_URL", "http://localhost:5174"),
    allowedOrigins,
    auditBucket: readEnv("AUDIT_BUCKET") || undefined,
    isEmulator,
  };
}

export interface MissingConfigIssue {
  key: string;
  message: string;
}

/**
 * Report the SMTP settings that are still missing so endpoints can surface a
 * clear setup error instead of pretending to succeed.
 */
export function findMissingSmtpConfig(config: ServerConfig): MissingConfigIssue[] {
  const issues: MissingConfigIssue[] = [];
  if (!config.smtp.host) issues.push({ key: "SMTP_HOST", message: "SMTP host is not configured." });
  if (!config.smtp.user) issues.push({ key: "SMTP_USER", message: "SMTP user is not configured." });
  if (!config.smtp.pass) issues.push({ key: "SMTP_PASS", message: "SMTP password is not configured." });
  if (!config.smtp.from) issues.push({ key: "MAIL_FROM", message: "MAIL_FROM is not configured." });
  if (!config.organisationEmail) {
    issues.push({ key: "ORGANISATION_EMAIL", message: "ORGANISATION_EMAIL is not configured." });
  }
  return issues;
}
