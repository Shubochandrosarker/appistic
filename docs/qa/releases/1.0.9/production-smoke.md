# Appistic v1.0.9 production smoke

Git SHA: `13a526f5aad957a1a0f9a7dd6c332940d14a080a`

Status: BLOCKED (limited deployment smoke PASS)

The owner explicitly authorized Hostinger deployment on 2026-10-26. The active
container is `appistic:13a526f`; the previous `appistic:3d53b63` container
remains available as `appistic-3d53b63-rollback-20261026`.

Observed after cutover:

- `https://appistic.com/`, `/login`, and `/pricing`: HTTP 200.
- Direct origin `/` and `/login`: HTTP 200.
- Public unauthenticated analytics GET: HTTP 401 with `Cache-Control: private,
  no-store` and `Vary: Cookie`.
- Premium markers were observed in the live homepage, login, and pricing HTML.
- Migration ledger: `0000`, `0001`, `0002`, `0003`, `0004`.
- App container logs: no startup/runtime errors during the smoke window.

This limited smoke does not prove Paddle payment/webhook behavior,
browser/mobile/a11y acceptance, monitoring readiness, or full v1.0.9 release
approval. Those gates remain BLOCKED.
