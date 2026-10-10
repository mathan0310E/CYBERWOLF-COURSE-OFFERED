import express from "express";
import helmet from "helmet";
import { buildCors, appCheckGuard, authLimiter } from "./security/middleware";
import { attachRequestId, errorMiddleware, limitBodySize } from "./shared/http";
import { registrationsRouter } from "./registrations/routes";
import { adminRouter } from "./admin/routes";

/**
 * Build the trusted backend Express application. This is exported separately
 * from the Cloud Function entry point so it can be exercised directly in tests.
 */
export function buildApp(): express.Express {
  const app = express();
  app.disable("x-powered-by");
  // Trust the first proxy hop (Firebase Hosting / Cloud Run) for correct IPs.
  app.set("trust proxy", 1);

  // Restrictive security headers. This is a JSON API, so the CSP denies
  // everything by default.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          "default-src": ["'none'"],
          "frame-ancestors": ["'none'"],
          "base-uri": ["'none'"],
          "form-action": ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "same-site" },
      referrerPolicy: { policy: "no-referrer" },
      hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true },
      frameguard: { action: "deny" },
      noSniff: true,
    }),
  );

  app.use(buildCors());
  app.use(express.json({ limit: "64kb" }));
  app.use(limitBodySize(64 * 1024));
  app.use(attachRequestId);
  app.use(appCheckGuard);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "cyberwolf360-api", time: new Date().toISOString() });
  });

  app.use("/api/registrations", registrationsRouter);
  app.use("/api/admin", authLimiter, adminRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "Route not found.", requestId: "unknown" },
    });
  });

  app.use(errorMiddleware);
  return app;
}
