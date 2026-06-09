"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import type { ClientOrder } from "@/lib/order-serialize";
import { Card, Chip, PageHeader, Spinner, EmptyState, Btn, fmtDate, fulfillmentTone, type ViewProps } from "./_shared";

export function Deliveries(_props: ViewProps) {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => setOrders(d.orders || [])).finally(() => setLoading(false));
  }, []);

  async function patch(id: string, fulfillment: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, fulfillment } : o)));
    await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fulfillment }) }).catch(() => {});
  }

  if (loading) return <Spinner />;
  const pending = orders.filter((o) => o.fulfillment !== "Delivered");

  return (
    <div>
      <PageHeader title="Deliveries" subtitle={`${pending.length} order${pending.length === 1 ? "" : "s"} to ship or deliver.`} />
      {pending.length === 0 ? (
        <EmptyState icon={<Icon.truck size={34} />} title="Nothing to ship" body="Paid orders awaiting fulfillment will show up here." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.12em] text-mute">
              <tr>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Ship to</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((o) => (
                <tr key={o.id} className="border-b border-ink/[0.06] last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3 font-medium text-ink">#{o.number}</td>
                  <td className="px-5 py-3 text-ink">{o.customer}</td>
                  <td className="px-5 py-3 text-mute">{o.country}</td>
                  <td className="px-5 py-3 text-mute">{fmtDate(o.createdAt)}</td>
                  <td className="px-5 py-3"><Chip tone={fulfillmentTone(o.fulfillment)}>{o.fulfillment}</Chip></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {o.fulfillment === "Unfulfilled" && <Btn onClick={() => patch(o.id, "Shipped")} className="!px-3 !py-1.5">Mark shipped</Btn>}
                      {o.fulfillment === "Shipped" && <Btn onClick={() => patch(o.id, "Delivered")} className="!px-3 !py-1.5">Mark delivered</Btn>}
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
