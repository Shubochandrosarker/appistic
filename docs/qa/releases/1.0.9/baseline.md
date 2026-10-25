# Appistic v1.0.9 verified baseline

Date: 2026-10-23 (Asia/Dhaka)

## Repository

- Remote: `https://github.com/Shubochandrosarker/appistic.git`
- Base branch: `main`
- Tested base SHA: `d081552e2105b6f239fbed84bc1a2365e1810f8b`
- Working branch: `codex/appistic-hardening`
- Initial working tree: clean
- Checkout: `D:\\All Projects\\WPISTIC-GALAXY-ECOSYSTEM\\APPISTIC\\appistic-repo`

## Runtime and available commands

- Node: `v22.18.0`
- npm: `10.9.3`
- Docker: `29.9.2`
- Docker Compose: `v5.6.1`
- PostgreSQL CLI: unavailable on host
- `npm ci`: PASS (installed 98 packages; npm reported 3 production audit findings)
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS on the baseline checkout
- `npm audit --omit=dev --audit-level=high`: FAIL; findings include the installed Next.js/PostCSS and Drizzle versions

## Current repository shape

The checkout is a small Next.js App Router application with one initial Drizzle migration and no automated test, lint, integration, browser, CI, or release-evidence scripts. The repository package version is `1.0.0`; this differs from the supplied controller's research-time `v1.0.8` note and was verified against the remote HEAD above.

## Baseline risks verified in source

- Authentication uses a SHA-256 secret-derived password hash and has a development fallback secret.
- Session tokens are stateless and cannot be revoked server-side.
- API mutation routes do not enforce an origin/CSRF policy.
- Analytics `GET /api/track` does not authenticate or verify card ownership.
- Card and lead limits are check-then-write operations without transaction/concurrency protection.
- Card editor input accepts arbitrary URL values and the public renderer emits them as links/images.
- Paddle webhook handling lacks durable event idempotency and accepts unconfigured signature policy paths.
- Environment examples contain credential-like values instead of fake placeholders.
- Public production, staging, Paddle sandbox, Stripe Connect, email, DNS, and owner-approval evidence are not available in this checkout.

## Scope boundary

The supplied v1.2-v2.0 documents require v1.0.9 and v1.1 to pass first. The v1.0.9 and v1.1 phase files referenced by the controller were not present in the supplied packet, so this baseline follows the controller and acceptance matrix for security and free-card compatibility without inventing missing commercial requirements. Provider-dependent gates remain blocked until the required credentials, approvals, staging environment, and authorized smoke tests exist.
