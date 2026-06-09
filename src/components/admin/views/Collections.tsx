"use client";

import { useEffect, useState } from "react";
import { Art } from "@/components/storefront/art";
import { Icon } from "@/components/admin/icons";
import type { StoreProduct } from "@/lib/types";
import { Card, Chip, PageHeader, Spinner, EmptyState, type ViewProps } from "./_shared";

export function Collections(_props: ViewProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner />;

  const groups = new Map<string, StoreProduct[]>();
  for (const p of products) {
    const arr = groups.get(p.collection) || [];
    arr.push(p);
    groups.set(p.collection, arr);
  }
  const collections = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <div>
      <PageHeader title="Collections" subtitle={`${collections.length} collections across ${products.length} products.`} />
      {collections.length === 0 ? (
        <EmptyState icon={<Icon.layers size={34} />} title="No collections yet" body="Add products to start grouping them into collections." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map(([name, items]) => {
            const active = items.filter((p) => p.status === "Active").length;
            const stock = items.reduce((s, p) => s + p.stock, 0);
            return (
              <Card key={name} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="font-serif text-[20px] font-semibold text-ink">{name}</div>
                  <div className="flex -space-x-3">
                    {items.slice(0, 3).map((p) => (
                      <div key={p.id} className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-ink/10 bg-sand/50">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="scale-[0.28]">{Art[p.art] || Art.drop}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Chip tone="green">{active} active</Chip>
                  <Chip tone="grey">{items.length} total</Chip>
                  <Chip tone="gold">{stock} in stock</Chip>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
