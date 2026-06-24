# ΠΑΘΟΣ v2 — a design-direction prototype

A **second, bold visual identity** for PATHOS by Yeralis, built to sit beside the
original so the two can be compared and one chosen. Same jewelry, same shopping
logic (cart, wishlist, product detail, discounts, 3-step checkout) — a
completely different look.

> This is a **design prototype**, not the production store. It runs entirely on
> seed data (`src/lib/catalog.ts`) with **no database, Stripe, or admin**. The
> original app remains the source of truth for all of that.

## The direction: "jewelry as feeling"

The brand name *Pathos* (πάθος) is the Greek word for deep emotion. So v2 throws
out the warm-cream / serif / gold look and rebuilds around that idea:

- **Palette** — cool **marble** `#E8E9E4` and stone, cool slate ink `#26292A`, a
  deep Hellenistic **garnet** `#7A1F2B` as the only accent, with a whisper of
  oxidized patina. (Deliberately none of the usual AI-design defaults.)
- **Type** — **Alegreya** (calligraphic, with real Greek glyphs so ΠΑΘΟΣ renders
  authentically) for display; **Manrope** for UI. Not the Cormorant/Playfair
  most jewelry sites reach for.
- **Signature** — the catalog is **arranged by feeling, not by category**:
  ΕΡΩΣ (desire) · ΣΤΟΡΓΗ (tenderness) · ΠΟΘΟΣ (longing). This is the one bold
  move; everything else stays quiet around it.
- **Hero as thesis** — opens on a dark stone claim, *"jewelry for the feelings
  that don't have words,"* rather than a product carousel.

## Run it

```bash
cd pathos-v2
npm install
npm run dev      # → http://localhost:3100
```

Runs on **port 3100** so it can sit beside the original (port 3000) at the same
time. Open both and compare.

## What carries over from the original

- The exact catalog (9 pieces) and prices, re-tagged with a `feeling`.
- Cart + wishlist with localStorage persistence, discount codes
  (`WELCOME10`, `ATELIER20`, `AEGEAN15`, `FREESHIP`), free shipping ≥ €100.
- Product modal with variants, quantity, save, sold-out → notify.
- Three-step checkout (contact → payment → review) with card + bank-transfer,
  express pills, and order confirmation copy — all demo (no real payment).

## Lifting this into its own repository later

It's self-contained, so promoting it to a standalone repo is two steps:

```bash
# from the repo root, split this folder into its own branch with history:
git subtree split --prefix pathos-v2 -b pathos-v2-standalone

# then push that branch to a new empty GitHub repo you've created:
git push https://github.com/<you>/pathos-yeralis-v2.git pathos-v2-standalone:main
```

Or simply copy the `pathos-v2/` folder into a fresh directory and `git init`.
