"use client";

import { useEffect, useState } from "react";
import { eur } from "@/lib/money";
import { Icon } from "@/components/admin/icons";
import type { ClientOrder } from "@/lib/order-serialize";
import type { AdminMessage, AdminSubscriber } from "@/lib/admin-data";
import type { StoreProduct } from "@/lib/types";
import { Btn, Card, Chip, PageHeader, Spinner, fmtDate, paymentTone, fulfillmentTone, type ViewProps } from "./_shared";

interface Kpi {
  label: string;
  value: string;
  icon: (typeof Icon)[keyof typeof Icon];
}

export function Dashboard({ go }: ViewProps) {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [subscribers, setSubscribers] = useState<AdminSubscriber[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/admin/orders").then((r) => r.json()),
      fetch("/api/admin/subscribers").then((r) => r.json()),
      fetch("/api/admin/messages").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
    ])
      .then(([o, s, m, p]) => {
        if (!alive) return;
        setOrders(o.orders || []);
        setSubscribers(s.subscribers || []);
        setMessages(m.messages || []);
        setProducts(p.products || []);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Spinner />;

  const revenue = orders.filter((o) => o.payment === "Paid").reduce((sum, o) => sum + o.totalEur, 0);
  const unread = messages.filter((m) => !m.read).length;
  const recent = orders.slice(0, 5);

  const low = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const out = products.filter((p) => p.stock === 0);

  const kpis: Kpi[] = [
    { label: "Revenue", value: eur(revenue), icon: Icon.chart },
    { label: "Orders", value: String(orders.length), icon: Icon.bag },
    { label: "Subscribers", value: String(subscribers.length), icon: Icon.mail },
    { label: "Unread messages", value: String(unread), icon: Icon.inbox },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="An overview of the atelier today." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const A = k.icon;
          return (
            <Card key={k.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">{k.label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/12 text-gold">
                  <A size={16} />
                </span>
              </div>
              <div className="mt-3 font-serif text-[30px] font-semibold leading-none text-ink">{k.value}</div>
            </Card>
          );
        })}
      </div>

      {low.length + out.length > 0 && (
        <Card className="mt-6 border-gold/30 bg-gold/[0.06] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                <Icon.box size={18} />
              </span>
              <div>
                <div className="text-[13.5px] font-semibold text-ink">Inventory needs attention</div>
                <div className="mt-0.5 text-[12.5px] text-mute">
                  {out.length} out of stock · {low.length} low on stock
                </div>
              </div>
            </div>
            <Btn variant="ghost" onClick={() => go("inventory")}>
              Review inventory
            </Btn>
          </div>
        </Card>
      )}

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-[20px] font-semibold text-ink">Recent orders</h2>
          <button onClick={() => go("orders")} className="text-[12.5px] font-medium text-gold hover:underline">
            View all
          </button>
        </div>
        <Card className="overflow-hidden">
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center text-[13px] text-mute">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.12em] text-mute">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Payment</th>
                    <th className="px-5 py-3 font-semibold">Fulfillment</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id} className="border-b border-ink/[0.06] last:border-0">
                      <td className="px-5 py-3 font-medium text-ink">#{o.number}</td>
                      <td className="px-5 py-3 text-ink">{o.customer}</td>
                      <td className="px-5 py-3 text-mute">{fmtDate(o.createdAt)}</td>
                      <td className="px-5 py-3 font-medium text-ink">{eur(o.totalEur)}</td>
                      <td className="px-5 py-3">
                        <Chip tone={paymentTone(o.payment)}>{o.payment}</Chip>
                      </td>
                      <td className="px-5 py-3">
                        <Chip tone={fulfillmentTone(o.fulfillment)}>{o.fulfillment}</Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
