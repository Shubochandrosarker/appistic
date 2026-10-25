# Appistic

Digital business card platform with dynamic QR codes. One printed QR → always points to the live page → scans counted, leads captured.

A **WordPressistic LLC** product. Live at https://appistic.com

## What it does

- **Card builder** — brand name, bio, contact info, avatar, 5 themes + accent color
- **Social links** — website, Instagram, Facebook, WhatsApp, YouTube, X, LinkedIn, TikTok, Telegram
- **Product mini-store** — up to 25 products with price, image, buy link
- **Dynamic QR** — QR encodes `/t/[slug]`; scans are tracked and the destination is editable forever
- **Lead capture** — public "Send my info" form → owner's lead inbox; CSV export on Pro
- **vCard** — visitors save contact details to their phone in one tap
- **Analytics** — views, QR scans, link clicks, product clicks, contact saves, leads
- **Paddle billing** — Free / Pro ($5/mo or $49/yr), webhook-driven upgrades

## Plans

| | Free | Pro ($5/mo · $49/yr) |
|---|---|---|
| Cards | 2 | 10 |
| QR scans | Unlimited | Unlimited |
| Leads | 50/month | Unlimited |
| CSV export | — | ✓ |
| Remove branding | — | ✓ |

## Stack

Next.js 16 (App Router) · Postgres + Drizzle · Tailwind v4 · Paddle Billing · Docker standalone deploy.

## Dev

```bash
npm install
npm run db:migrate           # apply checked-in migrations
npm run dev                  # http://localhost:3300
```

Set `DATABASE_URL`, a random `AUTH_SECRET` of at least 32 characters, and
`PUBLIC_BASE_URL` in `.env.local`. `npm run db:push` is retained for disposable
local experiments only; use `npm run db:migrate` for shared, staging, and
production databases.

Verification commands:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:db              # requires isolated PostgreSQL DATABASE_URL
npm run build
npm audit --omit=dev --audit-level=high
```

## Deploy

Docker standalone image; see `Dockerfile`. App expects `DATABASE_URL`,
`AUTH_SECRET`, `PUBLIC_BASE_URL`, and the two `PADDLE_PRO_*_PRICE_ID` vars at
runtime. Paddle upgrades remain fail-closed until a verified provider sandbox
configuration and webhook evidence are available.
