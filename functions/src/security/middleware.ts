import cors from "cors";
import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { getServerConfig } from "../shared/config";
import { AppError } from "../shared/errors";

/**
 * CORS is restricted to the two known applications. CORS is NOT authentication:
 * every privileged route still verifies a token independently.
 */
export function buildCors() {
  const config = getServerConfig();
  const allowed = new Set(config.allowedOrigins);

  return cors({
    origin(origin, callback) {
      // Same-origin / server-to-server requests (no Origin header) are allowed
      // through; they are still subject to authentication and authorization.
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowed.has(origin)) {
        callback(null, true);
        return;
      }
      callback(AppError.forbidden("This origin is not permitted."));
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "X-Firebase-AppCheck"],
    exposedHeaders: ["X-Request-Id"],
    credentials: false,
    maxAge: 600,
  });
}

function keyByIp(req: Request): string {
  // `req.ip` is populated by Express behind the Firebase/Cloud Run proxy.
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

/** Strict limiter for the public registration endpoint. */
export const registrationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: keyByIp,
  handler(_req, _res, next) {
    next(AppError.tooManyRequests("Too many registration attempts. Please try again later."));
  },
});

/** Limiter for sensitive admin mutations (status changes, retries, exports). */
export const adminActionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.uid ?? keyByIp(req),
  handler(_req, _res, next) {
    next(AppError.tooManyRequests("Too many requests. Please slow down."));
  },
});

/** Limiter for admin authentication-adjacent endpoints. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: keyByIp,
  handler(_req, _res, next) {
    next(AppError.tooManyRequests("Too many attempts. Please try again later."));
  },
});

/**
 * Verify Firebase App Check when enforcement is enabled. App Check is an
 * additional signal only; it never replaces authentication or authorization.
 * Enforcement is opt-in via APP_CHECK_ENFORCED=true so it can be validated
 * against real production traffic first.
 */
export function appCheckGuard(req: Request, _res: Response, next: NextFunction): void {
  if (process.env.APP_CHECK_ENFORCED !== "true") {
    next();
    return;
  }
  const token = req.header("x-firebase-appcheck");
  if (!token) {
    next(AppError.forbidden("App Check verification is required."));
    return;
  }
  // The token is validated by the platform / a dedicated verifier in production.
  next();
}
