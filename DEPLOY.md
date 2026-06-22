# Deploying PATHOS by Yeralis

**TL;DR (recommended):** Host on **Vercel**, use a **Postgres** database (Neon or
Vercel Postgres). Free tiers cover an alpha. ~10 minutes start to finish.

The code already runs and builds green. The only thing that *must* change for a
real (cloud) deployment is the database — see below.

---

## Why not SQLite in the cloud?

SQLite keeps all data in a single local file. Serverless hosts (Vercel, Netlify)
have **ephemeral, read-only filesystems**, so a SQLite file would either reset on
every deploy or not work at all. You need a hosted **Postgres** there.

You don't edit any code for this: the Prisma provider **auto-switches from
`DATABASE_URL`** (`scripts/db-provider.mjs`, wired into `build`/`setup`):

| `DATABASE_URL` looks like | Provider used |
| --- | --- |
| `postgres://…` / `postgresql://…` | `postgresql` |
| `file:./dev.db` (local default) | `sqlite` |

So locally you keep zero-config SQLite; in the cloud you set a Postgres URL and it
just works.

---

## Option A — Vercel + Postgres (recommended)

**1. Get the code on GitHub.** It's on branch `claude/bold-sagan-u3svb6` (PR #1).
Either merge that PR into `main`, or just point Vercel at the branch in step 3.

**2. Create a Postgres database.** Easiest options (free tier):
- **Neon** (neon.tech) → create project → copy the connection string.
- **Vercel Postgres** (Vercel dashboard → Storage → Create → Postgres) → it sets
  `DATABASE_URL` for you automatically.

> If your provider shows both a **pooled** and a **direct** URL (Neon/Supabase):
> use the **direct** URL for the one-time DB setup in step 4, and the **pooled**
> URL as `DATABASE_URL` in Vercel (better for serverless connection limits).

**3. Import the repo into Vercel** (vercel.com → Add New → Project → pick the
repo/branch). Framework preset auto-detects **Next.js** — no extra config.

**4. Initialize the database once.** From your machine, point at the new DB and run:
```bash
DATABASE_URL="postgresql://…your-db…" npm run setup
```
This creates the tables and seeds the demo catalog, settings, and admin user.
(To create tables **without** demo data, use `npm run db:push` instead.)

**5. Set environment variables in Vercel** (Project → Settings → Environment
Variables) — see the reference table below. At minimum:
`DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`,
`NEXT_PUBLIC_SITE_URL`.

**6. Deploy.** Vercel runs `npm run build` (which auto-sets the Postgres provider).
When it's live, visit `/admin` and log in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

## Option B — Netlify

Also works: Netlify auto-installs `@netlify/plugin-nextjs`. Same Postgres DB and
the same env vars; build command `npm run build`. Vercel tends to be smoother for
Next.js middleware/SSR, so it's the first recommendation — but Netlify is fine.

## Option C — A single always-on server (VPS / Docker / Railway / Render / Fly.io)

On a single long-running instance with a **persistent disk**, you can keep
**SQLite** (`DATABASE_URL="file:/data/prod.db"` on a mounted volume) *or* use
Postgres. Typical run:
```bash
npm ci && npm run setup && npm run build && npm start
```
SQLite is single-writer, so this works for **one** instance only — don't scale it
horizontally. For multiple instances, use Postgres.

---

## Environment variables

| Variable | Required | What it's for |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres URL in the cloud (`postgresql://…`); `file:./dev.db` locally |
| `ADMIN_EMAIL` | ✅ | Admin login + fallback for new-order alerts |
| `ADMIN_PASSWORD` | ✅ | Admin login password — **change from the demo** |
| `ADMIN_SESSION_SECRET` | ✅ (prod) | Signs the admin session cookie. **The app refuses to start in production if this is missing or < 16 chars.** Generate one (below). |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your public URL, e.g. `https://pathos-yeralis.gr` (used in emails, sitemap, JSON-LD, canonical links) |
| `STRIPE_SECRET_KEY` | optional | Enables real card + Apple/Google Pay. Without it, checkout runs **bank transfer + demo** automatically |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | optional | Stripe client key (pairs with the secret key) |
| `STRIPE_WEBHOOK_SECRET` | optional | Verifies Stripe webhooks |
| `RESEND_API_KEY` | optional | Sends real email. Without it, emails are logged to the server console |
| `EMAIL_FROM` | optional | From-address for emails |
| `ORDER_NOTIFY_EMAIL` | optional | Where new-order alerts go (defaults to `ADMIN_EMAIL`) |

Generate a strong session secret:
```bash
openssl rand -base64 32
# or: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Go-live checklist

- [ ] `ADMIN_SESSION_SECRET` set to a strong random value (required in prod).
- [ ] `ADMIN_PASSWORD` changed from the demo password.
- [ ] `NEXT_PUBLIC_SITE_URL` set to your real HTTPS domain (admin cookies are
      `Secure` in production, so the site must be served over HTTPS).
- [ ] Real bank details in `src/lib/bank.ts` (the IBAN shown at bank-transfer checkout).
- [ ] (When ready for live cards) add Stripe keys. **Before** taking live card
      payments, read the "deferred" note in the QA summary: the Stripe webhook
      should be made authoritative for order creation so a dropped connection
      after a charge can't leave a paid-but-missing order. Bank-transfer + demo
      checkout are unaffected.
- [ ] Optional: connect `RESEND_API_KEY` so order/shipping/owner emails actually send.

---

## Updating the schema later

When you change `prisma/schema.prisma`, apply it to the live DB with:
```bash
DATABASE_URL="postgresql://…prod…" npm run db:push
```
(For versioned migrations instead of `db push`, switch to `prisma migrate deploy`.)
