// Maps a DB order (cents) to the euro-based shape the client + admin render.
import type { Order, OrderLine } from "@prisma/client";

export interface ClientOrderLine {
  name: string;
  art: string;
  variant: string | null;
  qty: number;
  priceEur: number;
}

export interface ClientOrder {
  id: string;
  number: string;
  customer: string;
  email: string;
  country: string;
  payment: string;
  method: string;
  fulfillment: string;
  subtotalEur: number;
  shippingEur: number;
  taxEur: number;
  discountEur: number;
  discountCode: string | null;
  totalEur: number;
  createdAt: string;
  lines: ClientOrderLine[];
}

export function serializeOrderForClient(order: Order & { lines?: OrderLine[] }): ClientOrder {
  return {
    id: order.id,
    number: order.number,
    customer: order.customer,
    email: order.email,
    country: order.country,
    payment: order.payment,
    method: order.method,
    fulfillment: order.fulfillment,
    subtotalEur: order.subtotalCents / 100,
    shippingEur: order.shippingCents / 100,
    taxEur: order.taxCents / 100,
    discountEur: (order.discountCents ?? 0) / 100,
    discountCode: order.discountCode,
    totalEur: order.totalCents / 100,
    createdAt: order.createdAt.toISOString(),
    lines: (order.lines ?? []).map((l) => ({
      name: l.name,
      art: l.art,
      variant: l.variant,
      qty: l.qty,
      priceEur: l.priceCents / 100,
    })),
  };
}
