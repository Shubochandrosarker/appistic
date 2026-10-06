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
| Cards | 1 | 10 |
| QR scans | Unlimited | Unlimited |
| Leads | 50/month | Unlimited |
| CSV export | — | ✓ |
| Remove branding | — | ✓ |

## Stack

Next.js 15 (App Router) · Postgres + Drizzle · Tailwind v4 · Paddle Billing · Docker standalone deploy.

## Dev

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL + AUTH_SECRET
npm run db:push              # create tables
npm run dev                  # http://localhost:3300
```

## Deploy

Docker standalone image; see `Dockerfile`. App expects `DATABASE_URL`, `AUTH_SECRET`, `PUBLIC_BASE_URL`, and the two `PADDLE_PRO_*_PRICE_ID` vars at runtime.
