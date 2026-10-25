# Appistic v1.0.9 recovery baseline

Date: 2026-10-25 (Asia/Dhaka)

## Repository

- Remote: `https://github.com/Shubochandrosarker/appistic.git`
- Audited `main` HEAD: `3cd86afed6e9d83b7bfa5a039faecb74abfde2a3`
- Working branch: `codex/appistic-hardening`
- Recovery base: `7536de3`
- Code-tested SHA: `b0b9856981ac1cd7c3bc5e1741a737eee81b772a`
- Initial working tree: clean
- Checkout: `D:\\All Projects\\WPISTIC-GALAXY-ECOSYSTEM\\APPISTIC\\appistic-repo`

## Runtime and available commands

- Node: `v22.18.0`
- npm: `10.9.3`
- Docker: `29.9.2`
- PostgreSQL: isolated Docker `postgres:16-alpine` on `127.0.0.1:55432`
- Package scripts: `test`, `test:db`, `typecheck`, `lint`, `build`, `db:migrate`, `db:check`
- CI workflow: `.github/workflows/ci.yml`
- Release gatekeeper script: not present in this checkout; machine-readable evidence was reviewed directly.

## Scope findings confirmed before edits

- `transaction.completed` could grant Pro.
- `entitlements.ts`, tests, README, and the v1.0.9 policy disagreed on the Free card limit.
- Public lead capture did not require `published=true` and recorded `view` instead of `lead`.
- Authenticated analytics responses did not set explicit private/no-store headers.
- Docker could silently fall back from `npm ci` to `npm install`.
- `tsconfig.tsbuildinfo` was tracked.
- The required controller is available at the Appistic parent folder. The controller-referenced `01_PHASE_1_0_9_SECURITY.md` and `02_PHASE_1_1_FREE_CARD.md` files were not present, so the attached recovery prompt is the active v1.0.9 specification.

## External CI diagnosis

GitHub Actions run `40203334605` on `main` at `3cd86af...` concluded `failure` before starting its only `verify` job. GitHub's annotation says: `The job was not started because your account is locked due to a billing issue.` The job had no steps and `gh run view --log-failed` returned `log not found`. This is an external CI-account blocker, not an application test result.

## Safety boundary

During the initial recovery audit, no production deployment or production
migration was performed. After the owner explicitly authorized Hostinger
deployment on 2026-10-25, an existing Appistic database backup was taken, the
additive migrations were applied, and the recovery container was cut over with
the prior image retained for rollback. No DNS change, credential rotation, live
payment request, provider sandbox request, or customer-data export was
performed. Existing card rows and stable QR routes were preserved by the code
changes.
