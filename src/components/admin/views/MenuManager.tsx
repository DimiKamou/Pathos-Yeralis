"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import type { MenuItem } from "@/lib/types";
import { Card, Chip, PageHeader, Spinner, Btn, IconBtn, Toggle, TextInput, type ViewProps } from "./_shared";

export function MenuManager(_props: ViewProps) {
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [collections, setCollections] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCollection, setNewCollection] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.settings?.menu ?? []);
        setCollections(d.settings?.collections ?? []);
      });
  }, []);

  async function persist(key: "menu" | "collections", value: unknown, apply: () => void) {
    apply();
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!items || !collections) return <Spinner />;

  // ── top-level menu ──
  const saveMenu = (next: MenuItem[]) => persist("menu", next, () => setItems(next));
  const updateItem = (id: string, patch: Partial<MenuItem>) => saveMenu(items.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const moveItem = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    saveMenu(next);
  };
  const removeItem = (id: string) => saveMenu(items.filter((m) => m.id !== id));
  const addItem = () => {
    const label = newLabel.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item-" + Date.now().toString(36);
    saveMenu([...items, { id, label, type: "page", enabled: true }]);
    setNewLabel("");
  };

  // ── collections dropdown ──
  const saveCols = (next: string[]) => persist("collections", next, () => setCollections(next));
  const renameCol = (i: number, label: string) => saveCols(collections.map((c, j) => (j === i ? label : c)));
  const moveCol = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= collections.length) return;
    const next = collections.slice();
    [next[i], next[j]] = [next[j], next[i]];
    saveCols(next);
  };
  const removeCol = (i: number) => saveCols(collections.filter((_, j) => j !== i));
  const addCol = () => {
    const label = newCollection.trim();
    if (!label) return;
    saveCols([...collections, label]);
    setNewCollection("");
  };

  const Reorder = ({ i, len, onMove }: { i: number; len: number; onMove: (d: -1 | 1) => void }) => (
    <div className="flex flex-col">
      <button onClick={() => onMove(-1)} disabled={i === 0} className="text-mute hover:text-ink disabled:opacity-30"><Icon.chevR size={14} className="-rotate-90" /></button>
      <button onClick={() => onMove(1)} disabled={i === len - 1} className="text-mute hover:text-ink disabled:opacity-30"><Icon.chevR size={14} className="rotate-90" /></button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Storefront Menu"
        subtitle="Edit the top navigation and the Collections dropdown. Changes appear on the storefront immediately."
        action={saving ? <span className="text-[12px] text-mute">Saving…</span> : saved ? <span className="text-[12px] text-gold">Saved ✓</span> : undefined}
      />

      {/* Top-level menu */}
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Top navigation</div>
      <Card className="divide-y divide-ink/[0.06]">
        {items.map((m, i) => (
          <div key={m.id} className="flex items-center gap-3 px-5 py-3">
            <Reorder i={i} len={items.length} onMove={(d) => moveItem(i, d)} />
            <input
              value={m.label}
              onChange={(e) => updateItem(m.id, { label: e.target.value })}
              className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-[14px] text-ink hover:border-ink/10 focus:border-gold focus:outline-none"
            />
            <Chip tone="grey">{m.type}</Chip>
            {m.system && <Chip tone="gold">system</Chip>}
            <Toggle checked={m.enabled} onChange={(b) => updateItem(m.id, { enabled: b })} />
            {!m.system && <IconBtn tone="danger" title="Remove" onClick={() => removeItem(m.id)}><Icon.trash size={15} /></IconBtn>}
          </div>
        ))}
      </Card>
      <div className="mt-3 flex max-w-md items-center gap-2">
        <TextInput value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} placeholder="New menu item label…" />
        <Btn variant="primary" onClick={addItem}><Icon.plus size={15} /> Add</Btn>
      </div>

      {/* Collections dropdown */}
      <div className="mb-2 mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Collections dropdown</div>
      <p className="mb-3 max-w-xl text-[12.5px] text-mute">
        These are the links inside the <span className="text-ink">Collections</span> hover menu. Add, rename, reorder or remove them — the storefront updates on its next load.
      </p>
      <Card className="divide-y divide-ink/[0.06]">
        {collections.length === 0 && <div className="px-5 py-4 text-[13px] text-mute">No collection links yet — add one below.</div>}
        {collections.map((c, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3">
            <Reorder i={i} len={collections.length} onMove={(d) => moveCol(i, d)} />
            <input
              value={c}
              onChange={(e) => renameCol(i, e.target.value)}
              className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-[14px] text-ink hover:border-ink/10 focus:border-gold focus:outline-none"
            />
            <IconBtn tone="danger" title="Remove" onClick={() => removeCol(i)}><Icon.trash size={15} /></IconBtn>
          </div>
        ))}
      </Card>
      <div className="mt-3 flex max-w-md items-center gap-2">
        <TextInput value={newCollection} onChange={(e) => setNewCollection(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCol()} placeholder="New collection name…" />
        <Btn variant="primary" onClick={addCol}><Icon.plus size={15} /> Add collection</Btn>
      </div>
    </div>
  );
}
