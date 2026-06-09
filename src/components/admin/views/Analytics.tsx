"use client";

import { useEffect, useState } from "react";
import { eur } from "@/lib/money";
import type { ClientOrder } from "@/lib/order-serialize";
import { Card, PageHeader, Spinner, type ViewProps } from "./_shared";

export function Analytics(_props: ViewProps) {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => setOrders(d.orders || [])).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner />;

  const paid = orders.filter((o) => o.payment === "Paid");
  const revenue = paid.reduce((s, o) => s + o.totalEur, 0);
  const avg = paid.length ? revenue / paid.length : 0;
  const awaiting = orders.filter((o) => o.payment === "Awaiting payment").length;
  const unitsSold = orders.reduce((s, o) => s + o.lines.reduce((a, l) => a + l.qty, 0), 0);

  // top pieces by quantity
  const tally = new Map<string, number>();
  for (const o of orders) for (const l of o.lines) tally.set(l.name, (tally.get(l.name) || 0) + l.qty);
  const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="A quick pulse on sales for the alpha." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Revenue (paid)" value={eur(revenue)} />
        <Kpi label="Paid orders" value={String(paid.length)} />
        <Kpi label="Avg. order value" value={eur(avg)} />
        <Kpi label="Awaiting payment" value={String(awaiting)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">Best sellers</div>
          {top.length === 0 ? (
            <div className="text-[13px] text-mute">No sales yet.</div>
          ) : (
            <div className="space-y-2">
              {top.map(([name, qty]) => (
                <div key={name} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink">{name}</span>
                  <span className="text-mute">{qty} sold</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-6">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">Totals</div>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-mute">Orders</span><span className="text-ink">{orders.length}</span></div>
            <div className="flex justify-between"><span className="text-mute">Units sold</span><span className="text-ink">{unitsSold}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">{label}</div>
      <div className="mt-2 font-serif text-[26px] font-semibold text-ink">{value}</div>
    </Card>
  );
}
