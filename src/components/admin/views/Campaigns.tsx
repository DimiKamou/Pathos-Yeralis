"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import type { AdminCampaign } from "@/lib/admin-data";
import { Card, Chip, PageHeader, Spinner, EmptyState, Btn, Field, TextInput, TextArea, Modal, fmtDate, type ViewProps } from "./_shared";

interface Piece {
  name: string;
  detail: string;
}

export function Campaigns(_props: ViewProps) {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [subCount, setSubCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [form, setForm] = useState({
    subject: "",
    name: "",
    eyebrow: "New Collection",
    tagline: "",
    arriving: "",
    storyTitle: "",
    storyBody: "",
    ctaLabel: "Be the first to shop",
  });
  const [pieces, setPieces] = useState<Piece[]>([
    { name: "", detail: "" },
    { name: "", detail: "" },
    { name: "", detail: "" },
  ]);

  const load = () => {
    Promise.all([
      fetch("/api/admin/campaigns").then((r) => r.json()),
      fetch("/api/admin/subscribers").then((r) => r.json()),
    ])
      .then(([c, s]) => {
        setCampaigns(c.campaigns || []);
        setSubCount((s.subscribers || []).length);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  async function send() {
    setSending(true);
    setResult(null);
    const body = {
      ...form,
      launch: form.arriving || undefined,
      pieces: pieces.filter((p) => p.name.trim()),
    };
    try {
      const res = await fetch("/api/admin/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.ok) {
        setResult(`Sent to ${data.sent} subscriber${data.sent === 1 ? "" : "s"}.`);
        setComposing(false);
        load();
      } else setResult(data.error || "Could not send");
    } catch {
      setResult("Could not send");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Newsletter"
        subtitle={`${subCount} subscriber${subCount === 1 ? "" : "s"} on the list.`}
        action={<Btn variant="primary" onClick={() => setComposing(true)}><Icon.send size={15} /> New campaign</Btn>}
      />

      {result && <div className="mb-4 rounded-lg bg-gold/12 px-4 py-2.5 text-[13px] text-ink">{result}</div>}

      {campaigns.length === 0 ? (
        <EmptyState icon={<Icon.send size={34} />} title="No campaigns sent yet" body="Compose a newsletter and send it to your subscribers using the on-brand template." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.12em] text-mute">
              <tr>
                <th className="px-5 py-3 font-semibold">Subject</th>
                <th className="px-5 py-3 font-semibold">Collection</th>
                <th className="px-5 py-3 font-semibold">Recipients</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Sent</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-ink/[0.06] last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3 font-medium text-ink">{c.subject}</td>
                  <td className="px-5 py-3 text-mute">{c.name || "—"}</td>
                  <td className="px-5 py-3 text-ink">{c.recipients}</td>
                  <td className="px-5 py-3"><Chip tone="green">{c.status}</Chip></td>
                  <td className="px-5 py-3 text-mute">{fmtDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {composing && (
        <Modal title="Compose campaign" onClose={() => setComposing(false)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email subject"><TextInput value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="A new collection is coming — Lithos" /></Field>
              <Field label="Collection name"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="LITHOS" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Eyebrow"><TextInput value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} /></Field>
              <Field label="Tagline"><TextInput value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Stone & Sea, shaped by hand" /></Field>
            </div>
            <Field label="Arriving"><TextInput value={form.arriving} onChange={(e) => setForm({ ...form, arriving: e.target.value })} placeholder="Arriving Friday · 19 June" /></Field>
            <Field label="Story title"><TextInput value={form.storyTitle} onChange={(e) => setForm({ ...form, storyTitle: e.target.value })} placeholder="A collection drawn from the shoreline" /></Field>
            <Field label="Story body"><TextArea rows={3} value={form.storyBody} onChange={(e) => setForm({ ...form, storyBody: e.target.value })} /></Field>
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">First look (up to 3)</div>
              <div className="space-y-2">
                {pieces.map((p, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <TextInput value={p.name} onChange={(e) => setPieces(pieces.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder={`Piece ${i + 1} name`} />
                    <TextInput value={p.detail} onChange={(e) => setPieces(pieces.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)))} placeholder="Hematite · Silver 925" />
                  </div>
                ))}
              </div>
            </div>
            <Field label="Button label"><TextInput value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} /></Field>
            <p className="text-[11.5px] text-mute">Uses the newsletter template; sends via the configured email provider (console-logs in dev).</p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Btn onClick={() => setComposing(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={send} disabled={sending || !form.subject.trim() || !form.name.trim()}>
                {sending ? "Sending…" : `Send to ${subCount} subscriber${subCount === 1 ? "" : "s"}`}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
