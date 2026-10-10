import { Router, type Request, type Response } from "express";
import { registrationInputSchema } from "@cyberwolf/validation";
import { asyncHandler } from "../shared/http";
import { registrationLimiter } from "../security/middleware";
import { AppError } from "../shared/errors";
import { createRegistration } from "./service";
import { recordAuditEvent } from "../audit/writer";
import type { RegistrationReceipt } from "@cyberwolf/shared-types";

export const registrationsRouter = Router();

/**
 * POST /api/registrations
 *
 * The public, narrowly-scoped registration operation. Validates the body with
 * the shared Zod schema, recalculates the price server-side, deduplicates,
 * persists, and queues notification emails.
 */
registrationsRouter.post(
  "/",
  registrationLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const requestId = req.requestId ?? "unknown";
    const parsed = registrationInputSchema.safeParse(req.body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      await recordAuditEvent({
        actorType: "visitor",
        actorId: "anonymous",
        action: "registration.validation-failed",
        resourceType: "registration",
        resourceId: "-",
        result: "FAILURE",
        source: "public-site",
        requestId,
        details: `Validation failed: ${issues.map((i) => i.path).join(", ") || "unknown"}`,
        category: "security",
      });
      throw AppError.validation(issues);
    }

    const idempotencyKey = req.header("x-idempotency-key") ?? undefined;
    const result = await createRegistration({
      input: parsed.data,
      requestId,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });

    // Reference is stored alongside the document; read it back for the receipt.
    const receipt: RegistrationReceipt = {
      reference: result.registration.reference ?? result.registration.id,
      courseIds: result.registration.courseIds,
      price: result.registration.price,
      status: result.registration.status,
      createdAt: result.registration.createdAt,
      firstTimeEmail: result.firstTimeEmail,
    };

    res.status(result.duplicate ? 200 : 201).json(receipt);
  }),
);
