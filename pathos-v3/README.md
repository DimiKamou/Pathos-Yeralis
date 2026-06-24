# PATHOS v3 — "the quiet edit"

A **third** visual direction for PATHOS by Yeralis — the minimalist option, built
to be shown alongside the original and v2 so a direction can be chosen. Same
jewelry, same shopping logic, a pared-back look in the **warm spirit of the
original**.

> A **design prototype**, not the production store. Runs entirely on seed data
> (`src/lib/catalog.ts`) with **no database, Stripe, or admin**.

## The direction

Where v2 takes a bold swing, v3 does the opposite — it refines the original:

- **Palette** — porcelain cream `#F4F1EA`, warm ink `#211C16`, and a single
  whisper of antique **gold** `#A9824A` used only as a hover/hairline accent.
- **Type** — **Newsreader** (a light editorial serif) set large and airy, with
  **Mulish** for UI. Quieter than the original's Cormorant.
- **Layout** — centred wordmark, a calm light hero, and the catalogue as a clean
  index filtered **by collection**. Lots of air; the hairline is the main
  structural device.
- The whole thing stays **light** (no dark sections beyond a thin announcement
  sliver) — restraint as the point of view.

## Run it

```bash
cd pathos-v3
npm install
npm run dev      # → http://localhost:3200
```

Runs on **port 3200** so all three can run at once:

| Version | What it is | Port |
|---|---|---|
| original | the current site | 3000 |
| `pathos-v2` | bold "jewelry as feeling" (marble + garnet) | 3100 |
| `pathos-v3` | minimalist "quiet edit" (cream + ink) | 3200 |

## Same logic as the others

Cart + wishlist (localStorage), discount codes (`WELCOME10`, `ATELIER20`,
`AEGEAN15`, `FREESHIP`), free shipping ≥ €100, product modal with
variants/qty/save/notify, and the full 3-step checkout — all demo (no real
payment).

## Lifting into its own repository later

Self-contained, so promoting it is two steps:

```bash
git subtree split --prefix pathos-v3 -b pathos-v3-standalone
git push https://github.com/<you>/pathos-v3.git pathos-v3-standalone:main
```
