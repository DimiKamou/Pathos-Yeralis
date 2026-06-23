"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import { Card, Chip, PageHeader, Spinner, EmptyState, Btn, IconBtn, TextInput, type ViewProps } from "./_shared";

interface Collection {
  name: string;
  count: number;
}

export function Collections(_props: ViewProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetch("/api/admin/collections")
      .then((r) => r.json())
      .then((d) => setCollections(d.collections || []))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  async function add() {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    await fetch("/api/admin/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => {});
    setNewName("");
    await load();
    setBusy(false);
  }

  async function rename(from: string) {
    const to = draft.trim();
    if (!to || to === from) {
      setEditing(null);
      return;
    }
    setBusy(true);
    await fetch("/api/admin/collections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to }),
    }).catch(() => {});
    setEditing(null);
    await load();
    setBusy(false);
  }

  async function remove(name: string, count: number) {
    const msg =
      count > 0
        ? `Delete "${name}"? ${count} product${count === 1 ? "" : "s"} will keep this category name but it won't appear in the menu.`
        : `Delete "${name}"?`;
    if (!confirm(msg)) return;
    setCollections((prev) => prev.filter((c) => c.name !== name));
    await fetch("/api/admin/collections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => {});
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Collections"
        subtitle="Add, rename or delete collections. Renaming updates every product in it, and the list drives the storefront menu + each collection page."
      />

      <div className="mb-5 flex max-w-md items-center gap-2">
        <TextInput value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="New collection name…" />
        <Btn variant="primary" onClick={add} disabled={busy || !newName.trim()}>
          <Icon.plus size={15} /> Add
        </Btn>
      </div>

      {collections.length === 0 ? (
        <EmptyState icon={<Icon.layers size={34} />} title="No collections yet" body="Add your first collection above." />
      ) : (
        <Card className="divide-y divide-ink/[0.06]">
          {collections.map((c) => (
            <div key={c.name} className="flex items-center gap-3 px-5 py-3">
              {editing === c.name ? (
                <>
                  <TextInput
                    value={draft}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") rename(c.name);
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className="max-w-xs"
                  />
                  <Btn variant="primary" onClick={() => rename(c.name)} className="!px-3 !py-1.5">
                    Save
                  </Btn>
                  <Btn variant="ghost" onClick={() => setEditing(null)} className="!px-3 !py-1.5">
                    Cancel
                  </Btn>
                </>
              ) : (
                <>
                  <span className="flex-1 text-[14px] font-medium text-ink">{c.name}</span>
                  <Chip tone={c.count > 0 ? "green" : "grey"}>
                    {c.count} product{c.count === 1 ? "" : "s"}
                  </Chip>
                  <a
                    href={`/collections/${c.name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-gold hover:text-ink"
                  >
                    View →
                  </a>
                  <IconBtn
                    title="Rename"
                    onClick={() => {
                      setEditing(c.name);
                      setDraft(c.name);
                    }}
                  >
                    <Icon.gear size={15} />
                  </IconBtn>
                  <IconBtn tone="danger" title="Delete" onClick={() => remove(c.name, c.count)}>
                    <Icon.trash size={15} />
                  </IconBtn>
                </>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
