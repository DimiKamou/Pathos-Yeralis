"use client";

import { Fragment, useEffect, useState } from "react";
import { eur } from "@/lib/money";
import { Icon } from "@/components/admin/icons";
import type { ClientOrder } from "@/lib/order-serialize";
import { Card, Chip, PageHeader, Spinner, EmptyState, fmtDate, paymentTone, fulfillmentTone, type ViewProps } from "./_shared";

interface Customer {
  email: string;
  name: string;
  orders: number;
  spent: number;
  last: string;
  country: string;
  list: ClientOrder[];
}

export function Customers(_props: ViewProps) {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [q, setQ] = useState("");
  useEffect(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => setOrders(d.orders || [])).finally(() => setLoading(false));
  }, []);
  if (loading) return <Spinner />;

  const map = new Map<string, Customer>();
  for (const o of orders) {
    const key = o.email.toLowerCase();
    const c = map.get(key);
    if (c) {
      c.orders += 1;
      if (o.payment === "Paid") c.spent += o.totalEur;
      if (o.createdAt > c.last) c.last = o.createdAt;
      c.list.push(o);
    } else {
      map.set(key, { email: o.email, name: o.customer, orders: 1, spent: o.payment === "Paid" ? o.totalEur : 0, last: o.createdAt, country: o.country, list: [o] });
    }
  }
  const customers = [...map.values()].sort((a, b) => b.spent - a.spent);
  for (const c of customers) c.list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

  const ql = q.trim().toLowerCase();
  const shown = ql
    ? customers.filter((c) => c.name.toLowerCase().includes(ql) || c.email.toLowerCase().includes(ql))
    : customers;

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${customers.length} customer${customers.length === 1 ? "" : "s"} from orders.`} />
      {customers.length === 0 ? (
        <EmptyState icon={<Icon.users size={34} />} title="No customers yet" body="Customers appear here once orders come in." />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="w-64 rounded-lg border border-ink/15 bg-paper px-3 py-2 text-[13px] text-ink placeholder:text-mute focus:border-gold focus:outline-none" />
            <span className="text-[12px] text-mute">{shown.length} shown</span>
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.12em] text-mute">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Country</th>
                  <th className="px-5 py-3 font-semibold">Orders</th>
                  <th className="px-5 py-3 font-semibold">Spent</th>
                  <th className="px-5 py-3 font-semibold">Last order</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => {
                  const isOpen = expanded === c.email;
                  const paidCount = c.list.filter((o) => o.payment === "Paid").length;
                  const avg = paidCount > 0 ? c.spent / paidCount : 0;
                  const first = c.list.length > 0 ? c.list[c.list.length - 1].createdAt : c.last;
                  return (
                    <Fragment key={c.email}>
                      <tr
                        onClick={() => setExpanded(isOpen ? null : c.email)}
                        className="cursor-pointer border-b border-ink/[0.06] last:border-0 hover:bg-ink/[0.02]"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Icon.chevR size={15} className={`text-mute transition-transform ${isOpen ? "rotate-90" : ""}`} />
                            <div>
                              <div className="text-ink">{c.name}</div>
                              <div className="text-[11.5px] text-mute">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-mute">{c.country}</td>
                        <td className="px-5 py-3 text-ink">{c.orders}</td>
                        <td className="px-5 py-3 font-medium text-ink">{eur(c.spent)}</td>
                        <td className="px-5 py-3 text-mute">{fmtDate(c.last)}</td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-ink/[0.06] bg-sand/40">
                          <td colSpan={5} className="px-5 py-4">
                            <div className="mb-4 flex flex-wrap gap-x-8 gap-y-2">
                              <Kpi label="Total orders" value={String(c.orders)} />
                              <Kpi label="Lifetime spend" value={eur(c.spent)} />
                              <Kpi label="Avg order value" value={eur(avg)} />
                              <Kpi label="First order" value={fmtDate(first)} />
                            </div>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">Order history</div>
                            <table className="w-full text-left text-[12.5px]">
                              <tbody>
                                {c.list.map((o) => (
                                  <tr key={o.id} className="border-b border-ink/[0.06] last:border-0">
                                    <td className="py-1.5 pr-4 font-medium text-ink">#{o.number}</td>
                                    <td className="py-1.5 pr-4 text-mute">{fmtDate(o.createdAt)}</td>
                                    <td className="py-1.5 pr-4"><Chip tone={paymentTone(o.payment)}>{o.payment}</Chip></td>
                                    <td className="py-1.5 pr-4"><Chip tone={fulfillmentTone(o.fulfillment)}>{o.fulfillment}</Chip></td>
                                    <td className="py-1.5 text-right font-medium text-ink">{eur(o.totalEur)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mute">{label}</div>
      <div className="mt-0.5 text-[15px] font-medium text-ink">{value}</div>
    </div>
  );
}
