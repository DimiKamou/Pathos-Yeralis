// High-level email actions used by API routes. Thin wrappers over the
// swappable provider + templates so callers don't touch HTML.
import { getEmailProvider } from "./provider";
import {
  orderConfirmationHtml,
  bankInstructionsHtml,
  campaignHtml,
  shippedHtml,
  newOrderOwnerHtml,
  type OrderEmailData,
  type CampaignData,
} from "./templates";
import { BANK } from "../bank";
import { eur } from "../money";

export { getEmailProvider } from "./provider";
export type { CampaignData } from "./templates";

export interface OrderForEmail {
  number: string;
  customer: string;
  email: string;
  payment: string; // Paid | Awaiting payment
  method: string;
  totalEur: number;
  lines: { name: string; qty: number; priceEur: number }[];
}

export async function sendOrderEmail(order: OrderForEmail): Promise<void> {
  const provider = getEmailProvider();
  const data: OrderEmailData = {
    number: order.number,
    customer: order.customer || "there",
    totalEur: order.totalEur,
    method: order.method,
    lines: order.lines,
  };
  const isBank = order.payment === "Awaiting payment";
  const subject = isBank
    ? `Your PATHOS order #${order.number} — complete your bank transfer`
    : `Thank you — PATHOS order #${order.number} confirmed`;
  const html = isBank ? bankInstructionsHtml({ ...data, bank: BANK }) : orderConfirmationHtml(data);
  try {
    await provider.send({ to: order.email, subject, html });
  } catch (err) {
    // Never let a transactional email failure break checkout.
    console.error("[email] order email failed:", err);
  }
  // Also give the shop owner a heads-up (best-effort; never blocks checkout).
  await sendOwnerOrderAlert(order);
}

// The shop owner gets notified of every new order so they don't have to watch
// the dashboard. Delivered to ORDER_NOTIFY_EMAIL, falling back to ADMIN_EMAIL;
// if neither is set it's a no-op. Reply-To is the customer so the owner can
// respond to them directly.
function ownerNotifyAddress(): string | null {
  return process.env.ORDER_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || null;
}

export async function sendOwnerOrderAlert(order: OrderForEmail): Promise<void> {
  const to = ownerNotifyAddress();
  if (!to) return;
  const awaiting = order.payment === "Awaiting payment";
  try {
    await getEmailProvider().send({
      to,
      replyTo: order.email,
      subject: `New order #${order.number} · ${eur(order.totalEur)}${awaiting ? " (awaiting payment)" : ""}`,
      html: newOrderOwnerHtml({
        number: order.number,
        customer: order.customer || "Guest",
        email: order.email,
        method: order.method,
        payment: order.payment,
        totalEur: order.totalEur,
        lines: order.lines,
      }),
    });
  } catch (err) {
    console.error("[email] owner order alert failed:", err);
  }
}

export async function sendShippedEmail(o: {
  number: string;
  customer: string;
  email: string;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
}): Promise<void> {
  try {
    await getEmailProvider().send({
      to: o.email,
      subject: `Your PATHOS order #${o.number} has shipped`,
      html: shippedHtml({
        number: o.number,
        customer: o.customer,
        trackingCarrier: o.trackingCarrier,
        trackingNumber: o.trackingNumber,
      }),
    });
  } catch (err) {
    console.error("[email] shipped email failed:", err);
  }
}

export async function sendCampaign(
  data: CampaignData,
  recipients: string[],
): Promise<{ sent: number }> {
  if (recipients.length === 0) return { sent: 0 };
  const provider = getEmailProvider();
  const html = campaignHtml(data);
  const subject = data.eyebrow ? `${data.eyebrow} — ${data.name}` : data.name;
  // Alpha: send individually (small lists). Batch via provider API later.
  let sent = 0;
  for (const to of recipients) {
    try {
      await provider.send({ to, subject, html });
      sent++;
    } catch (err) {
      console.error(`[email] campaign send to ${to} failed:`, err);
    }
  }
  return { sent };
}
