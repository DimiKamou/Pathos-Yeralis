"use client";

import { useEffect, useState } from "react";
import type { StoreProduct } from "@/lib/types";
import { Card, Chip, PageHeader, Spinner, type ViewProps } from "./_shared";

export function Inventory(_props: ViewProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner />;
  const low = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const out = products.filter((p) => p.stock === 0).length;
  return (
    <div>
      <PageHeader title="Inventory" subtitle={`${products.length} products · ${low} low stock · ${out} out of stock.`} />
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
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink/[0.06] last:border-0 hover:bg-ink/[0.02]">
                <td className="px-5 py-3 font-mono text-[12px] text-mute">{p.id}</td>
                <td className="px-5 py-3 text-ink">{p.name}</td>
                <td className="px-5 py-3 text-mute">{p.collection}</td>
                <td className="px-5 py-3 text-mute">{p.sold}</td>
                <td className="px-5 py-3">
                  {p.stock === 0 ? <Chip tone="grey">Out of stock</Chip> : p.stock <= 5 ? <Chip tone="gold">{p.stock} left</Chip> : <Chip tone="green">{p.stock} in stock</Chip>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
