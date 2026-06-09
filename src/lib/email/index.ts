// High-level email actions used by API routes. Thin wrappers over the
// swappable provider + templates so callers don't touch HTML.
import { getEmailProvider } from "./provider";
import {
  orderConfirmationHtml,
  bankInstructionsHtml,
  campaignHtml,
  type OrderEmailData,
  type CampaignData,
} from "./templates";
import { BANK } from "../bank";

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
