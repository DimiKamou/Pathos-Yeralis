// Server-side serializers + loaders for the admin dashboard. Cents → euros,
// dates → ISO. Reuses serializeOrderForClient + serializeProduct.
import { prisma } from "./prisma";
import { serializeProduct } from "./products";
import { serializeOrderForClient, type ClientOrder } from "./order-serialize";
import type { StoreProduct } from "./types";

export interface AdminMessage {
  id: string;
  name: string | null;
  email: string;
  topic: string;
  message: string;
  read: boolean;
  createdAt: string;
}
export interface AdminSubscriber {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}
export interface AdminCampaign {
  id: string;
  subject: string;
  name: string | null;
  launch: string | null;
  recipients: number;
  status: string;
  createdAt: string;
}
export interface AdminDiscount {
  code: string;
  pct: number;
  label: string;
  freeShip: boolean;
  active: boolean;
}

export async function getOrders(): Promise<ClientOrder[]> {
  const rows = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { lines: true } });
  return rows.map(serializeOrderForClient);
}

export async function getProductsAdmin(): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
  return rows.map(serializeProduct);
}

export async function getMessages(): Promise<AdminMessage[]> {
  const rows = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    topic: m.topic,
    message: m.message,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
  }));
}

export async function getSubscribers(): Promise<AdminSubscriber[]> {
  const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((s) => ({ id: s.id, email: s.email, source: s.source, createdAt: s.createdAt.toISOString() }));
}

export async function getCampaigns(): Promise<AdminCampaign[]> {
  const rows = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((c) => ({
    id: c.id,
    subject: c.subject,
    name: c.name,
    launch: c.launch,
    recipients: c.recipients,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function getDiscounts(): Promise<AdminDiscount[]> {
  const rows = await prisma.discount.findMany({ orderBy: { code: "asc" } });
  return rows.map((d) => ({ code: d.code, pct: d.pct, label: d.label, freeShip: d.freeShip, active: d.active }));
}
