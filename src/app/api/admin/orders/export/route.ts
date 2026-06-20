import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

// Orders as CSV (accounting / fulfillment export).
export async function GET() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { lines: true } });
  const header = [
    "Order", "Date", "Customer", "Email", "Country", "Items",
    "Subtotal", "Discount", "Shipping", "Total", "Payment", "Method", "Fulfillment",
  ];
  const rows = orders.map((o) => [
    "#" + o.number,
    o.createdAt.toISOString().slice(0, 10),
    o.customer,
    o.email,
    o.country,
    o.lines.reduce((s, l) => s + l.qty, 0),
    (o.subtotalCents / 100).toFixed(2),
    ((o.discountCents ?? 0) / 100).toFixed(2),
    (o.shippingCents / 100).toFixed(2),
    (o.totalCents / 100).toFixed(2),
    o.payment,
    o.method,
    o.fulfillment,
  ]);
  const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pathos-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
