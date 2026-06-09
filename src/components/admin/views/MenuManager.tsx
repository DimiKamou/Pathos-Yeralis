"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import type { MenuItem } from "@/lib/types";
import { Card, Chip, PageHeader, Spinner, Btn, IconBtn, Toggle, TextInput, type ViewProps } from "./_shared";

export function MenuManager(_props: ViewProps) {
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setItems(d.settings?.menu ?? []));
  }, []);

  async function persist(next: MenuItem[]) {
    setItems(next);
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "menu", value: next }),
    }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!items) return <Spinner />;

  const update = (id: string, patch: Partial<MenuItem>) => persist(items.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  };
  const remove = (id: string) => persist(items.filter((m) => m.id !== id));
  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item-" + Date.now().toString(36);
    persist([...items, { id, label, type: "page", enabled: true }]);
    setNewLabel("");
  };

  return (
    <div>
      <PageHeader
        title="Storefront Menu"
        subtitle="Reorder, rename, enable/disable, or add navigation links shown under the wordmark."
        action={saving ? <span className="text-[12px] text-mute">Saving…</span> : saved ? <span className="text-[12px] text-gold">Saved ✓</span> : undefined}
      />

      <Card className="divide-y divide-ink/[0.06]">
        {items.map((m, i) => (
          <div key={m.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-mute hover:text-ink disabled:opacity-30"><Icon.chevR size={14} className="-rotate-90" /></button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-mute hover:text-ink disabled:opacity-30"><Icon.chevR size={14} className="rotate-90" /></button>
            </div>
            <input
              value={m.label}
              onChange={(e) => update(m.id, { label: e.target.value })}
              className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-[14px] text-ink hover:border-ink/10 focus:border-gold focus:outline-none"
            />
            <Chip tone="grey">{m.type}</Chip>
            {m.system && <Chip tone="gold">system</Chip>}
            <Toggle checked={m.enabled} onChange={(b) => update(m.id, { enabled: b })} />
            {!m.system && <IconBtn tone="danger" title="Remove" onClick={() => remove(m.id)}><Icon.trash size={15} /></IconBtn>}
          </div>
        ))}
      </Card>

      <div className="mt-4 flex max-w-md items-center gap-2">
        <TextInput value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="New menu item label…" />
        <Btn variant="primary" onClick={add}><Icon.plus size={15} /> Add</Btn>
      </div>
    </div>
  );
}
