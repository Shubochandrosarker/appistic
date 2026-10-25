# Appistic v1.0.9 release recovery report

Release/step: 1.0.9 security and release recovery
Git base -> tested SHA: `7536de3` -> `b0b9856981ac1cd7c3bc5e1741a737eee81b772a`
Deployment SHA: `3d53b63b8e5956a04aabe7deca7eb1dbbbd68530`
Status: BLOCKED (deployed, but release gates remain blocked)

## Changes and affected files

- Paddle subscription state is fail-closed: `transaction.completed` never grants Pro. Subscription state changes require a signed, timestamped, idempotent event, an Appistic-created checkout attempt, matching environment/customer/subscription/price/product, and monotonic `occurred_at` ordering. Checkout attempts are stored in `paddle_checkout_attempts`; new configuration includes `PADDLE_ENVIRONMENT` and `PADDLE_PRO_PRODUCT_ID`.
- Active and trialing subscription events grant/retain Pro; effective paused/canceled events revoke it. `past_due` and scheduled changes retain the current plan until Paddle sends an effective state; no new grace-period policy was invented. Existing Pro users remain compatible through their stored customer/subscription identifiers.
- v1.0.9 Free entitlement is one card and Pro is ten. Existing over-limit Free accounts are preserved and cannot create another card; no card is deleted or unpublished. The account-wide 50-lead monthly cap remains transactionally enforced.
- Public leads now require a published, lead-enabled card, bounded and validated input, and a valid email or phone. Successful capture records an event of type `lead`, not `view`.
- Owner analytics responses explicitly use `Cache-Control: private, no-store` and `Vary: Cookie`.
- Docker requires the committed lockfile with `npm ci`; `.dockerignore` excludes host dependencies, build output, secrets, and generated metadata. `tsconfig.tsbuildinfo` is no longer tracked. Zod was updated to `4.6.7` to clear the high-severity audit finding.
- Added migration `drizzle/0004_release_recovery.sql` and focused unit/database coverage.

## Evidence with exact commands and exit codes

- `npm ci --no-audit --no-fund` — PASS, exit 0; exact lockfile installation.
- `npm run test` — PASS, exit 0; 11 unit/security tests.
- `npm run typecheck` — PASS, exit 0.
- `npm run lint` — PASS, exit 0.
- `npm run db:check` — PASS, exit 0.
- `npm run db:migrate` on isolated PostgreSQL — PASS, exit 0; five migrations applied.
- migration replay with `npm run db:migrate` — PASS, exit 0.
- `npm run test:db` — PASS, exit 0; isolated PostgreSQL synthetic integration, concurrency, lead, analytics-header, and webhook cases.
- `npm run build` — PASS, exit 0.
- `npm audit --omit=dev --audit-level=high` — PASS, exit 0; 0 vulnerabilities after Zod update.
- standalone runtime smoke — PASS, exit 0; `/` returned 200 and unauthenticated `/api/track` returned 401.
- `git diff --check` — PASS, exit 0.

Detailed evidence is in `test-evidence/` and `test-results.json`.

## Authorized Hostinger deployment

The owner explicitly authorized deployment and a GitHub update on 2026-10-25.
The pushed recovery branch is `codex/appistic-hardening` at `3d53b63`. GitHub's
`Appistic CI` workflow was disabled manually before the push, so this update did
not trigger GitHub Actions.

Hostinger deployment evidence:

- `https://appistic.com/`, `/login`, and `/pricing` returned HTTP 200 through
  Cloudflare after cutover.
- The direct origin returned HTTP 200 for `/` and `/login`; unauthenticated
  analytics returned HTTP 401 with `Cache-Control: private, no-store` and
  `Vary: Cookie`.
- The active container is `appistic:3d53b63` on the Hostinger VPS. The previous
  `appistic:1.0.8` container is retained as
  `appistic-1.0.8-rollback-20261025`.
- The existing database was backed up before deployment. The migration ledger
  contains `0000` through `0004`; the additive recovery migrations completed.
- The deployed app log had no startup/runtime errors during the smoke window.

This is deployment and availability evidence, not proof of Paddle payment,
webhook reconciliation, browser/mobile/a11y acceptance, or release unblocking.

## Security and compatibility

The P0 billing grant path, Free-limit inconsistency, unpublished-card lead write, lead/view event confusion, analytics cache exposure, Docker install fallback, and tracked generated cache are fixed in source and covered locally. Existing card data, published state, slugs, and QR target routes are not modified by the recovery.

Official Paddle documentation confirms that `transaction.completed` describes a completed transaction, while subscription lifecycle events establish subscription state; Paddle requires event-id deduplication and `occurred_at` ordering. The implementation follows that boundary without making a live provider request.

## Provider and environment limitations

- GitHub Actions run `40203334605` on `main` failed before the job started because the GitHub account is locked due to a billing issue. It had no steps and no retrievable log archive. The CI gate is therefore BLOCKED, not PASS.
- The first local Docker build reached the lockfile install but failed with `ECONNRESET`; the Hostinger build for `3d53b63` completed successfully. The Dockerfile no longer has an install fallback.
- Official Paddle sandbox, staging, full owner release approval, and a real provider reconciliation remain unavailable. A limited production availability smoke was executed after the explicitly authorized deployment.
- Desktop/mobile browser E2E and keyboard-a11y automation are not configured in this checkout. Local HTTP/standalone smoke is not browser E2E evidence.

## Open failures

G3, G6, G7, G8, and G9 remain BLOCKED. The release gatekeeper referenced by the controller is not present in the checkout. CI account billing remediation and fresh CI on the recovery commit are required before the CI gate can pass.

## Next authorized action

Do not advance to v1.1. Restore GitHub Actions billing only when CI is intended
to run, then rerun the full desktop/mobile/a11y, provider, staging,
owner-approval, CI, and production-safe smoke gates. Keep the deployed
v1.0.9 recovery on the rollback path until the remaining release gates are
evidenced as PASS.
