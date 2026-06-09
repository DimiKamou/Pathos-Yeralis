"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import type { AdminSubscriber } from "@/lib/admin-data";
import { Card, Chip, PageHeader, Spinner, EmptyState, Btn, IconBtn, fmtDate, type ViewProps } from "./_shared";

const sourceTone = (s: string): "green" | "gold" | "grey" =>
  s === "Checkout" ? "green" : s === "Welcome popup" ? "gold" : "grey";

export function Subscribers(_props: ViewProps) {
  const [subs, setSubs] = useState<AdminSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/subscribers")
      .then((r) => r.json())
      .then((d) => setSubs(d.subscribers || []))
      .finally(() => setLoading(false));
  }, []);

  async function remove(id: string) {
    setSubs((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" }).catch(() => {});
  }
  function copyAll() {
    try {
      navigator.clipboard.writeText(subs.map((s) => s.email).join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Subscribers"
        subtitle={`${subs.length} on the list.`}
        action={subs.length > 0 ? <Btn onClick={copyAll}><Icon.mail size={15} /> {copied ? "Copied" : "Copy all emails"}</Btn> : undefined}
      />
      {subs.length === 0 ? (
        <EmptyState icon={<Icon.mail size={34} />} title="No subscribers yet" body="Footer, welcome popup, checkout and back-in-stock signups appear here." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.12em] text-mute">
              <tr>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Source</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-ink/[0.06] last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-5 py-3 text-ink">{s.email}</td>
                  <td className="px-5 py-3"><Chip tone={sourceTone(s.source)}>{s.source}</Chip></td>
                  <td className="px-5 py-3 text-mute">{fmtDate(s.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <IconBtn tone="danger" title="Remove" onClick={() => remove(s.id)}><Icon.trash size={15} /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
