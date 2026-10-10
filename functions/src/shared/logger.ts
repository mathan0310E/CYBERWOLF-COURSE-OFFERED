/**
 * Structured server-side logging with request correlation.
 * Logs never contain secrets or raw tokens. Errors are logged with a safe
 * message and category only.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  requestId?: string;
  action?: string;
  actorType?: string;
  resourceType?: string;
  resourceId?: string;
  result?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEY = /(pass(word)?|secret|token|authorization|api[-_]?key|smtp|credential)/i;

/** Remove obviously sensitive keys from a structured log payload. */
export function redact(fields: LogFields): LogFields {
  const out: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (SENSITIVE_KEY.test(key)) {
      out[key] = "[redacted]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = redact(value as LogFields);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function emit(level: LogLevel, message: string, fields: LogFields = {}): void {
  const payload = {
    severity: level.toUpperCase(),
    message,
    timestamp: new Date().toISOString(),
    ...redact(fields),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, fields?: LogFields) => emit("debug", message, fields),
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
};
