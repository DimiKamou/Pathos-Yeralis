// On-brand, inline-styled email HTML (survives email clients). The campaign
// template is a parameterized port of prototypes/PATHOS Newsletter.html.
import { eur } from "../money";
import type { BankDetails } from "../bank";

const INK = "#2a241e";
const PAPER = "#f6f0e6";
const CARD = "#fffdf8";
const GOLD = "#b1894e";
const MUTE = "#6f6457";

export interface OrderEmailLine {
  name: string;
  qty: number;
  priceEur: number;
}
export interface OrderEmailData {
  number: string;
  customer: string;
  totalEur: number;
  method: string;
  lines: OrderEmailLine[];
  bank?: BankDetails;
}

function shell(inner: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;background:#ddcfb9;font-family:'Jost',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;border-collapse:collapse;background:${PAPER};border-radius:4px;overflow:hidden;box-shadow:0 24px 60px -28px rgba(42,36,30,.5);">
<tr><td align="center" style="background:${CARD};padding:28px 24px;border-bottom:1px solid #ece2d2;">
<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;font-weight:500;letter-spacing:9px;color:${INK};padding-left:9px;">PATHOS</div>
<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:12px;font-style:italic;letter-spacing:2px;color:${GOLD};margin-top:3px;">by Yeralis</div>
</td></tr>
${inner}
<tr><td align="center" style="background:${INK};padding:28px 40px;">
<p style="font-size:12px;font-weight:300;line-height:1.7;color:#b6a98f;margin:0;max-width:340px;">The Atelier · Adrianou 24, Pláka, Athens 10556<br/>hello@pathos-yeralis.gr</p>
<div style="font-size:10.5px;color:#6b5f4f;margin-top:12px;">© ${new Date().getFullYear()} PATHOS by Yeralis. Handmade in Athens.</div>
</td></tr>
</table></td></tr></table></body></html>`;
}

function lineRows(lines: OrderEmailLine[]): string {
  return lines
    .map(
      (l) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #ece2d2;font-size:13.5px;color:${INK};">${l.name} <span style="color:${MUTE};">× ${l.qty}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid #ece2d2;font-size:13.5px;color:${INK};">${eur(l.priceEur * l.qty)}</td></tr>`,
    )
    .join("");
}

// Paid methods → "Thank you" receipt.
export function orderConfirmationHtml(o: OrderEmailData): string {
  return shell(`
<tr><td style="background:${PAPER};padding:40px 48px 28px;" align="center">
<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:500;color:${INK};">Thank you, ${o.customer.split(" ")[0]}!</div>
<p style="font-size:14px;font-weight:300;line-height:1.8;color:${MUTE};max-width:400px;margin:14px auto 0;">Your order <strong style="color:${INK};">#${o.number}</strong> is confirmed and paid via ${o.method}. We’ll email you again the moment it ships.</p>
</td></tr>
<tr><td style="background:${PAPER};padding:0 48px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
${lineRows(o.lines)}
<tr><td style="padding:14px 0 0;font-size:15px;font-weight:600;color:${INK};">Total</td><td align="right" style="padding:14px 0 0;font-size:15px;font-weight:600;color:${INK};">${eur(o.totalEur)}</td></tr>
</table></td></tr>`);
}

// Bank transfer → "Almost there" with IBAN + reference.
export function bankInstructionsHtml(o: OrderEmailData): string {
  const b = o.bank!;
  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 0;font-size:13px;color:${MUTE};">${k}</td><td align="right" style="padding:4px 0;font-size:13px;color:${INK};font-family:monospace;">${v}</td></tr>`;
  return shell(`
<tr><td style="background:${PAPER};padding:40px 48px 24px;" align="center">
<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:500;color:${INK};">Almost there, ${o.customer.split(" ")[0]}!</div>
<p style="font-size:14px;font-weight:300;line-height:1.8;color:${MUTE};max-width:420px;margin:14px auto 0;">Order <strong style="color:${INK};">#${o.number}</strong> is reserved. Transfer <strong style="color:${INK};">${eur(o.totalEur)}</strong> to the account below using <strong style="color:${INK};">#${o.number}</strong> as the payment reference — we ship the moment it clears.</p>
</td></tr>
<tr><td style="background:${PAPER};padding:0 48px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${CARD};border:1px solid #ece2d2;border-radius:10px;padding:8px 16px;">
<tr><td colspan="2" style="padding:6px 0;"></td></tr>
${row("Beneficiary", b.beneficiary)}
${row("Bank", b.bank)}
${row("IBAN", b.iban)}
${row("BIC", b.bic)}
${row("Reference", "#" + o.number)}
<tr><td colspan="2" style="padding:6px 0;"></td></tr>
</table>
<p style="font-size:12px;font-weight:300;line-height:1.7;color:${MUTE};margin:14px 0 0;">${b.note}</p>
</td></tr>`);
}

// ── Campaign / newsletter (parameterized port of PATHOS Newsletter.html) ──
// Sent when an admin marks an order Shipped.
export function shippedHtml(o: {
  number: string;
  customer: string;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
}): string {
  const trackRow = (k: string, v: string) =>
    `<tr><td style="padding:4px 0;font-size:13px;color:${MUTE};">${k}</td><td align="right" style="padding:4px 0;font-size:13px;color:${INK};font-family:monospace;">${v}</td></tr>`;
  const trackingCard = o.trackingNumber
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${CARD};border:1px solid #ece2d2;border-radius:10px;padding:8px 16px;margin:22px auto 0;max-width:400px;">
<tr><td colspan="2" style="padding:6px 0;"></td></tr>
${o.trackingCarrier ? trackRow("Carrier", o.trackingCarrier) : ""}
${trackRow("Tracking number", o.trackingNumber)}
<tr><td colspan="2" style="padding:6px 0;"></td></tr>
</table>`
    : "";
  return shell(`
<tr><td style="background:${PAPER};padding:42px 48px;" align="center">
<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:500;color:${INK};">On its way, ${o.customer.split(" ")[0]}!</div>
<p style="font-size:14px;font-weight:300;line-height:1.85;color:${MUTE};max-width:400px;margin:14px auto 0;">Good news — your order <strong style="color:${INK};">#${o.number}</strong> has shipped and is on its way to you. Thank you for supporting our atelier.</p>
${trackingCard}
</td></tr>`);
}

export interface CampaignPiece {
  name: string;
  detail: string;
}
export interface CampaignData {
  eyebrow?: string; // "New Collection"
  name: string; // "LITHOS"
  tagline?: string; // "Stone & Sea, shaped by hand"
  arriving?: string; // "Arriving Friday · 19 June"
  storyTitle?: string;
  storyBody?: string;
  pieces?: CampaignPiece[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function campaignHtml(c: CampaignData): string {
  const pieceCard = (p: CampaignPiece) =>
    `<td width="33.33%" align="center" valign="top" style="padding:0 7px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:${CARD};border:1px solid #e7dcc8;border-radius:3px;padding:22px 8px 16px;">
<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;color:${INK};">${p.name}</div>
<div style="font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;color:#9c8e7c;margin-top:4px;">${p.detail}</div>
</td></tr></table></td>`;
  const pieces = (c.pieces && c.pieces.length ? c.pieces : []).slice(0, 3);
  const piecesRow = pieces.length
    ? `<tr><td style="background:${PAPER};padding:8px 40px 14px;" align="center">
<div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${GOLD};margin-bottom:22px;">First Look</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${pieces.map(pieceCard).join("")}</tr></table></td></tr>`
    : "";

  return shell(`
<tr><td style="background:${INK};padding:46px 40px 42px;" align="center">
<div style="font-size:11px;letter-spacing:5px;text-transform:uppercase;color:#c99e60;">${c.eyebrow || "New Collection"}</div>
<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:60px;line-height:1;font-weight:500;letter-spacing:14px;color:#f3ead9;padding-left:14px;margin-top:14px;">${c.name}</div>
${c.tagline ? `<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-style:italic;color:#c99e60;margin-top:10px;">${c.tagline}</div>` : ""}
${c.arriving ? `<div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#e9dcc6;margin-top:18px;">${c.arriving}</div>` : ""}
</td></tr>
${
  c.storyTitle || c.storyBody
    ? `<tr><td style="background:${PAPER};padding:40px 56px 30px;" align="center">
${c.storyTitle ? `<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:500;color:${INK};line-height:1.25;">${c.storyTitle}</div>` : ""}
${c.storyBody ? `<p style="font-size:14.5px;font-weight:300;line-height:1.85;color:${MUTE};max-width:430px;margin:18px auto 0;">${c.storyBody}</p>` : ""}
</td></tr>`
    : ""
}
${piecesRow}
<tr><td style="background:${PAPER};padding:14px 40px 46px;" align="center">
<a href="${c.ctaHref || "#"}" style="display:inline-block;background:${GOLD};color:#fff;font-size:12px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;padding:15px 42px;border-radius:999px;text-decoration:none;">${c.ctaLabel || "Be the first to shop"}</a>
</td></tr>`);
}
