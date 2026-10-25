# Appistic v1.0.9 release report

Release/step: 1.0.9 security and compatibility hardening

Git base -> tested SHA: `d081552e2105b6f239fbed84bc1a2365e1810f8b` -> `d38586a85190d364af6f5dfd75ecce3216936a6d`

Status: BLOCKED

Changes:

- Replaced fallback/secret-derived password handling with bcrypt plus controlled legacy verification and rehash.
- Added database-backed revocable sessions, origin checks, rate limits, secure headers, production configuration checks, validation, and safe CSV/vCard output.
- Added personal organization and membership foundations, tenant ownership columns, entitlement centralization, migration/backfill, and transaction-locked Free limits.
- Hardened Paddle webhook signature/idempotency/order checks without claiming provider success.
- Added isolated security and database tests, CI workflow, migration runner, and release evidence.

Evidence:

- `test-evidence/unit-security.txt`: `npm run test` — PASS.
- `test-evidence/db-integration.txt`: isolated migration/integration run — PASS.
- `test-evidence/build-audit.txt`: typecheck, lint, build, schema check, and audit — PASS.
- `test-evidence/live-http.txt`: local authenticated/public HTTP smoke — PASS.
- `test-evidence/browser-smoke.txt` and `test-evidence/qr-semantics.txt`: desktop browser and stable QR behavior — PASS for executed scope.
- `gate-results.json` and `test-results.json`: fail-closed machine-readable status.

Security/compatibility: Local security, tenancy groundwork, legacy-record
backfill, transactional card limits, canonical URLs, direct view semantics,
QR redirect semantics, and dependency audit passed. The tested Free limit is
two cards, matching the supplied controller/acceptance requirements.

Provider/environment limitations: Staging, GitHub PR CI, official Paddle
sandbox, Stripe Connect, booking, paid-growth, owner approval, and production
smoke evidence are unavailable. The supplied packet also omits the controller-
referenced 1.0.9 and 1.1 phase files. The later 1.2/1.3/1.4/2.0 documents are
specifications, not proof of provider or production authorization.

Open failures: G0/G1/G2/G3/G4/G7/G8/G9 and the explicitly listed unresolved
acceptance tests remain BLOCKED. This release must not be called complete or
deployed.

Next authorized action: Provide the missing phase documents, staging access and
synthetic environment, official provider sandbox configuration, GitHub PR/CI
review, and explicit owner approval. Then rerun every BLOCKED acceptance test
and the release gatekeeper before any provider activation or deployment.
