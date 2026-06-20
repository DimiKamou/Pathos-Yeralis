"use client";

// Product detail modal. Ported from the prototype; catalog/state come from
// useShop(), the art panel is photo-aware (ProductMedia), sold-out swaps in the
// shared NotifyForm, and the related strip is photo-aware via ArtBox.
import { useEffect, useState } from "react";
import { eur } from "@/lib/money";
import { CloseIcon, HeartIcon, TruckIcon } from "@/components/storefront/icons";
import { Art } from "@/components/storefront/art";
import { ArtBox, ProductMedia } from "@/components/storefront/product-art";
import { useShop, variantsFor } from "@/components/storefront/shop-context";
import { NotifyForm } from "@/components/storefront/NotifyForm";
import { RecentlyViewed } from "@/components/storefront/RecentlyViewed";

interface PublicReview {
  id: string;
  rating: number;
  name: string;
  body: string;
  createdAt: string;
}

function fmtReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

// Gold stars; `value` may be fractional for the average display.
function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className="relative inline-block leading-none" style={{ fontSize: size }} aria-hidden>
      <span className="text-ink/15">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden text-gold" style={{ width: `${pct}%` }}>
        ★★★★★
      </span>
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className={`text-[20px] leading-none transition-colors ${n <= value ? "text-gold" : "text-ink/20 hover:text-gold/60"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setReviews([]);
    setDone(false);
    setError("");
    setName("");
    setRating(5);
    setBody("");
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setReviews(d.reviews || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) {
      setError("Please add your name and a few words.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, name: name.trim(), body: body.trim() }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      setName("");
      setBody("");
      setRating(5);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-7 border-t border-ink/10 pt-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-mute">Reviews</div>
        {count > 0 && (
          <div className="flex items-center gap-1.5 text-[12px] text-mute">
            <StarRow value={avg} />
            <span className="text-ink">{avg.toFixed(1)}</span>
            <span>· {count} review{count === 1 ? "" : "s"}</span>
          </div>
        )}
      </div>

      {count > 0 && (
        <div className="mt-4 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-ink/[0.06] pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <StarRow value={r.rating} size={12} />
                <span className="text-[12.5px] font-medium text-ink">{r.name}</span>
                <span className="ml-auto text-[11px] font-light text-mute">{fmtReviewDate(r.createdAt)}</span>
              </div>
              <p className="mt-1.5 text-[13px] font-light leading-relaxed text-mute">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      {done ? (
        <p className="mt-4 rounded-lg bg-gold/10 px-3.5 py-3 text-[12.5px] font-light text-ink">
          Thanks — your review is pending approval.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-mute">Write a review</div>
          <div className="mt-3">
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-3 w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-[13px] text-ink placeholder:text-mute focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you think?"
            rows={3}
            className="mt-2 w-full resize-none rounded-lg border border-ink/15 bg-paper px-3 py-2 text-[13px] text-ink placeholder:text-mute focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
          />
          {error && <p className="mt-2 text-[11.5px] text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="mt-3 rounded-full bg-ink px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-ink/90 disabled:opacity-50"
          >
            {sending ? "Submitting…" : "Submit review"}
          </button>
        </form>
      )}
    </div>
  );
}

function Swatches({ colors }: { colors: string[] }) {
  return (
    <div className="mt-3 flex items-center gap-1.5">
      {colors.map((c, i) => (
        <span key={i} className="h-3 w-3 rounded-full ring-1 ring-ink/15" style={{ background: c }} />
      ))}
    </div>
  );
}

export function PDPModal() {
  const { products, pdp, setPdp, add, setCartOpen, toggleWish, inWish, recordView } = useShop();
  const [variant, setVariant] = useState("");
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  useEffect(() => {
    if (pdp) {
      const v = variantsFor(pdp.art);
      setVariant(v ? v.opts[0] : "");
      setQty(1);
      setImgIdx(0);
    }
  }, [pdp]);
  // Record the opened product as recently viewed. Key on the id only so
  // switching products re-records; recordView mutates `recent`, which must
  // NOT be a dependency here (would loop).
  useEffect(() => {
    if (pdp) recordView(pdp.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdp?.id]);
  if (!pdp) return null;
  const v = variantsFor(pdp.art);
  const sold = pdp.stock === 0;
  const low = pdp.stock > 0 && pdp.stock <= 5;
  const saved = inWish(pdp.id);
  const addToCart = () => { add(pdp, variant, qty); setPdp(null); setCartOpen(true); };
  const related = products.filter((p) => p.status === "Active" && p.collection === pdp.collection && p.id !== pdp.id).slice(0, 3);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={() => setPdp(null)}></div>
      <div className="relative grid max-h-[92vh] w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-paper shadow-2xl md:grid-cols-2">
        <button onClick={() => setPdp(null)} className="absolute right-3 top-3 z-10 rounded-full bg-paper/70 p-2 text-ink/60 hover:text-ink" aria-label="Close"><CloseIcon size={18} /></button>
        <div className="relative flex items-center justify-center bg-sand/40 p-10">
          {pdp.images.length > 0 ? (
            <ProductMedia art={pdp.art} imageUrl={pdp.images[imgIdx] ?? pdp.images[0]} alt={pdp.name} imgClass="h-full w-full object-cover" />
          ) : (
            <div className="scale-[1.55]">{Art[pdp.art]}</div>
          )}
          <button onClick={() => toggleWish(pdp.id)} aria-label={saved ? "Remove from saved" : "Save piece"}
            className={`absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 shadow-sm transition-colors ${saved ? "text-gold" : "text-ink/55 hover:text-ink"}`}><HeartIcon size={17} filled={saved} /></button>
          {pdp.images.length > 1 && (
            <div className="absolute inset-x-0 bottom-3 flex flex-wrap justify-center gap-2 px-3">
              {pdp.images.map((url, i) => (
                <button key={url} onClick={() => setImgIdx(i)} aria-label={`View photo ${i + 1}`}
                  className={`h-11 w-11 overflow-hidden rounded-md border-2 transition-colors ${i === imgIdx ? "border-gold" : "border-white/70 hover:border-white"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="overflow-y-auto p-8">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">{pdp.collection}</div>
          <h3 className="mt-2 font-serif text-[30px] font-medium leading-tight text-ink">{pdp.name}</h3>
          <div className="mt-2 text-[18px] font-light text-ink">{eur(pdp.price)}</div>
          <p className="mt-4 text-[13.5px] font-light leading-relaxed text-mute">{pdp.desc}</p>
          <div className="mt-3 text-[12px] tracking-wide text-mute">{pdp.material}</div>
          <Swatches colors={pdp.swatches} />
          {v && !sold && (
            <div className="mt-5">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-mute">{v.label}</div>
              <div className="flex flex-wrap gap-2">
                {v.opts.map((o) => (
                  <button key={o} onClick={() => setVariant(o)} className={`rounded-full border px-3.5 py-1.5 text-[12px] tracking-wide transition-colors ${variant === o ? "border-gold bg-gold/10 text-gold" : "border-ink/20 text-ink/70 hover:border-ink/40"}`}>{o}</button>
                ))}
              </div>
            </div>
          )}
          {sold ? (
            <NotifyForm />
          ) : (
            <>
              <div className="mt-6 flex items-center gap-5">
                <div className="flex items-center rounded-full border border-ink/20">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1.5 text-ink/70 hover:text-ink">−</button>
                  <span className="w-8 text-center text-[13px] text-ink">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="px-3 py-1.5 text-ink/70 hover:text-ink">+</button>
                </div>
                <span className="text-[12px] text-mute">{pdp.stock + " in stock"}</span>
              </div>
              {low && <div className="mt-3 text-[12px] font-medium text-gold">Only {pdp.stock} left — order soon</div>}
              <button onClick={addToCart}
                className="mt-6 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink py-3.5 text-[12.5px] font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-ink/90">
                Add to cart — {eur(pdp.price * qty)}
              </button>
            </>
          )}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-light tracking-wide text-mute"><TruckIcon size={14} className="text-gold" /> Free EU shipping over €100 · 30-day returns</div>
          {related.length > 0 && (
            <div className="mt-7 border-t border-ink/10 pt-5">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-mute">You may also like</div>
              <div className="grid grid-cols-3 gap-3">
                {related.map((r) => (
                  <button key={r.id} onClick={() => setPdp(r)} className="group text-left">
                    <span className="block"><ArtBox art={r.art} imageUrl={r.imageUrl} box="h-20 w-full" scale="scale-[0.5]" alt={r.name} /></span>
                    <span className="mt-1.5 block truncate text-[11.5px] text-ink transition-colors group-hover:text-gold">{r.name}</span>
                    <span className="block text-[11px] font-light text-mute">{eur(r.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <RecentlyViewed excludeId={pdp?.id} />
          <ReviewsSection productId={pdp.id} />
        </div>
      </div>
    </div>
  );
}
