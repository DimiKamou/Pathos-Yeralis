# Deploying PATHOS by Yeralis

This is set up as a **low-maintenance handoff**: the shop owner only ever uses the
`/admin` panel (photos, prices, products, orders); you deploy it once and make the
occasional fix later.

**Recommended for that: one always-on host running SQLite — no separate database.**
The whole store is a single file, backups are trivial, there's one service to keep
alive, and the cost is predictable. The app is hardened for this (concurrent
checkout was load-tested). You only need Postgres if you later want serverless
hosting or real scale — and switching is a one-line env change, not a code change.

---

## Option A — Render, one-click (recommended)

This repo ships a **`render.yaml` blueprint**, so deployment is mostly clicks.

1. Make sure the code is on GitHub (it is — merge PR #1 to `main`, or deploy the branch).
2. Render dashboard → **New +** → **Blueprint** → pick this repo.
3. Render reads `render.yaml` and prompts for a few values:
   - `ADMIN_EMAIL` — the owner's admin login
   - `ADMIN_PASSWORD` — a real password (not the demo)
   - `NEXT_PUBLIC_SITE_URL` — the site's URL (your `…onrender.com` or a custom domain)
   - (`ADMIN_SESSION_SECRET` is **auto-generated** by Render — nothing to do)
4. **Create**. The first deploy:
   - builds the app,
   - creates the SQLite database on a **persistent 1 GB disk** (`/data/prod.db`),
   - **seeds** the starter catalogue + settings + admin user automatically.
5. Open the URL → `/admin` → log in. Hand the owner that URL + their login. Done.

**Plan:** the blueprint uses Render's **Starter** instance (~$7/mo) because the free
tier can't stay always-on and has no persistent disk. That's the only required cost.

### What happens on later deploys
When you push a fix, Render redeploys and runs `scripts/init-db.mjs`, which:
- applies any schema changes you shipped (`prisma db push`, additive/idempotent), and
- **skips seeding** because the store already has data — so the owner's products,
  prices, and photos are never overwritten.

### Backups (one file)
The entire store is `/data/prod.db`. To back up: Render dashboard → your service →
**Shell** → `cp /data/prod.db /tmp/ && cat …` (or use Render's disk snapshot). Keep
a periodic copy somewhere safe; restoring is just putting the file back.

### Uploaded photos
Handled automatically: the blueprint sets `UPLOAD_DIR=/data/uploads`, so product
photos the owner uploads in the admin are written to the **same persistent disk**
as the database and served via the `/media` route — they survive redeploys, no
extra service needed. (Prefer managed object storage instead? Set `BLOB_READ_WRITE_TOKEN`
for Vercel Blob, or the `S3_*` vars for Cloudflare R2 / Supabase / S3 — see
`src/lib/storage.ts`. Required on serverless/Vercel, optional here.)

---

## Option B — Vercel + Postgres (only if you want serverless / scale)

Serverless can't use SQLite (ephemeral filesystem), so this path needs a managed
Postgres (Neon or Vercel Postgres). More moving parts, but scales to zero and gives
managed DB backups.

1. Create a Postgres DB (Neon → copy the connection string).
2. Initialize it once: `DATABASE_URL="postgresql://…" npm run setup`.
3. Import the repo into Vercel (auto-detects Next.js).
4. Set the env vars (table below); `DATABASE_URL` = your Postgres URL.
5. Deploy. The Prisma provider auto-switches to `postgresql` from the URL — no edits.

> If your provider gives a **pooled** and a **direct** URL (Neon/Supabase): use the
> direct one for `npm run setup`/migrations, and the pooled one as the app's
> `DATABASE_URL`.

## Other single-host options
Railway (volume + template) and Fly.io (volume + `fly.toml`) work the same way as
Render — persistent disk + `DATABASE_URL="file:/data/prod.db"` + run
`node scripts/init-db.mjs` once (or on each deploy). A plain VPS works too:
`npm ci && DATABASE_URL=file:/data/prod.db node scripts/init-db.mjs && npm run build && npm start`.

---

## Environment variables

| Variable | Required | What it's for |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | `file:/data/prod.db` (SQLite on a disk) or `postgresql://…` |
| `ADMIN_EMAIL` | ✅ | Admin login + fallback for new-order alerts |
| `ADMIN_PASSWORD` | ✅ | Admin login — **change from the demo** |
| `ADMIN_SESSION_SECRET` | ✅ (prod) | Signs the admin cookie. App refuses to start in prod if missing/weak. Render auto-generates it; elsewhere use `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public HTTPS URL (emails, sitemap, JSON-LD, canonical) |
| `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET` | optional | Live cards + Apple/Google Pay. Without them: bank transfer + demo checkout |
| `RESEND_API_KEY` / `EMAIL_FROM` | optional | Send real email (else logged to the server console) |
| `ORDER_NOTIFY_EMAIL` | optional | Where new-order alerts go (defaults to `ADMIN_EMAIL`) |

---

## Go-live checklist

- [ ] `ADMIN_PASSWORD` changed from the demo.
- [ ] `NEXT_PUBLIC_SITE_URL` = your real HTTPS domain (admin cookies are `Secure` in prod).
- [ ] Real bank details in `src/lib/bank.ts` (the IBAN shown at bank-transfer checkout).
- [ ] (When ready for **live cards**) add Stripe keys, and first make the Stripe
      webhook authoritative for order creation — see the QA notes — so a dropped
      connection after a charge can't leave a paid-but-missing order. Bank-transfer
      + demo are unaffected.
- [ ] Optional: `RESEND_API_KEY` so order/shipping/owner emails actually send.
- [ ] Set up a periodic copy of `/data/prod.db` (your backups).

---

## Database choice, in one line
SQLite (one file, simplest to run + back up) is the default and ideal for a single
small-shop host. Point `DATABASE_URL` at a `postgresql://` URL anytime to switch —
the provider auto-adapts, no code change.
