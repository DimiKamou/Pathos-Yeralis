"use client";

// Discount entry. Validates locally via catalog.checkDiscount (the original
// validates server-side). Try WELCOME10, ATELIER20, AEGEAN15, or FREESHIP.
import { useState } from "react";
import { useShop } from "./shop-context";

export function DiscountField() {
  const { discount, applyDiscount, clearDiscount } = useShop();
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);

  if (discount) {
    return (
      <div className="flex items-center justify-between border border-garnet/30 bg-garnet/5 px-3.5 py-2.5">
        <span className="font-ui text-[12px] text-garnet">
          <span className="font-600">{discount.code}</span> · {discount.label}
        </span>
        <button onClick={clearDiscount} className="font-ui text-[11px] uppercase tracking-[0.16em] text-ash hover:text-slate">Remove</button>
      </div>
    );
  }

  const apply = () => {
    const d = applyDiscount(code);
    setErr(!d);
    if (d) setCode("");
  };

  return (
    <div>
      <div className="flex items-center border-b border-slate/20 focus-within:border-garnet">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value); setErr(false); }}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="Discount code"
          className="w-full bg-transparent py-2 font-ui text-[13px] uppercase tracking-[0.1em] text-slate placeholder:tracking-normal placeholder:text-ash/70 focus:outline-none"
        />
        <button onClick={apply} className="shrink-0 px-2 font-ui text-[11px] uppercase tracking-[0.16em] text-garnet hover:text-slate">Apply</button>
      </div>
      {err && <p className="mt-1.5 font-ui text-[11px] text-garnet">That code isn&rsquo;t valid — try WELCOME10.</p>}
    </div>
  );
}
