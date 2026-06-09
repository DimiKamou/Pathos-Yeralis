# PATHOS by Yeralis — Alpha

E-commerce alpha for **PATHOS by Yeralis**, a Greek handmade-jewelry brand: a
public storefront (catalog, cart, wishlist, search, 3-step checkout) and an
admin dashboard (orders, products, inbox, subscribers, campaigns, seasonal
themes, popups/announcement/menu). Recreated as a real, deployable app from the
high-fidelity prototypes in [`prototypes/`](./prototypes).

> **Alpha scope:** Stripe runs in **test mode**, bank details are placeholders,
> and product art falls back to inline line-art until real photos are uploaded.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v3 (tokens ported 1:1 from the prototypes) |
| Database | PostgreSQL via Prisma |
| Payments | Stripe — Payment Element (card) + Payment Request Button (Apple/Google Pay) + manual bank transfer |
| Email | Resend behind a swappable interface (dev falls back to a console logger) |
| Auth | Signed-cookie session for the **admin** only; checkout is guest-first |
| Hosting | Vercel |

## Quick start

```bash
# 1) Install
npm install

# 2) Configure env
cp .env.example .env
#   → set DATABASE_URL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
#   → (optional) Stripe test keys; leave blank for bank-transfer-only
#   → (optional) RESEND_API_KEY; blank logs emails to the console

# 3) Create the schema + seed from prototypes/pathos-store.js
npm run db:push      # or: npm run db:migrate  (creates a migration)
npm run db:seed

# 4) Run
npm run dev          # http://localhost:3000  (admin at /admin)
```

### Need a local Postgres?

Any of these work — point `DATABASE_URL` at it:

```bash
# Docker
docker run --name pathos-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pathos -p 5432:5432 -d postgres:16
# → DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/pathos?schema=public"
```

Or a free hosted DB (Neon, Supabase, Vercel Postgres) — paste its connection string.

## Seeding

`prisma/seed.ts` loads everything from `prototypes/pathos-store.js`:

- **Products** (the 9-piece catalog, prices stored in cents)
- **Discounts** — `WELCOME10`, `ATELIER20`, `FREESHIP`
- **Settings** — menu, welcome popup (code `AEGEAN15`), announcement bar, season
- **Seed messages / subscribers / campaign**
- **Admin user** from `ADMIN_EMAIL` / `ADMIN_PASSWORD`

Re-running is safe (idempotent upserts). Default admin login:
`admin@pathos-yeralis.gr` / the `ADMIN_PASSWORD` you set.

## Payments

Card + wallets ride entirely on Stripe; bank transfer is a manual offline flow.

- **Card** — Stripe Payment Element. Test card `4242 4242 4242 4242`, any future
  expiry + any CVC.
- **Apple Pay / Google Pay** — Stripe Payment Request Button. The express button
  only appears in a browser/device that actually has a wallet configured;
  otherwise the storefront shows disabled fallback pills.
- **Bank transfer / deposit** — creates the order as **`Awaiting payment`**,
  shows the IBAN/BIC/beneficiary (from the `BANK_*` env) and instructs the
  customer to use their order number as the reference. An admin marks it
  **Paid** in the dashboard once the deposit clears.
- **Klarna** — intentionally left out; the Stripe webhook is the clean seam to
  add async methods later.

The server **always recomputes prices, the discount, and the total from the DB**
(`src/lib/orders.ts`) — client cart values are never trusted.

### Stripe webhook (optional locally)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# put the printed whsec_… into STRIPE_WEBHOOK_SECRET
```

`/checkout/complete` records paid orders synchronously; the webhook
(`payment_intent.succeeded`) is the reconciliation safety net.

## Email

`src/lib/email` defines an `EmailProvider` interface. With `RESEND_API_KEY` set,
order confirmations / bank instructions / campaigns send via Resend; without it,
a console provider logs them (so dev + CI never block). Swap in Postmark/SES by
implementing the interface in `provider.ts`.

## Project structure

```
prisma/
  schema.prisma         # Product, Order, OrderLine, Subscriber, Message,
                        # Campaign, Discount, Setting, AdminUser
  seed.ts               # seeds from prototypes/pathos-store.js
src/
  app/
    page.tsx            # storefront (server) → <Storefront/>
    layout.tsx          # fonts + dark-mode pre-paint
    admin/              # /admin dashboard + /admin/login
    api/                # discount, subscribe, messages, checkout/*, stripe/webhook
        admin/          # gated admin CRUD (orders, products, settings, …)
  components/
    storefront/         # ported storefront UI + 3-step Checkout
    admin/              # dashboard shell + views
  lib/                  # prisma, money, discounts, seasons, settings, bank,
                        # stripe, auth, email, orders, products, serializers
  middleware.ts         # gates /admin behind the session cookie
prototypes/             # original design references (source of truth)
DESIGN_NOTES.md         # exact tokens, type, spacing
```

The prototypes used `localStorage` (`pathos-store.js`) to share state between
storefront and admin; the real app replaces that bridge with the **database +
API routes**, keeping the same data shapes so the UI ported cleanly.

## Deploy to Vercel

1. Push this repo to GitHub and **Import** it in Vercel.
2. Provision Postgres (Vercel Postgres / Neon / Supabase) and set `DATABASE_URL`.
3. Add all env vars from `.env.example` in **Project → Settings → Environment
   Variables** (use Stripe **test** keys for the alpha; set
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for all environments).
4. Run the schema against the prod DB once: `npm run db:push` (or commit a
   migration and run `prisma migrate deploy`), then `npm run db:seed`.
5. Add a Stripe webhook endpoint → `https://<your-domain>/api/stripe/webhook`
   for `payment_intent.succeeded`; put its signing secret in
   `STRIPE_WEBHOOK_SECRET`.
6. Deploy. `npm run build` runs `prisma generate` automatically.

## Before going live (not part of the alpha)

- Real Stripe **live** keys + business verification.
- Real Piraeus Bank account in the `BANK_*` env.
- Decide on Klarna.
- Real product photography (replaces the line-art fallback).
- Legal: terms, returns, privacy, GDPR/cookie consent (EU).

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run db:push` | Sync schema to the DB (no migration file) |
| `npm run db:migrate` | Create + apply a dev migration |
| `npm run db:seed` | Seed from `pathos-store.js` |
| `npm run db:studio` | Prisma Studio |
