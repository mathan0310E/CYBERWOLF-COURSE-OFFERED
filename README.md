# CyberWolf 360 — Course Registration Platform

**Learn. Secure. Build.**

A production-grade course registration platform built as an npm-workspaces monorepo.
It consists of **two entirely independent Vite applications**, a trusted Node.js/Firebase
backend, a plain-text (`.txt`) audit-log system in Firebase Storage, and a Nodemailer
email workflow.

---

## 1. Architecture at a glance

```
cyberwolf360/
  apps/
    public-site/        # Independent Vite app: marketing site + registration form
    private-admin/      # Independent Vite app: administrator console (separate build/deploy)
  functions/            # Trusted backend (Express + Firebase Admin SDK + Nodemailer)
    src/
      registrations/    # Public registration API + service
      admin/            # Admin API (auth-guarded)
      security/         # Token verification, admin guard, rate limiting, CORS
      audit/            # Durable plain-text TXT audit writer + formatter
      email/            # Nodemailer transport + durable job processor + templates
      shared/           # Config, Firebase Admin singletons, HTTP helpers, logger
  packages/
    shared-types/       # Non-sensitive types + course catalogue (single source of truth)
    pricing/            # The ONLY place pricing constants/functions live
    validation/         # Zod schemas shared by client preview AND server authority
  firebase/
    firestore.rules     # Deny-by-default
    storage.rules       # Deny-by-default (audit TXT is backend-only)
    firestore.indexes.json
  tests/
    unit/               # Pricing, validation, audit format, email helpers
    integration/        # Registration, audit concurrency, email workflow, HTTP API
    security/           # Firestore/Storage rules + secret hygiene + bundle independence
    e2e/                # Playwright: public site (desktop+mobile) + admin gate
  scripts/              # Admin provisioning + secret scanner
  firebase.json
  .env.example
```

### The two applications are genuinely separate

The admin console is **not** a route, subpage, nested component, or bundled module of the
public site:

* Each app has its own `index.html`, `vite.config.ts`, component tree, router, package,
  build output and deployment target.
* The public app's router (`apps/public-site/src/App.tsx`) has **no** `/admin` route.
* The public build never imports `@cyberwolf/private-admin` (enforced by a security test).
* Deploy the admin app **behind a restricted network boundary** (VPN / IP allow-list /
  Firebase App Check + Identity Platform). Firebase Hosting targets exist for convenience,
  but a Hosting-only admin console should still be network-restricted.

---

## 2. Business data (confirmed)

| Selection | Original | Offer | Savings |
|-----------|---------:|------:|--------:|
| Zero courses | ₹0 | ₹0 | ₹0 (submission disabled) |
| One course | ₹12,000 | ₹8,500 | ₹3,500 |
| Two courses | ₹24,000 (assumed) | ₹12,500 | ₹11,500 (assumed) |
| More than two | — | — | **rejected** |

Courses: **Cyber Security**, **AI & Web Development**, **Ethical Hacking**.

Pricing lives in exactly one place — `packages/pricing/src/index.ts`. The frontend uses it
for a *preview*; the trusted backend uses the **same function** to compute the
authoritative amount. A client-supplied price is never trusted (the registration schema is
`zod.strict()` and rejects unknown keys such as `finalPrice`).

There is **no payment gateway** (none was requested).

### Brand and contact details

The official Cyber Wolf emblem is used as the brand mark in both applications
(the `cyberwolf-logo.png` emblem is downloaded and downscaled from the Cyber Wolf
website — https://www.cyberwolf360.in/logo/cyberwolf.png — together with a multi-size
`favicon.ico`, `apple-touch-icon.png` and a 512px `cyberwolf-logo-512.png` social/OG
image). It is rendered by a small `Brand` component in each app. No logo is invented.

The only company details used are the verified values in `COMPANY`
(`packages/shared-types/src/index.ts`), sourced from the published Organization/Person
structured data and footer of the Cyber Wolf website (cyberwolf360.in) and surfaced in
the public footer, the About page, the Privacy Policy, the `index.html` JSON-LD and the
transactional email footers:

- Name: `Cyber Wolf` (brand shown as `CyberWolf 360`)
- Email: `info@cyberwolf360.in` (support `contact@cyberwolf360.in`, events `events@cyberwolf360.in`)
- Phone: `+91 63798 69678`, `+91 78259 88139`
- Website: `https://www.cyberwolf360.in`
- Address: No. 3A, 10th Street, Gandhi Nagar, Tiruvannamalai, Tamil Nadu 606601
- Founder: Tamilselvan S (Founder & CEO, CISO)
- Social: LinkedIn (`cyberwolf-team`), Instagram (`cyber_wolf_team`), a WhatsApp channel

No other contact details, testimonial, partner or statistic is invented.

---

## 3. Prerequisites

* Node.js >= 20 and npm.
* Java (JRE 11+) **only** if you want to run the Firebase Emulator Suite and the
  emulator-backed security-rule tests.
* A Firebase project (separate dev and prod projects recommended).

---

## 4. Installation

```bash
npm install
cp .env.example .env      # then fill in real values locally (never commit .env)
```

`npm install` uses npm workspaces and a committed `package-lock.json`.

---

## 5. Vite commands

Each app builds completely independently:

```bash
npm run dev:public      # public site on http://localhost:5173
npm run build:public    # -> apps/public-site/dist
npm run dev:admin       # admin app on http://localhost:5174
npm run build:admin     # -> apps/private-admin/dist

npm run build:packages  # shared-types -> pricing -> validation
npm run build:functions # compiled backend (functions/lib)
npm run build           # everything, in dependency order
npm run typecheck       # strict TS across all workspaces
npm run lint            # eslint
```

> Environment variables prefixed `VITE_` are **embedded in the client bundle**. They are
> for public Firebase config and the API base URL only. SMTP credentials, service-account
> keys and admin provisioning secrets must stay server-side (see `.env.example`).

---

## 6. Environment variables

Two groups (see `.env.example`):

**Public (`VITE_*`)** — safe to expose: the Firebase web config for each app, the public
reCAPTCHA site key, and `VITE_API_BASE_URL`.

**Server-only** — never prefixed with `VITE_`:

```
SMTP_HOST= SMTP_PORT= SMTP_SECURE= SMTP_USER= SMTP_PASS= MAIL_FROM= ORGANISATION_EMAIL=
PUBLIC_SITE_URL= ADMIN_APP_URL= ALLOWED_ORIGINS=
AUDIT_BUCKET=            # optional; defaults to the project's default bucket
PROVISION_ADMIN_EMAIL= PROVISION_ADMIN_PASSWORD=   # provisioning script only
```

In production load server-only values from a secret manager (e.g. Google Secret Manager)
into the Cloud Functions runtime — never from a committed file.

---

## 7. Firebase configuration

```bash
firebase login
firebase use --add          # select your project, alias it
```

`firebase.json` wires:

* Firestore rules + indexes (`firebase/firestore.rules`, `firebase/firestore.indexes.json`).
* Storage rules (`firebase/storage.rules`).
* Functions (`functions/`, Node 20, predeploy build).
* Two Hosting targets: `public-site` (cacheable assets, no-cache index) and
  `private-admin` (private, `no-store`, `noindex`).

Enable in the console: **Authentication (Email/Password)**, **Cloud Firestore**,
**Cloud Storage**, and (where supported) **App Check**.

---

## 8. Administrator provisioning

There is **no public administrator signup**.

1. Provision with the trusted script (needs a service account with the Admin SDK, run
   locally or in a trusted environment):

   ```bash
   PROVISION_ADMIN_EMAIL=admin@example.com \
   PROVISION_ADMIN_PASSWORD='a-strong-password' \
   npm run provision:admin
   ```

   Or create the user manually in **Firebase Console → Authentication** and set the
   custom claim there via a trusted script.

2. The script sets the **`admin: true` custom claim** from trusted server-side code only.
   The backend and Firestore/Storage rules both require this claim — a client-supplied
   admin flag, a Firestore field, or a URL parameter can never grant admin.

3. Sign in to the admin app with email/password. Password recovery is handled by Firebase
   Auth's reset email.

### Authentication method statement

**Email/password is the configured authentication method.** Multi-factor authentication is
**not** enabled by default in this build. If you enable it (e.g. Identity Platform MFA or
TOTP), update the admin login flow and document it — do not claim MFA is active otherwise.

Higher-risk admin actions (data export) additionally require a **fresh ID token**
(`requireRecentAuth(300)` — reauthentication within 5 minutes).

---

## 9. Firestore data model

| Collection | Purpose | Client access |
|------------|---------|---------------|
| `registrations` | One document per registration (server-generated id + reference, validated student details — name, email, mobile, **college / institution, degree / programme, year of study**, optional city and message, selected courses, server-calculated `price`, timestamp, status, consent). | Registrant may read **only their own** (`ownerUid == uid`); admin may read. **No client writes.** |
| `emailProfiles` | Race-safe first-time detection keyed by a SHA-256 of the normalized email. | Admin read only. |
| `notificationJobs` | Durable email outbox (masked recipient + private recipient + template + status + attempts). | Admin read only. |
| `auditEvents` | Durable audit outbox feeding the TXT writer. | Admin read only. |
| `auditManifests` | Per-day per-category sequence + hash-chain tip. | Admin read only. |
| `adminSettings` | Only where necessary. | Admin read only. |

No passwords or SMTP secrets are ever stored in Firestore. Public registration goes through
a narrowly-scoped, validated backend operation — never a direct client write.

---

## 10. Plain-text audit logs

The primary human-readable audit artifact is **actual `.txt` files** in Firebase Storage,
laid out by UTC date:

```
audit-logs/YYYY/MM/DD/<category>-YYYY-MM-DD-NNNNNN.txt
```

Categories: `audit`, `registration`, `admin`, `security`, `email`, `errors`.

### Why chunks, not append

Firebase Storage has **no append operation**. Rather than have concurrent requests
download → mutate → re-upload one daily file (which corrupts data), the writer:

1. Durably queues the event in `auditEvents`.
2. A **transaction** reserves a per-(date, category) sequence number from
   `auditManifests` — concurrent writers never collide.
3. Uploads an **immutable, uniquely named** `.txt` chunk at a deterministic path
   (so retries are idempotent overwrites of the same chunk).
4. Extends a **hash chain** in the manifest (`lastHash`) for tamper evidence.
5. A scheduled flush plus the immediate best-effort flush reconcile any queued events.

The admin viewer concatenates a day's chunks in sequence order to reconstruct the daily TXT.

### Event format

```
============================================================
CYBERWOLF 360 — AUDIT EVENT
============================================================
Timestamp: <server-generated UTC>
Actor Type: admin | registrant | visitor | system
Actor ID: <verified or pseudonymous>
Action: registration.created
Resource Type: registration
Resource ID: <server-generated reference>
Result: SUCCESS | FAILURE | DENIED
Source: public-site | private-admin | backend
Request ID: <correlation id>
Category: registration
Details: <sanitized description>
============================================================
```

Details are sanitized: newlines collapsed (a log line cannot be forged), credential-like
patterns redacted, length bounded. Passwords, tokens, SMTP secrets and service-account keys
are never recorded.

### Admin audit viewer

Date selection, category filter, search by action/resource, actor and result filters,
original TXT viewing, TXT download, and filtered export. Every retrieval and export
requires server-verified administrator authorization and is itself audited.

---

## 11. Email system (Nodemailer)

Nodemailer runs **only** on the trusted backend. Credentials are read in one module
(`functions/src/email/transport.ts`) and never reach the browser. In the emulator a JSON
transport is used, so tests never contact a real mail server.

### Durable workflow

1. Validate → 2. recalculate price → 3. store registration → 4. create durable
`notificationJobs` → 5. record the audit event → 6. process jobs → 7. record outcomes →
8. retry transient failures with bounded backoff → 9. update admin Email Activity.

A failed email **never** deletes a successful registration. Deterministic job ids
(`<registrationId>__<recipientType>`) plus an idempotency key mean retries never send
duplicates.

### Messages

* **First registration from a new normalized email** → two messages: an organisation
  notification (*"New Course Registration — CyberWolf 360"*) and a student confirmation
  (*"Your CyberWolf 360 Registration Has Been Received"*).
* **Every subsequent registration** → organisation + student, using the **repeat**
  variants (no first-time welcome).
* First-time status is decided on the backend, race-safely, using normalized emails.
  Plus-addressing is preserved (no alias stripping).
* Statuses distinguish `queued`, `processing`, `accepted` (SMTP accepted — **not** proof of
  delivery) and `failed`. No message claims delivery merely on SMTP acceptance.

All templates state that submission does **not** guarantee admission or payment, escape
user-controlled values in HTML, and carry the **Learn. Secure. Build.** tagline.

---

## 12. Security model

**Browser/frontend** — HTTPS in production, restrictive CSP and security headers (set by
`helmet` on the backend; configure equivalent headers on the static hosts), no unsafe HTML
injection, validated navigation, no secrets in the bundle, no source maps, private
`cache-control` on admin responses, no sensitive data in `localStorage`, no credentials in
URLs. Admin bundles are marked `noindex`.

**Backend** — Zod validation on bodies and queries, request-size limits, rate limiting on
registration and sensitive endpoints, request IDs for correlation, safe error messages,
duplicate-submission prevention, verified ID tokens, independent admin authorization on
every privileged endpoint, CORS allow-list (never treated as authentication), and no trust
in user-supplied roles/ids/prices/timestamps.

**Firebase** — deny-by-default Firestore and Storage rules; private records protected;
students cannot read other registrations or write audit logs; no user can grant themselves
admin; App Check is enforced after validating production traffic and is never a substitute
for auth/authz. Rules are tested with the emulator.

**Secrets** — SMTP and Admin SDK credentials stay server-side; `.env` and credential files
are gitignored; a `scripts/scan-secrets.mjs` scanner runs in CI; rotate anything exposed.

---

## 13. Testing

```bash
npm run test           # unit + integration (no Java/emulator needed)
npm run test:security  # rules + secret hygiene + bundle independence
npm run test:e2e       # Playwright: public site (desktop+mobile) + admin gate
npm run test:all       # all of the above
```

* **Unit** — pricing (0/1/2/3-course cases, order/duplication, formatting), validation
  (consent, course bounds, email normalization incl. plus-addressing), audit formatting +
  sanitization, email templates + masking + SMTP error categorisation + log redaction.
* **Integration** — registration persistence, duplicate suppression, first-time vs repeat,
  durable jobs, audit write concurrency (unique sequence numbers), hash-chain linkage,
  failed-upload retry, email retries without duplicates, HTTP API (201/422/401/403/404,
  security headers, CORS, request ids, no PII in the admin email listing). The Firestore,
  Storage and SMTP **boundaries** are in-memory fakes; the real service/router/audit/email
  code runs unchanged.
* **Security** — structural rules assertions (always run) plus emulator-enforced rules
  tests (run when Java is present, skip cleanly otherwise); secret hygiene; public-bundle
  independence and no admin leakage.
* **E2E** — public hero/courses/pricing, course selection + price preview, successful and
  failed submission, input preservation + retry, inline validation, keyboard focus,
  reduced motion, and the admin login gate (no public signup, setup notice when Firebase
  is unconfigured).

Run the security tests in CI **before** deployment.

---

## 14. Emulator Suite

```bash
npm run emulators                                   # start Firestore/Auth/Storage/Functions/Hosting
npm run emulators:exec -- "npm run test:security"   # run tests against the emulators
```

Requires Java. Emulator-backed tests auto-skip when Java is unavailable so CI without Java
stays green.

---

## 15. Deployment

Both apps deploy independently:

```bash
npm run build                 # builds packages, functions, both apps
firebase deploy --only functions
firebase deploy --only hosting:public-site
firebase deploy --only hosting:private-admin
```

Prefer deploying the admin app behind a restricted network boundary. Do not deploy
permissive rules; deploy `firebase/firestore.rules` and `firebase/storage.rules` as
reviewed. Test production builds and security headers before promoting.

### Rollback

* Hosting is immutable per release — re-deploy a previous build (or use Firebase Hosting
  release rollback) to revert the frontends.
* Functions: redeploy the previous revision/commit. Keep the last known-good build.
* Rules: revert the rules file and redeploy; rules changes are versioned in git.

### Credential rotation

* SMTP: rotate the password in the provider, update the secret manager, redeploy functions.
* Firebase Admin SDK: rotate the service account key (or prefer keyless/Workload Identity),
  update the secret, redeploy.
* Firebase web config keys are public by design; restrict them with App Check + API key
  restrictions rather than treating them as secrets.

### Data retention

Define and enforce retention for `registrations`, `notificationJobs`/email activity, and
audit `.txt` files (e.g. a scheduled job that archives then deletes beyond your policy
window). Document the chosen windows in your Privacy Policy and keep exports minimal.

---

## 16. Privacy

`/privacy` and `/terms` describe data collection, registration processing, transactional
emails, service providers, retention and data-request procedures. Registration requires
explicit consent and does **not** opt the student into marketing email. Audit logs and
exports avoid unnecessary personal data; the admin email view shows only masked addresses.

---

## 17. Scripts reference

| Script | Purpose |
|--------|---------|
| `npm run provision:admin` | Create/update an admin Auth user and set the `admin` claim. |
| `npm run scan:secrets` | Fail if committed secrets or secret-looking `VITE_*` vars are found. |
| `npm run audit:security` | `npm audit --audit-level=high`. |
| `npm run lint` | ESLint across the repo. |
| `npm run typecheck` | Strict TS across all workspaces. |

---

## 18. Acceptance criteria

1. Both apps use Vite and build independently. ✅
2. The admin is not a public-site subpage. ✅
3. The public site shows the correct courses and prices. ✅
4. Registration data is stored securely. ✅
5. Email/password admin authentication works. ✅
6. Unauthorized users cannot access private data. ✅
7. Actual TXT audit files are stored in Firebase Storage. ✅
8. The admin can search and download TXT logs. ✅
9. Audit writes are durable under concurrency. ✅
10. Nodemailer sends the organisation and student messages. ✅
11. First-time and repeat registration behavior is correct. ✅
12. Failed emails are retried without duplicating registrations. ✅
13. Security rules and backend authorization tests pass. ✅
14. Secrets remain server-side. ✅
15. Automated tests and deployment documentation are complete. ✅
