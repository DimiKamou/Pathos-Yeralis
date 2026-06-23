"use client";

// Abandoned carts — shoppers who entered valid details and reached the Payment
// step but didn't complete the order. Captured server-side (one snapshot per
// email) so the seller can follow up manually. Marked recovered automatically
// when that email later places an order, so this list only shows open ones.
import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import { eur } from "@/lib/money";
import type { AdminAbandonedCart } from "@/lib/admin-data";
import { Card, PageHeader, Spinner, EmptyState, Btn, fmtDate, type ViewProps } from "./_shared";

// Short muted summary of the first couple of item names, e.g. "Hematite Necklace, Lava Bracelet +2 more".
function itemSummary(items: { name: string; qty: number }[]): string {
  if (items.length === 0) return "—";
  const head = items.slice(0, 2).map((i) => i.name).join(", ");
  const rest = items.length - 2;
  return rest > 0 ? `${head} +${rest} more` : head;
}

export function AbandonedCarts(_props: ViewProps) {
  const [carts, setCarts] = useState<AdminAbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/abandoned")
      .then((r) => r.json())
      .then((d) => setCarts(d.carts || []))
      .finally(() => setLoading(false));
  }, []);

  async function dismiss(id: string) {
    setCarts((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/admin/abandoned/${id}`, { method: "DELETE" }).catch(() => {});
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Abandoned carts"
        subtitle={`${carts.length} cart${carts.length === 1 ? "" : "s"} where a shopper entered their details but didn't check out.`}
      />
      {carts.length === 0 ? (
        <EmptyState
          icon={<Icon.bell size={34} />}
          title="No abandoned carts"
          body="Carts where a shopper entered their details but didn't check out will appear here."
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.12em] text-mute">
              <tr>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Items</th>
                <th className="px-5 py-3 font-semibold">Value</th>
                <th className="px-5 py-3 font-semibold">Last seen</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carts.map((c) => (
                <tr key={c.id} className="border-b border-ink/[0.06] last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3">
                    <a href={`mailto:${c.email}`} className="text-ink hover:text-gold">{c.email}</a>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-ink">{c.itemCount} item{c.itemCount === 1 ? "" : "s"}</div>
                    <div className="text-[11.5px] text-mute">{itemSummary(c.items)}</div>
                  </td>
                  <td className="px-5 py-3 font-medium text-ink">{eur(c.valueEur)}</td>
                  <td className="px-5 py-3 text-mute">{fmtDate(c.updatedAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <Btn variant="ghost" onClick={() => dismiss(c.id)}>Dismiss</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
