"use client";

import { useEffect, useState } from "react";
import type { AnnouncementSetting, PopupSetting } from "@/lib/types";
import { Card, PageHeader, Spinner, Btn, Field, TextInput, TextArea, Select, Toggle, type ViewProps } from "./_shared";

export function Popups(_props: ViewProps) {
  const [ann, setAnn] = useState<AnnouncementSetting | null>(null);
  const [popup, setPopup] = useState<PopupSetting | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setAnn(d.settings?.announcement ?? { enabled: true, text: "" });
        setPopup(d.settings?.popup ?? null);
      });
  }, []);

  if (!ann || !popup) return <Spinner />;

  return (
    <div>
      <PageHeader title="Popups & Banners" subtitle="Control the announcement bar and the welcome popup shown on the storefront." />

      <div className="grid gap-4 lg:grid-cols-2">
        <SettingCard<AnnouncementSetting>
          title="Announcement bar"
          value={ann}
          settingKey="announcement"
          onSaved={setAnn}
          render={(v, set) => (
            <>
              <Toggle checked={v.enabled} onChange={(b) => set({ ...v, enabled: b })} label="Show the bar" />
              <Field label="Text"><TextInput value={v.text} onChange={(e) => set({ ...v, text: e.target.value })} /></Field>
              <div className="rounded-lg bg-[#2a241e] px-4 py-2.5 text-center text-[11px] font-medium tracking-[0.18em] text-[#f3ead9]">{v.text || "—"}</div>
            </>
          )}
        />

        <SettingCard<PopupSetting>
          title="Welcome popup"
          value={popup}
          settingKey="popup"
          onSaved={setPopup}
          render={(v, set) => (
            <>
              <Toggle checked={v.enabled} onChange={(b) => set({ ...v, enabled: b })} label="Show the popup" />
              <Field label="Heading"><TextInput value={v.heading} onChange={(e) => set({ ...v, heading: e.target.value })} /></Field>
              <Field label="Message"><TextArea rows={2} value={v.message} onChange={(e) => set({ ...v, message: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Code"><TextInput value={v.code} onChange={(e) => set({ ...v, code: e.target.value })} /></Field>
                <Field label="Button"><TextInput value={v.button} onChange={(e) => set({ ...v, button: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Delay (seconds)"><TextInput type="number" step="0.1" value={v.delay} onChange={(e) => set({ ...v, delay: Number(e.target.value) })} /></Field>
                <Field label="Frequency">
                  <Select value={v.frequency} onChange={(e) => set({ ...v, frequency: e.target.value as PopupSetting["frequency"] })}>
                    <option value="session">Once per session</option>
                    <option value="every">Every visit</option>
                  </Select>
                </Field>
              </div>
              <p className="text-[11.5px] text-mute">The code here is honored automatically at checkout (percentage read from the message).</p>
            </>
          )}
        />
      </div>
    </div>
  );
}

function SettingCard<T>({
  title,
  value,
  settingKey,
  onSaved,
  render,
}: {
  title: string;
  value: T;
  settingKey: "announcement" | "popup";
  onSaved: (v: T) => void;
  render: (v: T, set: (v: T) => void) => React.ReactNode;
}) {
  const [draft, setDraft] = useState<T>(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: settingKey, value: draft }),
    }).catch(() => {});
    onSaved(draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <Card className="p-5">
      <div className="mb-4 font-serif text-[18px] font-semibold text-ink">{title}</div>
      <div className="space-y-4">{render(draft, setDraft)}</div>
      <div className="mt-5 flex items-center justify-end gap-3">
        {saved && <span className="text-[12px] text-gold">Saved ✓</span>}
        <Btn variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Btn>
      </div>
    </Card>
  );
}
