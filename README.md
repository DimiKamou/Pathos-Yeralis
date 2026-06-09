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

## Open & run it in VS Code

There are two ways to look at this, and they're different:

### A) The prototypes — with **Live Server** (instant, design only)
The files in [`prototypes/`](./prototypes) are plain HTML and run great with the
**Live Server** extension (right-click `prototypes/PATHOS by Yeralis.html` →
*Open with Live Server*). This is the original design with demo data held in your
browser — handy for a quick visual/UX pass. It is **not** the real app: no
database, no Stripe, no real orders.

> Live Server only serves static files, so it **cannot** run the real Next.js
> app below — that needs the dev server.

### B) The real app — with the **dev server** (full, offline)
Requires only **Node 20+**. The default database is **SQLite**, so there's
nothing to install and it runs **completely offline**:

```bash
npm install
cp .env.example .env      # SQLite + offline-demo defaults are already set
npm run setup             # generate client + create the SQLite DB + seed demo data
npm run dev               # → http://localhost:3000   (admin at /admin)
```

That's the whole **offline preview** — browse, cart, wishlist, discounts, a
**demo card checkout** (no Stripe needed; creates a real paid test order), the
bank-transfer flow, the welcome popup, and the full admin. Emails log to the
terminal.

In VS Code you can instead use **Run and Debug → "Next.js: dev server"**, or the
**"Start everything (setup → dev)"** build task. Recommended extensions are
suggested on first open.

Log into the admin at `/admin` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your
`.env` (defaults `admin@pathos-yeralis.gr` / `change-me`).

## Database (SQLite by default, Postgres for production)

The default is **SQLite** (`DATABASE_URL="file:./dev.db"`) — zero-config and
fully offline. `npm run setup` runs `prisma generate && prisma db push &&
prisma db seed`.

For **production** (Vercel / Firebase App Hosting + Cloud SQL), switch to Postgres:

1. In `prisma/schema.prisma` set `provider = "postgresql"`.
2. Set `DATABASE_URL` to your Postgres connection string.
3. `npm run db:push && npm run db:seed`.

All column types are portable across SQLite/Postgres, so that's the only code
change. A local Postgres for prod-like testing is available via `npm run db:up`
(see `docker-compose.yml`).

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

**Offline by default:** with no Stripe keys set, the storefront offers a
**Card (demo)** option that creates a real *paid* test order (via
`/api/checkout/demo`) so you can walk the full card → "Thank you" → admin flow
with **no network**. Bank transfer also works fully offline. The demo route is
**hard-disabled the moment `STRIPE_SECRET_KEY` is set**, so it can never run in
production.

**Turn on real card + wallet payments (Stripe test mode):** add your Stripe
**test** keys to `.env`, then restart `npm run dev`:

```
STRIPE_SECRET_KEY=sk_test_…
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
```

Get them at <https://dashboard.stripe.com/test/apikeys>. Once set, checkout uses
Stripe for real:

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

## Deploy to Firebase

This is a standard Next.js SSR app, so the least-rewrite path is **Firebase App
Hosting** (which runs Next.js server-side) backed by Postgres on **Cloud SQL** —
Prisma and all the code stay exactly as-is.

1. `npm i -g firebase-tools && firebase login`.
2. Create an **App Hosting** backend (console or `firebase init apphosting`) and
   connect this GitHub repo / deploy branch.
3. Provision **Cloud SQL for PostgreSQL**, then set `provider = "postgresql"` in
   `prisma/schema.prisma`.
4. Add the env vars from `.env.example` as App Hosting secrets — `DATABASE_URL`
   (Cloud SQL connection string), `ADMIN_*`, `STRIPE_*`, `RESEND_API_KEY`,
   `EMAIL_FROM`, `BANK_*`. Expose `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` at build
   time in `apphosting.yaml`.
5. Apply schema + seed once against Cloud SQL:
   `DATABASE_URL="<url>" npm run db:push && DATABASE_URL="<url>" npm run db:seed`.
6. Push — App Hosting builds (`npm run build`) and serves it.

> Prefer **Firestore** over Cloud SQL? That's a bigger change (Firestore is
> NoSQL, so the Prisma data layer would be rewritten). For the alpha I'd keep
> Cloud SQL + Prisma — ping me if you want the Firestore route scoped.

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
