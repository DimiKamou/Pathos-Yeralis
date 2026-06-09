"use client";

// Chat widget (questions → admin inbox). Ported from the prototype; submit now
// POSTs to /api/messages instead of PathosStore.pushMessage.
import { useState } from "react";
import { CloseIcon, MailIcon, SendIcon, ChatIcon } from "@/components/storefront/icons";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "General", message: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async () => {
    if (!form.email.includes("@") || form.message.trim().length < 2) return;
    try {
      await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } catch {
      /* ignore */
    }
    setSent(true);
  };
  const reset = () => { setForm({ name: "", email: "", topic: "General", message: "" }); setSent(false); };
  const field = "w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-[13px] text-ink placeholder:text-mute focus:border-gold focus:outline-none";
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[330px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-[0_24px_60px_-20px_rgba(40,30,15,0.45)]">
          <div className="flex items-center justify-between bg-[#2a241e] px-5 py-4">
            <div>
              <div className="font-serif text-[17px] font-medium text-[#f3ead9]">Questions? Ask us</div>
              <div className="mt-0.5 text-[11px] font-light text-[#e9dcc6]/65">We reply by email within 24 hours.</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#f3ead9]/55 hover:text-[#f3ead9]" aria-label="Close chat"><CloseIcon size={18} /></button>
          </div>
          {sent ? (
            <div className="px-5 py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold"><MailIcon size={22} /></div>
              <div className="font-serif text-[20px] font-medium text-ink">Message sent</div>
              <p className="mx-auto mt-2 max-w-[16rem] text-[13px] font-light leading-relaxed text-mute">Thanks{form.name ? ", " + form.name.split(" ")[0] : ""}! We&apos;ve logged your question and a copy has gone to our team — we&apos;ll reply to <span className="text-ink">{form.email}</span> shortly.</p>
              <button onClick={reset} className="mt-5 text-[12px] font-medium uppercase tracking-[0.16em] text-gold hover:text-ink">Ask another →</button>
            </div>
          ) : (
            <div className="space-y-3 p-5">
              <div className="grid grid-cols-2 gap-3">
                <input className={field} placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                <select className={field} value={form.topic} onChange={(e) => set("topic", e.target.value)}>
                  {["General", "Order", "Sizing", "Custom piece", "Wholesale"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <input className={field} placeholder="Email *" value={form.email} onChange={(e) => set("email", e.target.value)} />
              <textarea className={field + " resize-none"} rows={3} placeholder="How can we help? *" value={form.message} onChange={(e) => set("message", e.target.value)}></textarea>
              <button onClick={submit} className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gold py-2.5 text-[12.5px] font-medium tracking-wide text-white transition-colors hover:bg-gold/90"><SendIcon size={15} />Send message</button>
              <p className="text-center text-[11px] font-light text-mute">Prefer email? <a href="mailto:hello@pathos-jewelry.com" className="text-gold hover:underline">hello@pathos-jewelry.com</a></p>
            </div>
          )}
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} aria-label="Open chat"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-white shadow-[0_12px_30px_-8px_rgba(177,137,78,0.7)] transition-transform hover:scale-105">
        {open ? <CloseIcon size={22} /> : <ChatIcon size={24} />}
      </button>
    </div>
  );
}
