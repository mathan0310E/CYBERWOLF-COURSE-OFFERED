import type { ApiErrorBody, RegistrationReceipt } from "@cyberwolf/shared-types";
import type { RegistrationInput } from "@cyberwolf/validation";
import { registrationInputSchema } from "@cyberwolf/validation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5001/demo-cyberwolf360/us-central1/api";

export class ApiError extends Error {
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
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.issues = issues;
  }
}

function newRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Submit a registration to the trusted backend.
 *
 * The client sends only the user-supplied fields — never a price. The server
 * recalculates the authoritative price and returns the receipt.
 */
export async function submitRegistration(
  input: RegistrationInput,
  options: { signal?: AbortSignal; idempotencyKey?: string } = {},
): Promise<RegistrationReceipt> {
  // Validate locally first to provide immediate feedback, but the server
  // validates independently and authoritatively.
  const parsed = registrationInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ApiError(
      422,
      "VALIDATION_ERROR",
      "Please correct the highlighted fields.",
      newRequestId(),
      parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    );
  }

  const requestId = newRequestId();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
        ...(options.idempotencyKey ? { "X-Idempotency-Key": options.idempotencyKey } : {}),
      },
      body: JSON.stringify(parsed.data),
      ...(options.signal ? { signal: options.signal } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "We could not reach the registration service. Please check your connection and try again.",
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
    throw new ApiError(
      response.status,
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? "Something went wrong. Please try again.",
      body?.error?.requestId ?? requestId,
      body?.error?.issues ?? [],
    );
  }

  return (await response.json()) as RegistrationReceipt;
}
