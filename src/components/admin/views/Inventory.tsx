"use client";

import { useEffect, useState } from "react";
import type { StoreProduct } from "@/lib/types";
import { Icon } from "@/components/admin/icons";
import { Btn, Card, Chip, IconBtn, PageHeader, Spinner, type ViewProps } from "./_shared";

function stockChip(stock: number) {
  if (stock === 0) return <Chip tone="grey">Out of stock</Chip>;
  if (stock <= 5) return <Chip tone="gold">{stock} left</Chip>;
  return <Chip tone="green">{stock} in stock</Chip>;
}

function StockCell({ product, onSaved }: { product: StoreProduct; onSaved: (p: StoreProduct) => void }) {
  const [value, setValue] = useState<string>(String(product.stock));
  const [saving, setSaving] = useState(false);

  // Keep the input in sync if the product stock changes from elsewhere.
  useEffect(() => {
    setValue(String(product.stock));
  }, [product.stock]);

  const parsed = Math.max(0, Math.floor(Number(value)));
  const valid = value.trim() !== "" && Number.isFinite(Number(value));
  const changed = valid && parsed !== product.stock;

  async function save() {
    if (!changed || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: parsed }),
      });
      const data = await res.json();
      if (res.ok && data?.ok && data.product) {
        onSaved(data.product as StoreProduct);
      } else {
        // Revert to the last known good value on failure.
        setValue(String(product.stock));
      }
    } catch {
      setValue(String(product.stock));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="min-w-[88px]">{stockChip(product.stock)}</span>
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        disabled={saving}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        className="w-16 rounded border border-ink/15 bg-paper px-2 py-1 text-[13px] text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 disabled:opacity-50"
      />
      {changed && (
        <IconBtn onClick={save} title="Save stock">
          {saving ? <Icon.layers size={16} /> : <Icon.check size={16} />}
        </IconBtn>
      )}
    </div>
  );
}

export function Inventory(_props: ViewProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowOnly, setLowOnly] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const low = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const out = products.filter((p) => p.stock === 0).length;
  const visible = lowOnly ? products.filter((p) => p.stock <= 5) : products;

  function updateProduct(updated: StoreProduct) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${products.length} products · ${low} low stock · ${out} out of stock.`}
        action={
          <Btn variant="ghost" onClick={() => setLowOnly((v) => !v)} className={lowOnly ? "border-gold/40 text-gold" : ""}>
            <Icon.box size={15} />
            {lowOnly ? "Showing low stock" : "Low stock only"}
          </Btn>
        }
      />
      <Card className="overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.12em] text-mute">
            <tr>
              <th className="px-5 py-3 font-semibold">SKU</th>
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Collection</th>
              <th className="px-5 py-3 font-semibold">Sold</th>
              <th className="px-5 py-3 font-semibold">Stock</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-[13px] text-mute">
                  {lowOnly ? "No low-stock products." : "No products yet."}
                </td>
              </tr>
            ) : (
              visible.map((p) => (
                <tr key={p.id} className="border-b border-ink/[0.06] last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3 font-mono text-[12px] text-mute">{p.id}</td>
                  <td className="px-5 py-3 text-ink">{p.name}</td>
                  <td className="px-5 py-3 text-mute">{p.collection}</td>
                  <td className="px-5 py-3 text-mute">{p.sold}</td>
                  <td className="px-5 py-3">
                    <StockCell product={p} onSaved={updateProduct} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
