import type {
  ApiErrorBody,
  AuditEvent,
  EmailJob,
  Registration,
  RegistrationStatus,
} from "@cyberwolf/shared-types";
import type { RegistrationQuery, AuditQuery } from "@cyberwolf/validation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5001/demo-cyberwolf360/us-central1/api";

export class AdminApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string;
  readonly issues: Array<{ path: string; message: string }>;

  constructor(
    status: number,
    code: string,
    message: string,
    requestId: string,
    issues: Array<{ path: string; message: string }> = [],
  ) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.issues = issues;
  }
}

function newRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Fetch a fresh ID token for every privileged call. The token — not any
 * client-provided flag — is what the backend verifies.
 */
let tokenProvider: () => Promise<string | null> = async () => null;

export function setTokenProvider(provider: () => Promise<string | null>): void {
  tokenProvider = provider;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await tokenProvider();
  const requestId = newRequestId();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new AdminApiError(
      0,
      "NETWORK_ERROR",
      "Could not reach the backend service. Check your connection and that the API is running.",
      requestId,
    );
  }

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    throw new AdminApiError(
      response.status,
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? "The request failed.",
      body?.error?.requestId ?? requestId,
      body?.error?.issues ?? [],
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

export interface AdminSession {
  uid: string | null;
  email: string | null;
  admin: true;
}

export interface StatsResponse {
  total: number;
  byStatus: Record<string, number>;
  byCourse: Record<string, number>;
  last7Days: Array<{ date: string; count: number }>;
  revenue: { received: number; confirmed: number };
}

export interface RegistrationsResponse {
  items: Registration[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditResponse {
  date: string;
  category: string;
  total: number;
  page: number;
  pageSize: number;
  events: AuditEvent[];
  raw: string;
  manifest: unknown;
  writeFailures?: string;
}

export const adminApi = {
  session: () => request<AdminSession>("/api/admin/session"),
  stats: () => request<StatsResponse>("/api/admin/stats"),

  listRegistrations: (query: Partial<RegistrationQuery>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    }
    return request<RegistrationsResponse>(`/api/admin/registrations?${params.toString()}`);
  },

  getRegistration: (id: string) => request<Registration>(`/api/admin/registrations/${encodeURIComponent(id)}`),

  updateStatus: (id: string, status: RegistrationStatus) =>
    request<Registration>(`/api/admin/registrations/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  auditDates: () => request<{ dates: string[] }>("/api/admin/audit/dates"),

  audit: (query: Partial<AuditQuery>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    }
    return request<AuditResponse>(`/api/admin/audit?${params.toString()}`);
  },

  downloadAuditUrl: (date: string, category: string) =>
    `${API_BASE_URL}/api/admin/audit/download?date=${encodeURIComponent(date)}&category=${encodeURIComponent(category)}`,

  emails: () => request<{ jobs: EmailJob[] }>("/api/admin/emails"),

  retryEmail: (jobId: string) =>
    request<EmailJob>("/api/admin/emails/retry", { method: "POST", body: JSON.stringify({ jobId }) }),

  processEmails: () =>
    request<{ processed: number; sent: number; failed: number }>("/api/admin/emails/process", { method: "POST" }),

  exportData: (kind: "registrations" | "audit") =>
    request<string>("/api/admin/export", { method: "POST", body: JSON.stringify({ kind }) }),
};

/** Download an authenticated TXT file (uses a token header, not a URL token). */
export async function downloadAuthenticated(path: string, filename: string): Promise<void> {
  const token = await tokenProvider();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!response.ok) {
    throw new AdminApiError(response.status, "DOWNLOAD_FAILED", "Download failed.", newRequestId());
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export { API_BASE_URL };
