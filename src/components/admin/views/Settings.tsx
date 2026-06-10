"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import type { ContactSetting } from "@/lib/types";
import { Card, PageHeader, Btn, Field, TextInput, Spinner, type ViewProps } from "./_shared";

export function Settings({ adminName, adminEmail, go }: ViewProps) {
  const [contact, setContact] = useState<ContactSetting | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setContact(d.settings?.contact ?? null));
  }, []);

  async function saveContact() {
    if (!contact) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "contact", value: contact }),
    }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/admin/login";
  }

  const set = (patch: Partial<ContactSetting>) => contact && setContact({ ...contact, ...patch });

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Store contact details, map location and account."
        action={saving ? <span className="text-[12px] text-mute">Saving…</span> : saved ? <span className="text-[12px] text-gold">Saved ✓</span> : undefined}
      />

      {/* ── Store details (contact + map) ── */}
      {!contact ? (
        <Spinner />
      ) : (
        <Card className="mb-4 p-6">
          <div className="mb-4 font-serif text-[18px] font-semibold text-ink">Store details</div>
          <p className="mb-5 max-w-2xl text-[12.5px] text-mute">
            These appear in the storefront’s “Visit the Atelier” section, footer and chat widget.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email"><TextInput value={contact.email} onChange={(e) => set({ email: e.target.value })} /></Field>
            <Field label="Phone"><TextInput value={contact.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
            <Field label="Address line 1"><TextInput value={contact.addressLine1} onChange={(e) => set({ addressLine1: e.target.value })} /></Field>
            <Field label="Address line 2"><TextInput value={contact.addressLine2} onChange={(e) => set({ addressLine2: e.target.value })} /></Field>
            <Field label="Opening hours line 1"><TextInput value={contact.hoursLine1} onChange={(e) => set({ hoursLine1: e.target.value })} /></Field>
            <Field label="Opening hours line 2"><TextInput value={contact.hoursLine2} onChange={(e) => set({ hoursLine2: e.target.value })} /></Field>
            <Field label="Instagram URL"><TextInput value={contact.instagram} onChange={(e) => set({ instagram: e.target.value })} /></Field>
            <Field label="Map pin label"><TextInput value={contact.mapLabel} onChange={(e) => set({ mapLabel: e.target.value })} /></Field>
            <Field label="Map latitude">
              <TextInput type="number" step="any" value={contact.mapLat} onChange={(e) => set({ mapLat: Number(e.target.value) })} />
            </Field>
            <Field label="Map longitude">
              <TextInput type="number" step="any" value={contact.mapLng} onChange={(e) => set({ mapLng: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <a
              href={`https://www.openstreetmap.org/?mlat=${contact.mapLat}&mlon=${contact.mapLng}#map=17/${contact.mapLat}/${contact.mapLng}`}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] font-medium uppercase tracking-[0.12em] text-gold hover:text-ink"
            >
              Preview map →
            </a>
            <span className="text-[11.5px] text-mute">
              Tip: get latitude/longitude by right-clicking your shop on Google Maps and copying the two numbers.
            </span>
          </div>
          <div className="mt-5 flex justify-end">
            <Btn variant="primary" onClick={saveContact} disabled={saving}>
              {saving ? "Saving…" : "Save store details"}
            </Btn>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 font-serif text-[18px] font-semibold text-ink">Account</div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-[13px] font-semibold text-gold">
              {(adminName || "YK").split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[14px] font-medium text-ink">{adminName || "Store owner"}</div>
              <div className="text-[12.5px] text-mute">{adminEmail}</div>
            </div>
          </div>
          <div className="mt-5">
            <Btn variant="danger" onClick={logout}>Log out</Btn>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 font-serif text-[18px] font-semibold text-ink">Storefront controls</div>
          <div className="space-y-2 text-[13px]">
            <ControlLink icon={<Icon.sun size={16} />} label="Seasonal theme" onClick={() => go("seasons")} />
            <ControlLink icon={<Icon.mega size={16} />} label="Popups & banners" onClick={() => go("popups")} />
            <ControlLink icon={<Icon.menu size={16} />} label="Storefront menu" onClick={() => go("menu")} />
            <ControlLink icon={<Icon.layers size={16} />} label="Collections" onClick={() => go("collections")} />
            <ControlLink icon={<Icon.tag size={16} />} label="Discount codes" onClick={() => go("discounts")} />
          </div>
          <div className="mt-5 rounded-lg bg-sand/40 p-3 text-[12px] text-mute">
            Bank-transfer details and Stripe keys are configured via environment variables (see <span className="font-mono">.env.example</span>).
          </div>
        </Card>
      </div>
    </div>
  );
}

function ControlLink({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border border-ink/10 px-4 py-2.5 text-left text-ink transition-colors hover:border-gold hover:bg-gold/[0.04]">
      <span className="text-gold">{icon}</span>
      <span className="flex-1">{label}</span>
      <Icon.chevR size={14} className="text-mute" />
    </button>
  );
}
