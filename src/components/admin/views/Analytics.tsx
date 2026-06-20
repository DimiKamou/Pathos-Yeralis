"use client";

import { useEffect, useState } from "react";
import { eur } from "@/lib/money";
import type { ClientOrder } from "@/lib/order-serialize";
import { Card, PageHeader, Spinner, type ViewProps } from "./_shared";

// Local YYYY-MM-DD key for a Date (used to bucket orders by calendar day).
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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

  // Order status breakdown (payment + fulfillment).
  const countBy = (key: keyof ClientOrder, val: string) =>
    orders.filter((o) => o[key] === val).length;
  const payPaid = countBy("payment", "Paid");
  const payAwaiting = countBy("payment", "Awaiting payment");
  const payRefunded = countBy("payment", "Refunded");
  const fulUnfulfilled = countBy("fulfillment", "Unfulfilled");
  const fulShipped = countBy("fulfillment", "Shipped");
  const fulDelivered = countBy("fulfillment", "Delivered");

  // Revenue — last 14 calendar days (oldest → newest), paid orders only.
  const today = new Date();
  const days: { key: string; label: string; val: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ key: dayKey(d), label: String(d.getDate()), val: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.key, i] as const));
  for (const o of paid) {
    const idx = dayIndex.get(dayKey(new Date(o.createdAt)));
    if (idx !== undefined) days[idx].val += o.totalEur;
  }
  const maxDay = days.reduce((m, d) => (d.val > m ? d.val : m), 0);
  const last14Total = days.reduce((s, d) => s + d.val, 0);

  // Best sellers — units + revenue per product name, ranked by revenue.
  const tally = new Map<string, { units: number; revenue: number }>();
  for (const o of orders) {
    for (const l of o.lines) {
      const cur = tally.get(l.name) || { units: 0, revenue: 0 };
      cur.units += l.qty;
      cur.revenue += l.priceEur * l.qty;
      tally.set(l.name, cur);
    }
  }
  const top = [...tally.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  // Repeat-customer rate — grouped by lowercased email.
  const byCustomer = new Map<string, number>();
  for (const o of orders) {
    const k = o.email.toLowerCase();
    byCustomer.set(k, (byCustomer.get(k) || 0) + 1);
  }
  const totalCustomers = byCustomer.size;
  const repeatCustomers = [...byCustomer.values()].filter((n) => n > 1).length;
  const repeatPct = totalCustomers ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="A quick pulse on sales for the alpha." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Revenue (paid)" value={eur(revenue)} />
        <Kpi label="Paid orders" value={String(paid.length)} />
        <Kpi label="Avg. order value" value={eur(avg)} />
        <Kpi label="Repeat customers" value={`${repeatPct}% (${repeatCustomers}/${totalCustomers})`} />
      </div>

      {/* Revenue — last 14 days mini bar chart */}
      <Card className="mt-4 p-6">
        <div className="mb-4 flex items-end justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
            Revenue · last 14 days
          </div>
          <div className="font-serif text-[18px] font-semibold text-ink">{eur(last14Total)}</div>
        </div>
        {last14Total === 0 ? (
          <div className="text-[13px] text-mute">No paid orders in the last 14 days.</div>
        ) : (
          <div className="flex h-28 items-end gap-1.5">
            {days.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-28 w-full items-end">
                  <div
                    className="w-full rounded-t-sm bg-gold transition-all"
                    style={{ height: `${maxDay ? (d.val / maxDay) * 100 : 0}%` }}
                    title={`${d.key} · ${eur(d.val)}`}
                  />
                </div>
                <div className="text-[10px] text-mute">{d.label}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Best sellers — by revenue and units */}
        <Card className="p-6">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
            Best sellers
          </div>
          {top.length === 0 ? (
            <div className="text-[13px] text-mute">No sales yet.</div>
          ) : (
            <div className="space-y-2.5">
              {top.map(([name, agg]) => (
                <div key={name} className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="truncate text-ink">{name}</span>
                  <span className="shrink-0 text-mute">
                    {agg.units} sold · <span className="font-semibold text-ink">{eur(agg.revenue)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Order status breakdown */}
        <Card className="p-6">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
            Order status
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
            <StatRow label="Paid" value={payPaid} />
            <StatRow label="Unfulfilled" value={fulUnfulfilled} />
            <StatRow label="Awaiting payment" value={payAwaiting} />
            <StatRow label="Shipped" value={fulShipped} />
            <StatRow label="Refunded" value={payRefunded} />
            <StatRow label="Delivered" value={fulDelivered} />
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

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-mute">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
