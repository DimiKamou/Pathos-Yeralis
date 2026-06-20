"use client";

// Printable packing slip — rendered as a fixed overlay over the admin. The
// print CSS hides everything except #packing-slip so only the document prints.
import type { ClientOrder } from "@/lib/order-serialize";

const INK = "#2a241e";
const GOLD = "#b1894e";
const PAPER = "#f6f0e6";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

function eur(n: number): string {
  return `€${n.toFixed(2)}`;
}

export function PackingSlip({ order, onClose }: { order: ClientOrder; onClose: () => void }) {
  const totalItems = order.lines.reduce((s, l) => s + l.qty, 0);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      style={{ background: "rgba(20,16,12,0.55)" }}
    >
      <style>{`@media print {
        body * { visibility: hidden }
        #packing-slip, #packing-slip * { visibility: visible }
        #packing-slip { position: absolute; inset: 0 }
        .no-print { display: none }
      }`}</style>

      <div
        id="packing-slip"
        className="my-auto w-full max-w-[800px] shadow-[0_24px_60px_-24px_rgba(20,16,12,0.5)]"
        style={{ background: PAPER, color: INK, fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        <div className="px-10 py-10 sm:px-14 sm:py-12">
          {/* header */}
          <div className="flex items-start justify-between border-b pb-6" style={{ borderColor: `${INK}22` }}>
            <div>
              <div
                className="text-[26px] font-medium leading-none"
                style={{ letterSpacing: "0.34em", paddingLeft: "0.34em" }}
              >
                PATHOS
              </div>
              <div className="mt-2 text-[12px] italic" style={{ color: GOLD, letterSpacing: "0.12em" }}>
                by Yeralis
              </div>
            </div>
            <div className="text-right">
              <div className="text-[20px] font-semibold leading-none">Packing slip</div>
              <div className="mt-2 text-[13px]" style={{ color: `${INK}99` }}>
                Order #{order.number}
              </div>
              <div className="text-[13px]" style={{ color: `${INK}99` }}>
                {fmtDate(order.createdAt)}
              </div>
            </div>
          </div>

          {/* ship-to */}
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.12em", color: GOLD }}>
                Ship to
              </div>
              <div className="text-[14px] leading-relaxed">
                <div className="font-semibold">{order.customer}</div>
                {order.shipAddress && <div>{order.shipAddress}</div>}
                {(order.shipCity || order.shipZip) && (
                  <div>
                    {[order.shipZip, order.shipCity].filter(Boolean).join(" ")}
                  </div>
                )}
                <div>{order.country}</div>
                {order.email && (
                  <div className="mt-1 text-[12.5px]" style={{ color: `${INK}99` }}>
                    {order.email}
                  </div>
                )}
              </div>
            </div>
            <div className="sm:text-right">
              <div className="mb-2 text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.12em", color: GOLD }}>
                Details
              </div>
              <div className="text-[13px] leading-relaxed" style={{ color: `${INK}cc` }}>
                <div>Method: {order.method}</div>
                <div>Payment: {order.payment}</div>
                <div>
                  {totalItems} item{totalItems === 1 ? "" : "s"}
                </div>
              </div>
            </div>
          </div>

          {/* line items */}
          <table className="mt-10 w-full border-collapse text-left text-[13px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${INK}33` }}>
                <th className="py-2 pr-4 text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.12em", color: `${INK}99`, width: "60px" }}>
                  Qty
                </th>
                <th className="py-2 pr-4 text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.12em", color: `${INK}99` }}>
                  Item
                </th>
                <th className="py-2 text-right text-[11px] font-semibold uppercase" style={{ letterSpacing: "0.12em", color: `${INK}99` }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((l, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${INK}14` }}>
                  <td className="py-3 pr-4 align-top font-semibold">×{l.qty}</td>
                  <td className="py-3 pr-4 align-top">
                    <div className="font-medium">{l.name}</div>
                    {l.variant && (
                      <div className="text-[12px]" style={{ color: `${INK}99` }}>
                        {l.variant}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right align-top">{eur(l.priceEur * l.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-[280px] space-y-1.5 text-[13px]">
              <Row label="Subtotal" value={eur(order.subtotalEur)} />
              {order.discountEur > 0 && <Row label="Discount" value={`-${eur(order.discountEur)}`} />}
              <Row label="Shipping" value={order.shippingEur === 0 ? "Free" : eur(order.shippingEur)} />
              {order.taxEur > 0 && <Row label="Tax" value={eur(order.taxEur)} />}
              <div
                className="flex justify-between pt-2 text-[15px] font-semibold"
                style={{ borderTop: `1px solid ${INK}33` }}
              >
                <span>Total</span>
                <span>{eur(order.totalEur)}</span>
              </div>
            </div>
          </div>

          {/* footer note */}
          <div className="mt-12 border-t pt-6 text-center text-[12px]" style={{ borderColor: `${INK}1a`, color: `${INK}88` }}>
            Thank you for choosing PATHOS by Yeralis.
          </div>
        </div>
      </div>

      {/* actions — hidden when printing */}
      <div className="no-print fixed bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        <button
          onClick={() => window.print()}
          className="rounded-full px-6 py-2.5 text-[13px] font-semibold shadow-lg transition-opacity hover:opacity-90"
          style={{ background: INK, color: PAPER }}
        >
          Print
        </button>
        <button
          onClick={onClose}
          className="rounded-full px-6 py-2.5 text-[13px] font-semibold shadow-lg transition-opacity hover:opacity-90"
          style={{ background: PAPER, color: INK, border: `1px solid ${INK}26` }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between" style={{ color: `${INK}cc` }}>
      <span>{label}</span>
      <span style={{ color: INK }}>{value}</span>
    </div>
  );
}
