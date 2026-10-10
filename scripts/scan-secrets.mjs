#!/usr/bin/env node
/**
 * Secret-leak scanner.
 *
 * Fails the build if it finds:
 *  - real secret values committed to tracked source files,
 *  - secrets placed in VITE_* variables (which Vite embeds in the client bundle),
 *  - committed .env files (other than .env.example),
 *  - committed service-account JSON files.
 *
 * Run: npm run scan:secrets
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const failures = [];

function gitFiles() {
  try {
    return execSync("git ls-files", { encoding: "utf8" })
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const files = gitFiles();

// 1 — Committed environment / credential files.
for (const file of files) {
  const base = file.split("/").pop() ?? file;
  if (/^\.env($|\.)/.test(base) && base !== ".env.example") {
    failures.push(`Committed environment file: ${file}`);
  }
  if (/service[-_]?account/i.test(base) && base.endsWith(".json")) {
    failures.push(`Committed service-account file: ${file}`);
  }
  if (base === "firebase.json" || base === ".firebaserc") continue;
  if (/firebase-adminsdk.*\.json$/i.test(base)) {
    failures.push(`Committed Firebase admin SDK key: ${file}`);
  }
}

// 2 — Secrets in VITE_* variables. Vite exposes these to the browser.
const SECRET_PATTERNS = [
  { name: "SMTP password", re: /SMTP_PASS\s*=\s*\S+/i },
  { name: "SMTP host", re: /SMTP_HOST\s*=\s*\S+/i },
  { name: "SMTP user", re: /SMTP_USER\s*=\s*\S+/i },
  { name: "service account key", re: /"private_key"\s*:\s*"-----BEGIN/ },
  { name: "Google API key literal", re: /AIza[0-9A-Za-z_-]{35}/ },
];

const CODE_EXTENSIONS = /\.(ts|tsx|js|mjs|cjs|json|md|env|example)$/;

for (const file of files) {
  if (!CODE_EXTENSIONS.test(file)) continue;
  if (file === ".env.example") continue;
  if (!existsSync(file)) continue;
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  for (const line of content.split("\n")) {
    // Only flag VITE_-prefixed assignment of a secret-looking key.
    const viteSecret = /VITE_[A-Z0-9_]*(PASS|SECRET|SERVICE|TOKEN|CREDENTIAL|PRIVATE|SMTP)[A-Z0-9_]*\s*=\s*\S+/i;
    if (viteSecret.test(line)) {
      failures.push(`Secret-looking VITE_ variable in ${file}: ${line.trim().slice(0, 80)}`);
    }
  }

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.re.test(content)) {
      // Allow documentation/placeholders that use angle brackets or empty values.
      const match = content.match(pattern.re);
      const matched = match ? match[0] : "";
      const looksLikePlaceholder =
        matched.includes("<") ||
        matched.includes("YOUR_") ||
        matched.includes("example") ||
        matched.includes("xxxx") ||
        /=\s*$/.test(matched);
      if (!looksLikePlaceholder) {
        failures.push(`Possible ${pattern.name} in ${file}: ${matched.slice(0, 60)}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Secret scan FAILED:\n" + failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}

console.log("Secret scan passed: no committed secrets, no secret-looking VITE_ variables.");
