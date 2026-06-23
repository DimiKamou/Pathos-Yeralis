"use client";

import { useEffect, useRef, useState } from "react";
import { eur } from "@/lib/money";
import { Icon } from "@/components/admin/icons";
import { Art } from "@/components/storefront/art";
import type { StoreProduct } from "@/lib/types";
import {
  Btn,
  Card,
  Chip,
  Field,
  IconBtn,
  Modal,
  PageHeader,
  Select,
  Spinner,
  TextArea,
  TextInput,
  statusTone,
  type ViewProps,
} from "./_shared";

const ART_KEYS = ["bracelet", "necklace", "earrings", "ring", "shell", "drop"];

interface FormState {
  id?: string;
  name: string;
  art: string;
  collection: string;
  price: string;
  stock: string;
  status: string;
  sold: string;
  material: string;
  swatches: string[];
  desc: string;
  images: string[];
}

const blankForm: FormState = {
  name: "",
  art: "bracelet",
  collection: "",
  price: "0",
  stock: "0",
  status: "Active",
  sold: "0",
  material: "",
  swatches: [],
  desc: "",
  images: [],
};

function toForm(p: StoreProduct): FormState {
  return {
    id: p.id,
    name: p.name,
    art: p.art,
    collection: p.collection,
    price: String(p.price),
    stock: String(p.stock),
    status: p.status,
    sold: String(p.sold),
    material: p.material ?? "",
    swatches: p.swatches || [],
    desc: p.desc ?? "",
    images: p.images || [],
  };
}

export function Products(_props: ViewProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const [pr, cr] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/collections").then((r) => r.json()),
    ]);
    setProducts(pr.products || []);
    setCollections((cr.collections || []).map((c: { name: string }) => c.name));
  }

  useEffect(() => {
    let alive = true;
    load().finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length || !form) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (d.ok) setForm((f) => (f ? { ...f, images: [...f.images, ...d.urls] } : f));
      else alert(d.error || "Upload failed");
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const removeImage = (url: string) => form && setForm({ ...form, images: form.images.filter((u) => u !== url) });
  const makePrimary = (url: string) =>
    form && setForm({ ...form, images: [url, ...form.images.filter((u) => u !== url)] });

  async function save() {
    if (!form) return;
    setSaving(true);
    const payload = {
      name: form.name,
      art: form.art,
      collection: form.collection,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      status: form.status,
      sold: Number(form.sold) || 0,
      material: form.material,
      swatches: form.swatches,
      desc: form.desc,
      images: form.images,
    };
    try {
      await fetch(form.id ? `/api/admin/products/${form.id}` : "/api/admin/products", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await load();
      setForm(null);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  // ── Multi-select ──
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === products.length ? new Set() : new Set(products.map((p) => p.id)),
    );
  }

  // ── Bulk actions ──
  async function bulkSetStatus(status: "Active" | "Draft") {
    const ids = Array.from(selected);
    if (!ids.length) return;
    setBusy(true);
    try {
      const updated = await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
            .then((r) => r.json())
            .then((d) => d?.product as StoreProduct | undefined),
        ),
      );
      const byId = new Map(updated.filter(Boolean).map((p) => [p!.id, p!]));
      setProducts((prev) =>
        prev.map((p) => (byId.has(p.id) ? byId.get(p.id)! : selected.has(p.id) ? { ...p, status } : p)),
      );
      setSelected(new Set());
    } finally {
      setBusy(false);
    }
  }

  async function bulkDelete() {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} product${ids.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await Promise.all(ids.map((id) => fetch(`/api/admin/products/${id}`, { method: "DELETE" })));
      const removed = new Set(ids);
      setProducts((prev) => prev.filter((p) => !removed.has(p.id)));
      setSelected(new Set());
    } finally {
      setBusy(false);
    }
  }

  // ── CSV export (client-side) ──
  function csvField(value: unknown): string {
    const s = value == null ? "" : String(value);
    return `"${s.replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    const header = ["id", "name", "collection", "price", "stock", "status", "sold", "material"];
    const rows = products.map((p) =>
      [p.id, p.name, p.collection, p.price, p.stock, p.status, p.sold, p.material ?? ""]
        .map(csvField)
        .join(","),
    );
    const csv = [header.map(csvField).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pathos-products.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) return <Spinner />;

  const allSelected = products.length > 0 && selected.size === products.length;

  const collOptions = Array.from(new Set([...collections, form?.collection].filter(Boolean))) as string[];

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} piece${products.length === 1 ? "" : "s"} in the catalog.`}
        action={
          <div className="flex items-center gap-2">
            <Btn variant="ghost" onClick={exportCsv} disabled={products.length === 0}>
              <Icon.box size={15} /> Export CSV
            </Btn>
            <Btn variant="primary" onClick={() => setForm({ ...blankForm })}>
              <Icon.plus size={15} /> Add product
            </Btn>
          </div>
        }
      />

      {products.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-paper px-4 py-2.5">
          <label className="flex cursor-pointer select-none items-center gap-2 text-[12.5px] font-medium text-ink/80">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 cursor-pointer accent-gold"
            />
            {selected.size > 0 ? (
              <span>
                <span className="font-semibold text-ink">{selected.size}</span> selected
              </span>
            ) : (
              <span className="text-mute">Select all</span>
            )}
          </label>
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Btn variant="ghost" onClick={() => bulkSetStatus("Active")} disabled={busy} className="!px-3 !py-1.5">
                <Icon.check size={14} /> Activate
              </Btn>
              <Btn variant="ghost" onClick={() => bulkSetStatus("Draft")} disabled={busy} className="!px-3 !py-1.5">
                Set to draft
              </Btn>
              <Btn variant="danger" onClick={bulkDelete} disabled={busy} className="!px-3 !py-1.5">
                <Icon.trash size={14} /> Delete
              </Btn>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <Card
            key={p.id}
            className={`flex flex-col overflow-hidden ${selected.has(p.id) ? "ring-2 ring-gold" : ""}`}
          >
            <div className="relative flex h-40 items-center justify-center border-b border-ink/10 bg-sand/50">
              <label
                className="absolute left-2 top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-ink/15 bg-paper/90 shadow-sm backdrop-blur"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 cursor-pointer accent-gold"
                  aria-label={`Select ${p.name}`}
                />
              </label>
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                Art[p.art] || Art.drop
              )}
              {p.images.length > 1 && (
                <span className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-paper">
                  {p.images.length} photos
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">{p.collection}</div>
                  <div className="mt-0.5 font-serif text-[17px] font-semibold leading-tight text-ink">{p.name}</div>
                </div>
                <Chip tone={statusTone(p.status)}>{p.status}</Chip>
              </div>
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <span className="font-medium text-ink">{eur(p.price)}</span>
                <span className="text-mute">
                  {p.stock} in stock · {p.sold} sold
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-ink/[0.06] pt-3">
                <Btn variant="ghost" onClick={() => setForm(toForm(p))} className="!px-3 !py-1.5">
                  Edit
                </Btn>
                <IconBtn tone="danger" title="Delete" onClick={() => remove(p.id)}>
                  <Icon.trash size={16} />
                </IconBtn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {form && (
        <Modal title={form.id ? "Edit product" : "Add product"} onClose={() => setForm(null)} wide>
          {/* ── Photos ── */}
          <div className="mb-5">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">Photos</div>
            <div className="flex flex-wrap gap-3">
              {form.images.map((url, i) => (
                <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-ink/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-gold px-1.5 py-0.5 text-[9px] font-semibold text-white">Primary</span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    {i !== 0 && (
                      <button onClick={() => makePrimary(url)} title="Make primary" className="rounded bg-white/90 px-1.5 py-1 text-[10px] font-medium text-ink hover:bg-white">
                        ★
                      </button>
                    )}
                    <button onClick={() => removeImage(url)} title="Remove" className="rounded bg-white/90 px-1.5 py-1 text-[10px] font-medium text-red-600 hover:bg-white">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/25 text-mute hover:border-gold hover:text-gold disabled:opacity-50"
              >
                {uploading ? (
                  <span className="text-[11px]">Uploading…</span>
                ) : (
                  <>
                    <Icon.plus size={18} />
                    <span className="text-[10px]">Add photos</span>
                  </>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" multiple hidden onChange={onFiles} />
            </div>
            <p className="mt-2 text-[11px] text-mute">Upload one or more photos (PNG/JPG/WebP, ≤8MB). The first is the primary image; hover a photo to make it primary or remove it. No photos → the line-art is used.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Name">
                <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
            </div>
            <Field label="Art (line-art fallback)">
              <Select value={form.art} onChange={(e) => setForm({ ...form, art: e.target.value })}>
                {ART_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Collection">
              <Select value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })}>
                <option value="">Choose a collection…</option>
                {collOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Price (€)">
              <TextInput type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Stock">
              <TextInput type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </Select>
            </Field>
            <Field label="Sold">
              <TextInput type="number" value={form.sold} onChange={(e) => setForm({ ...form, sold: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Material">
                <TextInput value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Colours (optional — shown as dots on the product)">
                <div className="flex flex-wrap items-center gap-2">
                  {form.swatches.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper py-1 pl-1 pr-2.5">
                      <input
                        type="color"
                        value={/^#[0-9a-fA-F]{6}$/.test(c) ? c : "#b1894e"}
                        onChange={(e) => setForm({ ...form, swatches: form.swatches.map((x, j) => (j === i ? e.target.value : x)) })}
                        className="h-6 w-6 cursor-pointer rounded-full border border-ink/10 bg-transparent p-0"
                        title="Pick a colour"
                      />
                      <span className="font-mono text-[11px] text-mute">{c}</span>
                      <button onClick={() => setForm({ ...form, swatches: form.swatches.filter((_, j) => j !== i) })} className="text-[12px] text-mute hover:text-red-600" title="Remove colour">
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setForm({ ...form, swatches: [...form.swatches, "#b1894e"] })}
                    className="flex items-center gap-1 rounded-full border border-dashed border-ink/25 px-3 py-1.5 text-[12px] text-mute hover:border-gold hover:text-gold"
                  >
                    <Icon.plus size={13} /> Add colour
                  </button>
                </div>
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Description">
                <TextArea rows={3} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
              </Field>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <Btn variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={save} disabled={saving || !form.name.trim()}>
              {saving ? "Saving…" : form.id ? "Save changes" : "Create product"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
