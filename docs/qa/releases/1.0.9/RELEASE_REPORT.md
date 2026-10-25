# Appistic v1.0.9 release recovery report

Release/step: 1.0.9 security and release recovery
Git base -> tested SHA: `7536de3` -> `b0b9856981ac1cd7c3bc5e1741a737eee81b772a`
Status: BLOCKED

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

## Security and compatibility

The P0 billing grant path, Free-limit inconsistency, unpublished-card lead write, lead/view event confusion, analytics cache exposure, Docker install fallback, and tracked generated cache are fixed in source and covered locally. Existing card data, published state, slugs, and QR target routes are not modified by the recovery.

Official Paddle documentation confirms that `transaction.completed` describes a completed transaction, while subscription lifecycle events establish subscription state; Paddle requires event-id deduplication and `occurred_at` ordering. The implementation follows that boundary without making a live provider request.

## Provider and environment limitations

- GitHub Actions run `40203334605` on `main` failed before the job started because the GitHub account is locked due to a billing issue. It had no steps and no retrievable log archive. The CI gate is therefore BLOCKED, not PASS.
- Docker standalone build reached the lockfile install but failed with `ECONNRESET` while downloading npm packages inside the container. The Dockerfile no longer has an install fallback; this was not converted to a pass.
- Official Paddle sandbox, staging, owner approval, production smoke, and a real provider reconciliation are unavailable and were not attempted.
- Desktop/mobile browser E2E and keyboard-a11y automation are not configured in this checkout. Local HTTP/standalone smoke is not browser E2E evidence.

## Open failures

G3, G6, G7, G8, and G9 remain BLOCKED. The release gatekeeper referenced by the controller is not present in the checkout. CI account billing remediation and fresh CI on the recovery commit are required before the CI gate can pass.

## Next authorized action

Restore GitHub Actions billing, push/open the isolated recovery branch for CI, and provide authorized staging plus official Paddle sandbox access. Then rerun the full desktop/mobile/a11y, provider, staging, owner-approval, CI, and production-safe smoke gates. Do not deploy or advance to v1.1 until every required v1.0.9 gate is evidenced as PASS.
