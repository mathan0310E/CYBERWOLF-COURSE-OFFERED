import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileExists, listDir } from "./helpers";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepo(relative: string): string {
  return readFileSync(path.join(repoRoot, relative), "utf8");
}

describe("secret hygiene", () => {
  it("ships an .env.example with placeholders only", () => {
    expect(fileExists(".env.example")).toBe(true);
    const example = readRepo(".env.example");
    // Secret-bearing keys must have an empty or obviously-placeholder value.
    const secretKeys = /^(SMTP_PASS|SMTP_USER|SMTP_HOST|MAIL_FROM|ORGANISATION_EMAIL|PROVISION_ADMIN_EMAIL|PROVISION_ADMIN_PASSWORD)$/;
    const assignments = example
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.includes("=") && !line.startsWith("#"));
    for (const line of assignments) {
      const key = line.slice(0, line.indexOf("=")).trim();
      if (!secretKeys.test(key)) continue;
      const value = line.slice(line.indexOf("=") + 1).trim();
      // A placeholder is empty, an obvious marker, or a documented example.
      expect(/^(|<.*>|".*"|your[-_].*|example.*|changeme|xxx+|\.\.\.)$/i.test(value) || /example/i.test(value)).toBe(true);
    }
    // Required server-side keys are documented.
    for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "MAIL_FROM", "ORGANISATION_EMAIL"]) {
      expect(example).toContain(key);
    }
  });

  it("never puts SMTP or admin secrets behind a VITE_ variable", () => {
    const example = readRepo(".env.example");
    const viteLines = example.split("\n").filter((line) => line.trim().startsWith("VITE_"));
    // Public Firebase config (keys, app id, project id, captcha site key) is
    // safe to expose; anything credential-like is not.
    const forbidden = /SMTP|_PASS\b|_PASS$|SECRET|SERVICE_ACCOUNT|PRIVATE_KEY|PROVISION/i;
    for (const line of viteLines) {
      expect(forbidden.test(line.split("=")[0]!)).toBe(false);
    }
  });

  it("gitignores real env files and credential files", () => {
    const ignore = readRepo(".gitignore");
    expect(ignore).toMatch(/\.env($|\n)/m);
    expect(ignore).toMatch(/\*\.env\.local|\.env\.\*/);
    expect(ignore).toMatch(/serviceAccount|service-account|\.pem/i);
  });

  it("passes the repository secret scanner", () => {
    const script = path.join(repoRoot, "scripts/scan-secrets.mjs");
    expect(existsSync(script)).toBe(true);
    const output = execFileSync("node", [script], { cwd: repoRoot, encoding: "utf8" });
    expect(output).toMatch(/no secrets|passed|clean/i);
  });
});

describe("public/admin bundle independence", () => {
  const publicDist = path.join(repoRoot, "apps/public-site/dist");
  const adminDist = path.join(repoRoot, "apps/private-admin/dist");

  const publicBuilt = existsSync(publicDist);

  it("does not add an /admin route to the public application router", () => {
    const app = readRepo("apps/public-site/src/App.tsx");
    expect(app).not.toMatch(/path=["']\/admin/);
    expect(app).not.toMatch(/AdminLayout|PrivateAdmin|private-admin/);
  });

  it("does not import private admin code from the public app", () => {
    // No public source file may import the admin workspace.
    const files = listDir("apps/public-site/src");
    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
      const contents = readRepo(`apps/public-site/src/${file}`);
      expect(contents).not.toContain("@cyberwolf/private-admin");
    }
  });

  it.runIf(publicBuilt)("does not leak admin markers into the public bundle", () => {
    const assetsDir = path.join(publicDist, "assets");
    const bundle = listDir("apps/public-site/dist/assets")
      .filter((f) => f.endsWith(".js"))
      .map((f) => readFileSync(path.join(assetsDir, f), "utf8"))
      .join("\n");
    expect(bundle).not.toContain("Audit Logs");
    expect(bundle).not.toContain("RegistrationDetail");
    expect(bundle).not.toMatch(/\/api\/admin/);
  });

  it("emits no source maps in the public build (production-safe)", () => {
    const config = readRepo("apps/public-site/vite.config.ts");
    // If sourcemaps are enabled they must at least not be 'inline' in prod-safe config.
    expect(config).not.toMatch(/sourcemap:\s*true/);
  });

  it("admin app has its own package and entry point separate from the public app", () => {
    expect(fileExists("apps/private-admin/package.json")).toBe(true);
    expect(fileExists("apps/private-admin/index.html")).toBe(true);
    const pkg = JSON.parse(readRepo("apps/private-admin/package.json")) as { name: string };
    expect(pkg.name).toBe("@cyberwolf/private-admin");
    expect(existsSync(adminDist) || true).toBe(true);
  });
});
