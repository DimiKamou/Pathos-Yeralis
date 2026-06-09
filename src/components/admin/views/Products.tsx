"use client";

import { useEffect, useState } from "react";
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
  swatches: string;
  desc: string;
  imageUrl: string;
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
  swatches: "",
  desc: "",
  imageUrl: "",
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
    swatches: (p.swatches || []).join(", "),
    desc: p.desc ?? "",
    imageUrl: p.imageUrl ?? "",
  };
}

export function Products(_props: ViewProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/products");
    const d = await r.json();
    setProducts(d.products || []);
  }

  useEffect(() => {
    let alive = true;
    load().finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

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
      swatches: form.swatches
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      desc: form.desc,
      imageUrl: form.imageUrl,
    };
    try {
      if (form.id) {
        await fetch(`/api/admin/products/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      await load();
      setForm(null);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} piece${products.length === 1 ? "" : "s"} in the catalog.`}
        action={
          <Btn variant="primary" onClick={() => setForm({ ...blankForm })}>
            <Icon.plus size={15} /> Add product
          </Btn>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id} className="flex flex-col overflow-hidden">
            <div className="flex h-40 items-center justify-center border-b border-ink/10 bg-sand/50">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                Art[p.art] || Art.drop
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Name">
                <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
            </div>
            <Field label="Art">
              <Select value={form.art} onChange={(e) => setForm({ ...form, art: e.target.value })}>
                {ART_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Collection">
              <TextInput value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })} />
            </Field>
            <Field label="Price (€)">
              <TextInput
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="Stock">
              <TextInput
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
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
              <Field label="Swatches (comma-separated hex)">
                <TextInput
                  value={form.swatches}
                  placeholder="#141414, #a9824a, #cdb78f"
                  onChange={(e) => setForm({ ...form, swatches: e.target.value })}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Image URL (optional)">
                <TextInput value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
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
