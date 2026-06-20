"use client";

import { Fragment, useEffect, useState } from "react";
import { eur } from "@/lib/money";
import { Icon } from "@/components/admin/icons";
import type { ClientOrder } from "@/lib/order-serialize";
import { Card, Chip, PageHeader, Spinner, fmtDate, paymentTone, fulfillmentTone, Btn, type ViewProps } from "./_shared";

export function Orders(_props: ViewProps) {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => alive && setOrders(d.orders || []))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function patch(id: string, body: { payment?: string; fulfillment?: string }) {
    // optimistic
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...body } : o)));
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.order) setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
    } catch {
      /* keep optimistic state */
    }
  }

  if (loading) return <Spinner />;

  const ql = q.trim().toLowerCase();
  const shown = orders.filter((o) => {
    if (statusFilter !== "all" && o.payment !== statusFilter) return false;
    if (!ql) return true;
    return o.number.toLowerCase().includes(ql) || o.customer.toLowerCase().includes(ql) || o.email.toLowerCase().includes(ql);
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"}.`}
        action={
          <a href="/api/admin/orders/export" className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-[12.5px] font-semibold text-ink/80 hover:bg-ink/[0.04]">
            Export CSV
          </a>
        }
      />

      {orders.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search #order, customer, email…" className="w-64 rounded-lg border border-ink/15 bg-paper px-3 py-2 text-[13px] text-ink placeholder:text-mute focus:border-gold focus:outline-none" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-[13px] text-ink focus:border-gold focus:outline-none">
            <option value="all">All payments</option>
            <option value="Paid">Paid</option>
            <option value="Awaiting payment">Awaiting payment</option>
            <option value="Refunded">Refunded</option>
          </select>
          <span className="text-[12px] text-mute">{shown.length} shown</span>
        </div>
      )}

      {orders.length === 0 ? (
        <Card className="px-6 py-16 text-center text-[13px] text-mute">No orders yet.</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.12em] text-mute">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Method</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Fulfillment</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((o) => {
                  const items = o.lines.reduce((s, l) => s + l.qty, 0);
                  const isOpen = expanded === o.id;
                  return (
                    <Fragment key={o.id}>
                      <tr
                        onClick={() => setExpanded(isOpen ? null : o.id)}
                        className="cursor-pointer border-b border-ink/[0.06] last:border-0 hover:bg-ink/[0.02]"
                      >
                        <td className="px-5 py-3 font-medium text-ink">#{o.number}</td>
                        <td className="px-5 py-3">
                          <div className="text-ink">{o.customer}</div>
                          <div className="text-[11.5px] text-mute">{o.email}</div>
                        </td>
                        <td className="px-5 py-3 text-mute">{fmtDate(o.createdAt)}</td>
                        <td className="px-5 py-3 text-ink">{items}</td>
                        <td className="px-5 py-3 font-medium text-ink">{eur(o.totalEur)}</td>
                        <td className="px-5 py-3 text-mute">{o.method}</td>
                        <td className="px-5 py-3">
                          <Chip tone={paymentTone(o.payment)}>{o.payment}</Chip>
                        </td>
                        <td className="px-5 py-3">
                          <Chip tone={fulfillmentTone(o.fulfillment)}>{o.fulfillment}</Chip>
                        </td>
                        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {o.payment === "Awaiting payment" && (
                              <Btn variant="ghost" onClick={() => patch(o.id, { payment: "Paid" })} className="!px-3 !py-1.5">
                                Mark paid
                              </Btn>
                            )}
                            {o.fulfillment === "Unfulfilled" && (
                              <Btn
                                variant="ghost"
                                onClick={() => patch(o.id, { fulfillment: "Shipped" })}
                                className="!px-3 !py-1.5"
                              >
                                Mark shipped
                              </Btn>
                            )}
                            {o.payment === "Paid" && (
                              <Btn
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Refund order #${o.number}? This restocks the items${o.method === "Card" || o.method === "Apple Pay" || o.method === "Google Pay" ? " and refunds via Stripe" : ""}.`))
                                    patch(o.id, { payment: "Refunded" });
                                }}
                                className="!px-3 !py-1.5"
                              >
                                Refund
                              </Btn>
                            )}
                            <Icon.chevR
                              size={15}
                              className={`text-mute transition-transform ${isOpen ? "rotate-90" : ""}`}
                            />
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-ink/[0.06] bg-sand/40">
                          <td colSpan={9} className="px-5 py-4">
                            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                              <div>
                                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
                                  Line items
                                </div>
                                <table className="w-full text-left text-[12.5px]">
                                  <tbody>
                                    {o.lines.map((l, i) => (
                                      <tr key={i} className="border-b border-ink/[0.06] last:border-0">
                                        <td className="py-1.5 pr-4 text-ink">{l.name}</td>
                                        <td className="py-1.5 pr-4 text-mute">{l.variant || "—"}</td>
                                        <td className="py-1.5 pr-4 text-mute">×{l.qty}</td>
                                        <td className="py-1.5 text-right font-medium text-ink">{eur(l.priceEur * l.qty)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <div className="min-w-[200px] space-y-1 text-[12.5px]">
                                <Row label="Subtotal" value={eur(o.subtotalEur)} />
                                {o.discountEur > 0 && (
                                  <Row
                                    label={`Discount${o.discountCode ? ` · ${o.discountCode}` : ""}`}
                                    value={`-${eur(o.discountEur)}`}
                                  />
                                )}
                                <Row label="Shipping" value={o.shippingEur === 0 ? "Free" : eur(o.shippingEur)} />
                                <div className="mt-1 flex justify-between border-t border-ink/10 pt-1.5 font-semibold text-ink">
                                  <span>Total</span>
                                  <span>{eur(o.totalEur)}</span>
                                </div>
                                <div className="pt-1 text-[11.5px] text-mute">Ships to {o.country}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-mute">
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
