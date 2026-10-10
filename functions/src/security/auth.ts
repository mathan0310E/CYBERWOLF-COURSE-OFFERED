import type { Request, Response, NextFunction } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "../shared/admin-app";
import { AppError } from "../shared/errors";
import { logger } from "../shared/logger";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Populated by {@link authenticate} for authenticated routes. */
      user?: DecodedIdToken;
      /** Populated by {@link requireAdmin} for admin-only routes. */
      admin?: { uid: string; email: string | null };
    }
  }
}

function extractBearer(req: Request): string | null {
  const header = req.header("authorization") ?? req.header("Authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1]! : null;
}

/**
 * Verify a Firebase ID token and attach the decoded claims. Rejects with 401
 * when the token is missing, malformed, expired or revoked.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractBearer(req);
  if (!token) {
    next(AppError.unauthorised("A bearer token is required."));
    return;
  }
  try {
    const decoded = await auth().verifyIdToken(token, true /* checkRevoked */);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn("ID token verification failed", {
      requestId: req.requestId,
      action: "auth.verify",
      errorName: error instanceof Error ? error.name : typeof error,
    });
    next(AppError.unauthorised("The authentication token is invalid or expired."));
  }
}

/**
 * Require a verified administrator. Admin status comes exclusively from the
 * server-set `admin` custom claim — never from a client-supplied flag, query
 * parameter or Firestore field.
 */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    next(AppError.unauthorised());
    return;
  }
  const claims = req.user;
  const isAdmin = claims.admin === true;
  if (!isAdmin) {
    logger.warn("Admin authorization denied", {
      requestId: req.requestId,
      action: "admin.authorize",
      actorType: "admin",
      result: "DENIED",
      uid: claims.uid,
    });
    next(AppError.forbidden("Administrator privileges are required."));
    return;
  }
  if (!claims.email_verified) {
    next(AppError.forbidden("The administrator email address is not verified."));
    return;
  }
  req.admin = { uid: claims.uid, email: claims.email ?? null };
  next();
}

/** Convenience guard combining authentication and admin authorization. */
export const adminGuards = [authenticate, requireAdmin];

/**
 * Reauthentication guard for higher-risk actions (exports, configuration
 * changes). The client must present a fresh ID token whose auth_time is within
 * the supplied window (default 5 minutes).
 */
export function requireRecentAuth(maxAgeSeconds = 300) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorised());
      return;
    }
    const authTime = req.user.auth_time ?? 0;
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds - authTime > maxAgeSeconds) {
      next(
        new AppError(
          403,
          "REAUTH_REQUIRED",
          "Please reauthenticate before performing this action.",
        ),
      );
      return;
    }
    next();
  };
}
