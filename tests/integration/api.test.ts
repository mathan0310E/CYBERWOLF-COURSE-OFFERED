import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

/**
 * HTTP API integration tests.
 *
 * The Firebase Admin SDK boundary (Firestore, Storage, ID-token verification) is
 * faked, but the real Express app — routing, validation, pricing, authorization,
 * security headers, CORS and rate limiting — runs unchanged.
 */

vi.mock("@backend/shared/admin-app", async () => {
  const { FakeFirestore } = await import("../fakes/firestore");
  const { FakeStorage } = await import("../fakes/storage");
  const db = new FakeFirestore();
  const storage = new FakeStorage();
  (globalThis as Record<string, unknown>).__fwApiFakes = { db, storage };
  return {
    db: () => db,
    storage: () => storage,
    getAdminApp: () => ({ options: { projectId: "demo-cyberwolf360" } }),
    auditBucketName: () => "demo-cyberwolf360.appspot.com",
    auth: () => ({
      verifyIdToken: async (token: string) => {
        if (token === "admin-token") {
          return {
            uid: "admin-uid",
            email: "admin@example.com",
            email_verified: true,
            admin: true,
            auth_time: Math.floor(Date.now() / 1000),
          };
        }
        if (token === "user-token") {
          return {
            uid: "user-uid",
            email: "user@example.com",
            email_verified: true,
            admin: false,
            auth_time: Math.floor(Date.now() / 1000),
          };
        }
        throw new Error("invalid token");
      },
    }),
  };
});

beforeEach(() => {
  // The mock factory is lazy; the fakes only exist after the first import.
  const holder = (globalThis as Record<string, unknown>).__fwApiFakes as
    | { db: { reset(): void }; storage: { reset(): void } }
    | undefined;
  holder?.db.reset();
  holder?.storage.reset();
});

async function app() {
  const { buildApp } = await import("@backend/app");
  return buildApp();
}

const validBody = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  mobile: "+91 98765 43210",
  courseIds: ["cyber-security"],
  privacyConsent: true,
};

describe("public registration endpoint", () => {
  it("returns 201 with a real reference and server-calculated price", async () => {
    const server = await app();
    const response = await request(server).post("/api/registrations").send(validBody);
    expect(response.status).toBe(201);
    expect(response.body.reference).toMatch(/^CW-\d{8}-[0-9A-F]{8}$/);
    expect(response.body.price.finalPrice).toBe(8_500);
    expect(response.body.firstTimeEmail).toBe(true);
  });

  it("rejects an invalid body with 422 and safe field issues", async () => {
    const server = await app();
    const response = await request(server)
      .post("/api/registrations")
      .send({ ...validBody, email: "nope", privacyConsent: false });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.requestId).toBeTruthy();
    expect(Array.isArray(response.body.error.issues)).toBe(true);
    // No internal details leak.
    expect(JSON.stringify(response.body)).not.toContain("at Object");
  });

  it("rejects a client-supplied price field (strict schema)", async () => {
    const server = await app();
    const response = await request(server)
      .post("/api/registrations")
      .send({ ...validBody, finalPrice: 1 });
    expect(response.status).toBe(422);
  });

  it("rejects three courses", async () => {
    const server = await app();
    const response = await request(server)
      .post("/api/registrations")
      .send({ ...validBody, courseIds: ["cyber-security", "ai-web-development", "ethical-hacking"] });
    expect(response.status).toBe(422);
  });

  it("echoes a client request id for correlation", async () => {
    const server = await app();
    const response = await request(server)
      .post("/api/registrations")
      .set("X-Request-Id", "correlation-123")
      .send({ ...validBody, email: "corr@example.com" });
    expect(response.headers["x-request-id"]).toBe("correlation-123");
  });
});

describe("admin authorization", () => {
  it("denies an unauthenticated request with 401", async () => {
    const server = await app();
    const response = await request(server).get("/api/admin/registrations");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORISED");
  });

  it("denies a non-admin token with 403", async () => {
    const server = await app();
    const response = await request(server)
      .get("/api/admin/registrations")
      .set("Authorization", "Bearer user-token");
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("denies a malformed token with 401", async () => {
    const server = await app();
    const response = await request(server)
      .get("/api/admin/registrations")
      .set("Authorization", "Bearer garbage");
    expect(response.status).toBe(401);
  });

  it("allows a verified admin token", async () => {
    const server = await app();
    const response = await request(server)
      .get("/api/admin/registrations")
      .set("Authorization", "Bearer admin-token");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("items");
    expect(response.body).toHaveProperty("total");
  });

  it("confirms the session for an admin", async () => {
    const server = await app();
    const response = await request(server)
      .get("/api/admin/session")
      .set("Authorization", "Bearer admin-token");
    expect(response.status).toBe(200);
    expect(response.body.admin).toBe(true);
    expect(response.body.uid).toBe("admin-uid");
  });

  it("never returns the private recipient address in the email listing", async () => {
    const server = await app();
    await request(server).post("/api/registrations").send({ ...validBody, email: "priv@example.com" });
    const response = await request(server)
      .get("/api/admin/emails")
      .set("Authorization", "Bearer admin-token");
    expect(response.status).toBe(200);
    const serialized = JSON.stringify(response.body);
    expect(serialized).not.toContain("priv@example.com");
    expect(serialized).toContain("*");
  });
});

describe("admin audit viewer", () => {
  it("rejects unauthenticated audit access", async () => {
    const server = await app();
    const response = await request(server).get("/api/admin/audit");
    expect(response.status).toBe(401);
  });

  it("lists audit dates, streams the day's TXT and downloads it", async () => {
    const server = await app();
    // Generate an audit event via a real registration.
    await request(server).post("/api/registrations").send({ ...validBody, email: "audit-view@example.com" });

    const datesResponse = await request(server)
      .get("/api/admin/audit/dates")
      .set("Authorization", "Bearer admin-token");
    expect(datesResponse.status).toBe(200);
    expect(datesResponse.body.dates.length).toBeGreaterThanOrEqual(1);
    const date = datesResponse.body.dates[0] as string;

    const auditResponse = await request(server)
      .get(`/api/admin/audit?date=${date}&category=registration`)
      .set("Authorization", "Bearer admin-token");
    expect(auditResponse.status).toBe(200);
    expect(auditResponse.body.raw).toContain("CYBERWOLF 360 — AUDIT EVENT");
    expect(Array.isArray(auditResponse.body.events)).toBe(true);

    const downloadResponse = await request(server)
      .get(`/api/admin/audit/download?date=${date}&category=registration`)
      .set("Authorization", "Bearer admin-token");
    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.headers["content-type"]).toContain("text/plain");
    expect(downloadResponse.headers["content-disposition"]).toContain("attachment");
    expect(downloadResponse.text).toContain("CYBERWOLF 360 — AUDIT EVENT");
    expect(downloadResponse.headers["cache-control"]).toContain("no-store");
  });

  it("records an audit trail entry when the audit log is downloaded", async () => {
    const server = await app();
    await request(server)
      .get("/api/admin/audit/download")
      .set("Authorization", "Bearer admin-token");
    // The download itself is recorded as an admin event today.
    const today = new Date().toISOString().slice(0, 10);
    const auditResponse = await request(server)
      .get(`/api/admin/audit?date=${today}&category=audit`)
      .set("Authorization", "Bearer admin-token");
    expect(auditResponse.body.events.some((e: { action: string }) => e.action === "audit.downloaded")).toBe(true);
  });
});

describe("security headers and CORS", () => {
  it("sets restrictive security headers", async () => {
    const server = await app();
    const response = await request(server).get("/health");
    expect(response.status).toBe(200);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["content-security-policy"]).toContain("default-src 'none'");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("allows the configured public-site origin", async () => {
    const server = await app();
    const response = await request(server)
      .get("/health")
      .set("Origin", "http://localhost:5173");
    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  it("rejects an unknown origin", async () => {
    const server = await app();
    const response = await request(server)
      .get("/health")
      .set("Origin", "https://evil.example");
    expect(response.status).toBe(403);
  });

  it("returns 404 for unknown routes with a safe body", async () => {
    const server = await app();
    const response = await request(server).get("/api/nope");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
});
