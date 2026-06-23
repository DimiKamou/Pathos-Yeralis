"use client";

// Shared discount-code field (cart + checkout). Ported from the prototype;
// validation now happens server-side via the async applyDiscount() in context.
import { useState } from "react";
import { useShop } from "./shop-context";

export function DiscountField({ dark }: { dark?: boolean }) {
  const { discount, applyDiscount, clearDiscount } = useShop();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    const d = await applyDiscount(code);
    setBusy(false);
    if (!d) setErr("That code isn’t valid");
    else {
      setErr("");
      setCode("");
    }
  };

  if (discount) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-gold/12 px-3 py-2.5 text-[12.5px]">
        <span className="flex items-center gap-2 text-ink">
          <span className="rounded bg-gold/20 px-1.5 py-0.5 font-mono text-[11px] tracking-wide text-gold">{discount.code}</span>
          {discount.label} applied
        </span>
        <button onClick={clearDiscount} className="text-[11.5px] text-mute hover:text-ink">
          Remove
        </button>
      </div>
    );
  }

  const inputCls = `w-full rounded-lg border px-3 py-2.5 text-[13px] uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal focus:outline-none ${
    dark
      ? "border-[#f3ead9]/25 bg-transparent text-[#f3ead9] placeholder:text-[#e9dcc6]/40 focus:border-gold"
      : "border-ink/15 bg-paper text-ink placeholder:text-mute focus:border-gold"
  }`;

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="Discount code"
          className={inputCls}
        />
        <button
          onClick={apply}
          className="shrink-0 rounded-lg border border-ink/20 px-4 text-[12px] font-medium uppercase tracking-[0.12em] text-ink/80 transition-colors hover:border-ink hover:text-ink"
        >
          Apply
        </button>
      </div>
      {err && <div className="mt-1.5 text-[11px] text-rose-500">{err}</div>}
    </div>
  );
}
