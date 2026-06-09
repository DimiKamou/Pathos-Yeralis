"use client";

import { useEffect, useState } from "react";
import { eur } from "@/lib/money";
import { Icon } from "@/components/admin/icons";
import type { ClientOrder } from "@/lib/order-serialize";
import { Card, PageHeader, Spinner, EmptyState, fmtDate, type ViewProps } from "./_shared";

interface Customer {
  email: string;
  name: string;
  orders: number;
  spent: number;
  last: string;
  country: string;
}

export function Customers(_props: ViewProps) {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
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
    } else {
      map.set(key, { email: o.email, name: o.customer, orders: 1, spent: o.payment === "Paid" ? o.totalEur : 0, last: o.createdAt, country: o.country });
    }
  }
  const customers = [...map.values()].sort((a, b) => b.spent - a.spent);

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${customers.length} customer${customers.length === 1 ? "" : "s"} from orders.`} />
      {customers.length === 0 ? (
        <EmptyState icon={<Icon.users size={34} />} title="No customers yet" body="Customers appear here once orders come in." />
      ) : (
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
              {customers.map((c) => (
                <tr key={c.email} className="border-b border-ink/[0.06] last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3"><div className="text-ink">{c.name}</div><div className="text-[11.5px] text-mute">{c.email}</div></td>
                  <td className="px-5 py-3 text-mute">{c.country}</td>
                  <td className="px-5 py-3 text-ink">{c.orders}</td>
                  <td className="px-5 py-3 font-medium text-ink">{eur(c.spent)}</td>
                  <td className="px-5 py-3 text-mute">{fmtDate(c.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
