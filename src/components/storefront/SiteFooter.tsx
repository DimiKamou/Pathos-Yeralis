"use client";

// Site footer. Ported from the prototype; the newsletter subscribe now POSTs to
// /api/subscribe instead of PathosStore.pushSubscriber.
import { useState, type ReactNode } from "react";
import { InstaIcon, FbIcon, PinterestIcon, MailIcon, SendIcon } from "@/components/storefront/icons";
import type { ContactSetting, FooterColumn, FooterSetting } from "@/lib/types";

function FooterCol({ column }: { column: FooterColumn }) {
  return (
    <div>
      <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{column.title}</h4>
      <ul className="flex flex-col gap-2.5">
        {column.links.map((l) => <li key={l.label}><a href={l.href || "#"} className="text-[13px] font-light tracking-wide text-[#e9dcc6]/75 transition-colors hover:text-[#f3ead9]">{l.label}</a></li>)}
      </ul>
    </div>
  );
}

export function SiteFooter({ contact, footer }: { contact: ContactSetting; footer: FooterSetting }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const subscribe = async () => {
    if (!email.includes("@")) return;
    try {
      await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "Footer" }) });
    } catch {
      /* ignore */
    }
    setDone(true);
    setEmail("");
  };
  const Social = ({ href, children, label }: { href: string; children: ReactNode; label: string }) => (
    <a href={href} target="_blank" rel="noopener" aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f3ead9]/20 text-[#e9dcc6]/80 transition-colors hover:border-gold hover:text-gold">{children}</a>
  );
  return (
    <footer className="mt-28 bg-[#241f1a] text-[#f3ead9]">
      <div className="mx-auto w-full max-w-[1240px] px-8 py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr]">
          {/* brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <svg width="26" height="21" viewBox="0 0 30 24" fill="none"><path d="M6 2 H24 L28 8 L15 22 L2 8 Z" stroke="#b1894e" strokeWidth="1.1" strokeLinejoin="round" /><path d="M2 8 H28 M11 2 L8 8 L15 22 M19 2 L22 8 L15 22" stroke="#b1894e" strokeWidth="0.8" /></svg>
              <div className="leading-none"><div className="font-serif text-[19px] font-medium tracking-[0.22em]">PATHOS</div><div className="mt-1 font-serif text-[11px] italic tracking-wide text-gold">by Yeralis</div></div>
            </div>
            <p className="mt-5 max-w-xs text-[13px] font-light leading-relaxed text-[#e9dcc6]/70">{footer.tagline}</p>
            <div className="mt-6 flex gap-2.5">
              <Social href={contact.instagram || "#"} label="Instagram"><InstaIcon size={17} /></Social>
              <Social href={footer.facebook || "#"} label="Facebook"><FbIcon size={17} /></Social>
              <Social href={footer.pinterest || "#"} label="Pinterest"><PinterestIcon size={17} /></Social>
              <Social href={`mailto:${contact.email}`} label="Email"><MailIcon size={17} /></Social>
            </div>
          </div>
          {footer.columns.map((col) => <FooterCol key={col.title} column={col} />)}
          {/* newsletter */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Join the list</h4>
            <p className="mb-4 text-[13px] font-light leading-relaxed text-[#e9dcc6]/70">New collections, private previews and 15% off your first order.</p>
            {done ? (
              <div className="flex items-center gap-2 text-[13px] font-light text-gold"><span>✓</span> Thank you — you&apos;re on the list.</div>
            ) : (
              <div className="flex items-center border-b border-[#f3ead9]/25 pb-2">
                <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && subscribe()} placeholder="Your email"
                  className="w-full bg-transparent text-[13px] font-light text-[#f3ead9] placeholder:text-[#e9dcc6]/40 focus:outline-none" />
                <button onClick={subscribe} className="shrink-0 pl-3 text-gold transition-colors hover:text-[#f3ead9]"><SendIcon size={16} /></button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-[#f3ead9]/12 pt-7 text-[11.5px] font-light tracking-wide text-[#e9dcc6]/55 sm:flex-row">
          <div>© 2026 PATHOS by Yeralis · Athens, Greece</div>
          <div className="flex gap-5"><a href="#" className="hover:text-[#f3ead9]">Terms</a><a href="#" className="hover:text-[#f3ead9]">Privacy</a><a href="#" className="hover:text-[#f3ead9]">Cookies</a></div>
          <div>Secure payments · Visa · Mastercard · PayPal</div>
        </div>
      </div>
    </footer>
  );
}
