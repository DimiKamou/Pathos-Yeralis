"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import type { AdminDiscount } from "@/lib/admin-data";
import { Card, Chip, PageHeader, Spinner, Btn, IconBtn, Field, TextInput, Toggle, Modal, type ViewProps } from "./_shared";

export function Discounts(_props: ViewProps) {
  const [discounts, setDiscounts] = useState<AdminDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ code: "", label: "", pct: 10, freeShip: false, active: true, maxUses: "", expiresAt: "" });

  const load = () =>
    fetch("/api/admin/discounts")
      .then((r) => r.json())
      .then((d) => setDiscounts(d.discounts || []))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  async function save() {
    const body = { code: form.code.trim().toUpperCase(), label: form.label || `${form.pct}% off`, pct: form.pct / 100, freeShip: form.freeShip, active: form.active, maxUses: form.maxUses ? Number(form.maxUses) : null, expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null };
    await fetch("/api/admin/discounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => {});
    setAdding(false);
    setForm({ code: "", label: "", pct: 10, freeShip: false, active: true, maxUses: "", expiresAt: "" });
    load();
  }
  async function toggleActive(d: AdminDiscount) {
    setDiscounts((prev) => prev.map((x) => (x.code === d.code ? { ...x, active: !d.active } : x)));
    await fetch(`/api/admin/discounts/${d.code}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !d.active }) }).catch(() => {});
  }
  async function remove(code: string) {
    setDiscounts((prev) => prev.filter((x) => x.code !== code));
    await fetch(`/api/admin/discounts/${code}`, { method: "DELETE" }).catch(() => {});
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Discounts"
        subtitle="Codes are validated server-side at checkout. The live welcome-popup code also works automatically."
        action={<Btn variant="primary" onClick={() => setAdding(true)}><Icon.plus size={15} /> New code</Btn>}
      />
      <Card className="overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.12em] text-mute">
            <tr>
              <th className="px-5 py-3 font-semibold">Code</th>
              <th className="px-5 py-3 font-semibold">Label</th>
              <th className="px-5 py-3 font-semibold">Discount</th>
              <th className="px-5 py-3 font-semibold">Used</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => {
              const expired = !!d.expiresAt && new Date(d.expiresAt).getTime() < Date.now();
              return (
              <tr key={d.code} className="border-b border-ink/[0.06] last:border-0 hover:bg-ink/[0.02]">
                <td className="px-5 py-3">
                  <span className="rounded bg-gold/15 px-2 py-0.5 font-mono text-[12px] text-gold">{d.code}</span>
                  {d.expiresAt && <div className="mt-1 text-[11px] text-mute">Expires {new Date(d.expiresAt).toLocaleDateString()}</div>}
                </td>
                <td className="px-5 py-3 text-ink">{d.label}</td>
                <td className="px-5 py-3 text-mute">{d.freeShip ? "Free shipping" : `${Math.round(d.pct * 100)}% off`}</td>
                <td className="px-5 py-3 text-mute">{d.uses}{d.maxUses != null ? ` / ${d.maxUses}` : ""}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(d)}>
                      <Chip tone={d.active ? "green" : "grey"}>{d.active ? "Active" : "Paused"}</Chip>
                    </button>
                    {expired && <Chip tone="grey">Expired</Chip>}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <IconBtn tone="danger" title="Delete" onClick={() => remove(d.code)}><Icon.trash size={15} /></IconBtn>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {adding && (
        <Modal title="New discount code" onClose={() => setAdding(false)}>
          <div className="space-y-4">
            <Field label="Code"><TextInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER15" /></Field>
            <Field label="Label"><TextInput value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="15% off" /></Field>
            <Field label="Percentage off">
              <TextInput type="number" min={0} max={100} value={form.pct} onChange={(e) => setForm({ ...form, pct: Number(e.target.value) })} />
            </Field>
            <Field label="Max uses (blank = unlimited)">
              <TextInput type="number" min={1} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
            </Field>
            <Field label="Expiry date (blank = never)">
              <TextInput type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </Field>
            <Toggle checked={form.freeShip} onChange={(v) => setForm({ ...form, freeShip: v })} label="Free shipping code" />
            <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="Active" />
            <div className="flex justify-end gap-2 pt-2">
              <Btn onClick={() => setAdding(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={save} disabled={form.code.trim().length < 2}>Save code</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
