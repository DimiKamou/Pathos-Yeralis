# PATHOS by Yeralis — Design Notes & Tokens

High-fidelity reference. Recreate pixel-for-pixel. All values pulled from the prototypes.

## Brand
Greek handmade jewelry. Warm, editorial, gallery-like. Cream paper, ink-brown text, a single antique-gold accent. Serif display + light sans body. No emoji. Restrained, lots of whitespace.

## Color tokens
| Token | Hex | Use |
|---|---|---|
| `paper` | `#f6f0e6` | page background (light) |
| `sand` | soft tan wash (~`#efe7d8`) | section/panel fills |
| `ink` | deep warm brown (~`#33291d`) | primary text, dark buttons, top announcement bar |
| `mute` | muted brown-grey | secondary text, captions |
| `gold` | `#b1894e` | accent: prices on hover, primary CTAs, active states, badges |

Seasonal accents (swap `gold` when a season is active — see `pathos-store.js` `SEASONS`):
- Christmas evergreen `#2e6249` · Easter lilac `#8a6f9e` · Halloween amber `#b5652f` · Summer Aegean `#2f86a3`.

A dark mode exists (moon toggle in the header) — invert paper/ink, keep gold.

## Typography
- **Display / headings:** a serif (Cormorant / Playfair-style). Used for the PATHOS wordmark, product names in the PDP, section titles. Medium weight, tight leading.
- **Body / UI:** a light-weight humanist sans. 13–14px body, generous letter-spacing on uppercase labels (`tracking-[0.12em]`–`[0.2em]`).
- Uppercase micro-labels (collection name, section eyebrows) at 11px, gold or mute.

## Spacing & shape
- Max content width ~1240px, generous 32px+ gutters.
- Buttons: fully rounded (`rounded-full`) pills for CTAs; `rounded-lg`/`rounded-xl` for inputs and cards.
- Drawers (cart, wishlist): right-side, `max-w-md`, full-height, white/paper with `shadow-2xl`, dark backdrop `bg-black/45` + slight blur.
- Modals (PDP): centered, `rounded-2xl`, two-column on desktop (art left on `sand`, details right).
- Soft long shadows for popovers: `0_24px_60px_-24px_rgba(80,60,30,0.4)`.

## Key screens & components

### Storefront header
Three-column grid: live **search** (left, dropdown results), centered **PATHOS by Yeralis** wordmark with diamond mark, right icon cluster: dark-mode toggle, account, **wishlist heart (badge count)**, **cart bag (badge count)**. Below: ABOUT / COLLECTIONS (hover mega-menu) / JEWELRY & ACCESSORIES. Top: dark announcement bar (admin-editable text).

### Product card
Line-art (or photo) on paper, name + heart toggle row, price, color swatches. Sold-out pieces get a tan "Sold Out" tag. Heart toggles gold + persists to wishlist.

### Product detail modal (PDP)
Art panel (left) with save-heart overlay; details (right): collection eyebrow, serif name, price, description, material, swatches, variant pills, qty stepper, **Add to cart** (ink pill), free-shipping/returns line with truck icon, **"You may also like"** strip (3 from same collection). Sold-out items show a **Notify-me** email capture instead of add-to-cart.

### Cart drawer
Line items w/ qty steppers + remove, **discount code field**, subtotal / discount / shipping rows, **Checkout · €total** gold pill. Free shipping ≥ €100 (or `FREESHIP` code).

### Wishlist drawer
Saved pieces list with thumbnail, name, price, "View & add", remove. Empty state with heart icon + "Browse the shop".

### Checkout (3 steps)
1. **Contact & shipping** — name, email, address, city, postcode, country select.
2. **Payment** — express row (**Apple Pay** black pill + **Google Pay** outline pill), "or pay another way" divider, method radios: **Credit/debit card** (number / MM-YY / CVC, "we never store card numbers" + lock icon) and **Bank transfer / deposit** (shows beneficiary / bank / IBAN with copy button / BIC + reference instructions). Discount field. Totals. "Paying with …" summary chip.
3. **Review → Pay €total** (or **Confirm order** for bank transfer).

Confirmation: paid methods → "Thank you, {name}! Order {id} confirmed." Bank transfer → "Almost there! Order {id} reserved — transfer €total to this IBAN using {id} as reference."

### Admin dashboard (`PATHOS Admin.html`)
Sidebar nav. Views: Orders (status chips: Paid / Awaiting payment / Shipped), Products (CRUD, stock, status), Messages inbox (read/unread), Subscribers, Campaigns, and Settings (seasonal theme picker w/ auto-by-date, announcement, welcome popup, menu editor).

## Data model
See `prototypes/pathos-store.js` — it is the canonical schema and seed data:
- `products` (id, name, art, collection, price, stock, status, sold, material, swatches)
- `orders` (id, customer, email, country, date, items, total, payment, method, discount, lines[])
- `subscribers`, `messages`, `campaigns`
- `DISCOUNTS` map + `checkDiscount()` (also honors the live welcome-popup code)
- `BANK` (beneficiary, bank, iban, bic, note) — **placeholder, move to config**
- `SEASONS` + `SEASON_WINDOWS` (auto-switching themes)
- popup / announcement / menu settings

## Interactions
- Cart & wishlist persist to localStorage in the prototype (→ DB/cookie in the real app).
- Discount applies live and recalculates totals everywhere.
- Search filters catalog live (name / collection / material).
- Welcome popup: appears after ~1.2s, once per session, dismissable, carries the active discount code.
- Live chat widget posts messages into the admin inbox.
