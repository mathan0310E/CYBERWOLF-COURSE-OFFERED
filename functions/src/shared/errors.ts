import type { ApiErrorBody } from "@cyberwolf/shared-types";

/**
 * Application error carrying a safe, user-facing message and an HTTP status.
 * Internal details are never leaked to the client; they are logged instead.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly issues?: Array<{ path: string; message: string }>;

  constructor(
    status: number,
    code: string,
    message: string,
    issues?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.issues = issues;
  }

  static badRequest(message = "The request was invalid."): AppError {
    return new AppError(400, "BAD_REQUEST", message);
  }
  static validation(
    issues: Array<{ path: string; message: string }>,
    message = "Validation failed.",
  ): AppError {
    return new AppError(422, "VALIDATION_ERROR", message, issues);
  }
  static unauthorised(message = "Authentication is required."): AppError {
    return new AppError(401, "UNAUTHORISED", message);
  }
  static forbidden(message = "You are not permitted to perform this action."): AppError {
    return new AppError(403, "FORBIDDEN", message);
  }
  static notFound(message = "The requested resource was not found."): AppError {
    return new AppError(404, "NOT_FOUND", message);
  }
  static conflict(message = "The request conflicts with the current state."): AppError {
    return new AppError(409, "CONFLICT", message);
  }
  static tooManyRequests(message = "Too many requests. Please try again later."): AppError {
    return new AppError(429, "RATE_LIMITED", message);
  }
  static notConfigured(message = "A required service is not configured."): AppError {
    return new AppError(503, "NOT_CONFIGURED", message);
  }
  static internal(message = "An unexpected error occurred."): AppError {
    return new AppError(500, "INTERNAL", message);
  }
}

/** Convert any thrown value into a safe API error body. */
export function toErrorBody(error: unknown, requestId: string): { status: number; body: ApiErrorBody } {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          requestId,
          ...(error.issues ? { issues: error.issues } : {}),
        },
      },
    };
  }
  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL",
        message: "An unexpected error occurred.",
        requestId,
      },
    },
  };
}
