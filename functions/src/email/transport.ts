import nodemailer, { type Transporter } from "nodemailer";
import { getServerConfig, findMissingSmtpConfig } from "../shared/config";
import { AppError } from "../shared/errors";
import { logger } from "../shared/logger";

/**
 * Nodemailer transport factory. This module is the ONLY place SMTP credentials
 * are read, and it lives strictly on the trusted backend. In the Firebase
 * emulator a JSON transport is used so tests never touch a real mail server.
 */
let cached: Transporter | null = null;

export function getMailTransport(): Transporter {
  if (cached) return cached;
  const config = getServerConfig();

  if (config.isEmulator) {
    // Records messages in-memory; nothing is delivered.
    cached = nodemailer.createTransport({ jsonTransport: true });
    return cached;
  }

  const missing = findMissingSmtpConfig(config);
  if (missing.length > 0) {
    throw AppError.notConfigured(
      `Email is not configured. Missing: ${missing.map((m) => m.key).join(", ")}.`,
    );
  }

  cached = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
    // Restrict transport hardening where the library supports it.
    tls: { minVersion: "TLSv1.2" },
    // Bound connection time so a hung SMTP server cannot stall a function.
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    // Never allow user-controlled file/URL fetches through the transport.
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  return cached;
}

/** Reset the cached transport (used by tests). */
export function resetMailTransport(): void {
  cached = null;
}

/** Categorise an SMTP failure into a safe, non-leaking label for the admin UI. */
export function categoriseSmtpError(error: unknown): string {
  const code = (error as { code?: string } | undefined)?.code;
  if (typeof code === "string") {
    if (["EAUTH", "EACCES"].includes(code)) return "auth";
    if (["ECONNECTION", "ECONNREFUSED", "ETIMEDOUT", "ESOCKET"].includes(code)) return "connection";
    if (code === "EENVELOPE") return "recipient-rejected";
    if (code === "EMESSAGE") return "message-rejected";
  }
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("rate") || message.includes("too many")) return "rate-limited";
  if (message.includes("spam") || message.includes("blocked")) return "blocked";
  return "unknown";
}

export function mailFromAddress(): string {
  return getServerConfig().smtp.from || "CyberWolf 360 <no-reply@example.com>";
}

export { logger as mailLogger };
