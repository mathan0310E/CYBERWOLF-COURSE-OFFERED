# AGENTS.md — repository notes

CyberWolf 360 monorepo: two independent Vite apps + Express/Firebase backend.

## Build order matters
`npm run build` runs packages in dependency order: **shared-types → pricing → validation**,
then functions, then both apps. `validation` imports `MAX_COURSES` from `pricing`, so
pricing must be built first (build:packages encodes this).

## Commands
- `npm run build` — packages, functions, both apps.
- `npm run typecheck` — strict TS across all workspaces.
- `npm run lint` — eslint, `--max-warnings=0`.
- `npm run test` — unit + integration (no Java needed; boundaries faked).
- `npm run test:security` — rules structure + secret hygiene + bundle independence.
- `npm run test:e2e` — Playwright (chromium only; mobile project uses Pixel 7 because
  WebKit is not installed here).
- `npm run scan:secrets` — must pass.

## Testing approach
Firestore/Storage/SMTP are replaced with **in-memory fakes** (`tests/fakes/`), not with
mock modules — the real service/router/audit/email code runs unchanged. The fake
`runTransaction` buffers writes and commits atomically, and serialises transactions, so the
audit sequence allocator can be tested under concurrency. `vi.mock` factories are lazy, so
test `beforeEach` resets must guard for `undefined` on first run.

Emulator-backed rules tests auto-skip when Java is absent (`tests/security/helpers.ts`).
Java is NOT installable in this sandbox.

## Conventions / gotchas
- Pricing constants live ONLY in `packages/pricing`. Never trust a client price; the
  registration Zod schema is `.strict()` so extra keys (e.g. `finalPrice`) are rejected.
- Admin is granted ONLY via the server-set `admin: true` custom claim, checked by both the
  backend and the Firestore/Storage rules. The public app deliberately has no `/admin` route.
- Audit TXT files are immutable per-event chunks with a manifest hash chain; never
  download-mutate-upload a shared daily file.
- The admin `/api/admin/emails` route must project fields; never return the stored private
  `recipient` or `details` (they contain the student email). Only `maskedRecipient` is shown.
- Logging/audit details pass through `sanitizeDetails` / `redact` — no secrets, newlines
  collapsed.
- Privacy consent is a `boolean` field with a `=== true` refinement (not `z.literal(true)`)
  so form typing stays `boolean`.
- `typecheck` for the apps MUST be plain `tsc -b` (project references are `noEmit`). Never
  add `--noEmit false` / `--emitDeclarationOnly false`: that makes tsc write compiled `.js`
  next to the `.ts/.tsx` sources, and Vite resolves `.js` before `.tsx`, so stale emitted
  files can shadow real source and get committed. `apps/*/src/**/*.js` is gitignored as a
  guard; if you see tracked `.js` under `apps/*/src`, delete and re-verify.
- The brand mark is the owner-provided emblem in `apps/*/public/cyberwolf-logo.png`, rendered
  by each app's `Brand` component. Verified company contact values live in `COMPANY`
  (`packages/shared-types`); do not invent additional contact details, logos or statistics.
