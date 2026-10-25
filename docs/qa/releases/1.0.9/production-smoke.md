# Appistic v1.0.9 production smoke

Git SHA: `3d53b63b8e5956a04aabe7deca7eb1dbbbd68530`

Status: BLOCKED (limited deployment smoke PASS)

The owner explicitly authorized Hostinger deployment on 2026-10-25. The active
container is `appistic:3d53b63`; the previous `appistic:1.0.8` container remains
available as `appistic-1.0.8-rollback-20261025`.

Observed after cutover:

- `https://appistic.com/`, `/login`, and `/pricing`: HTTP 200.
- Direct origin `/` and `/login`: HTTP 200.
- Public unauthenticated analytics GET: HTTP 401 with `Cache-Control: private,
  no-store` and `Vary: Cookie`.
- Migration ledger: `0000`, `0001`, `0002`, `0003`, `0004`.
- App container logs: no startup/runtime errors during the smoke window.

This limited smoke does not prove Paddle payment/webhook behavior,
browser/mobile/a11y acceptance, monitoring readiness, or full v1.0.9 release
approval. Those gates remain BLOCKED.
