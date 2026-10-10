import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { AppError, toErrorBody } from "./errors";
import { logger } from "./logger";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/** Extract a correlation id, preferring a client-supplied request id header. */
export function attachRequestId(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("x-request-id");
  const safe = header && /^[A-Za-z0-9_-]{8,64}$/.test(header) ? header : randomUUID();
  req.requestId = safe;
  res.setHeader("x-request-id", safe);
  next();
}

/** Wrap an async Express handler so rejections reach the error middleware. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}

/** Terminal Express error middleware producing a safe JSON envelope. */
export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const requestId = req.requestId ?? "unknown";
  const { status, body } = toErrorBody(error, requestId);
  if (status >= 500) {
    logger.error("Unhandled request error", {
      requestId,
      action: `${req.method} ${req.path}`,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  } else {
    logger.warn("Request rejected", {
      requestId,
      action: `${req.method} ${req.path}`,
      status,
      code: body.error.code,
    });
  }
  res.status(status).json(body);
}

/** Reject requests with a body larger than the given JSON byte budget. */
export function limitBodySize(bytes: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const length = Number.parseInt(req.header("content-length") ?? "0", 10);
    if (Number.isFinite(length) && length > bytes) {
      next(AppError.badRequest("Request body is too large."));
      return;
    }
    next();
  };
}
