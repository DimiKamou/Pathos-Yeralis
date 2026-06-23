"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import type { AdminMessage } from "@/lib/admin-data";
import { Card, Chip, PageHeader, Spinner, EmptyState, Btn, IconBtn, timeAgo, type ViewProps } from "./_shared";

export function Inbox({ onDataChange }: ViewProps) {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  async function toggleRead(m: AdminMessage) {
    const read = !m.read;
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read } : x)));
    await fetch(`/api/admin/messages/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    }).catch(() => {});
    onDataChange?.();
  }
  async function markAllRead() {
    setMessages((prev) => prev.map((x) => ({ ...x, read: true })));
    await fetch("/api/admin/messages", { method: "PATCH" }).catch(() => {});
    onDataChange?.();
  }
  async function remove(id: string) {
    setMessages((prev) => prev.filter((x) => x.id !== id));
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" }).catch(() => {});
    onDataChange?.();
  }

  if (loading) return <Spinner />;
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <PageHeader
        title="Inbox"
        subtitle={`${messages.length} message${messages.length === 1 ? "" : "s"} · ${unread} unread.`}
        action={unread > 0 ? <Btn onClick={markAllRead}><Icon.check size={15} /> Mark all read</Btn> : undefined}
      />
      {messages.length === 0 ? (
        <EmptyState icon={<Icon.inbox size={34} />} title="No messages yet" body="Questions from the storefront chat widget land here." />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id} className={`px-5 py-4 ${!m.read ? "ring-1 ring-gold/30" : ""}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleRead(m)} title={m.read ? "Mark unread" : "Mark read"} className="mt-1.5 shrink-0">
                  <span className={`block h-2.5 w-2.5 rounded-full ${!m.read ? "bg-gold" : "bg-ink/15"}`} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[13.5px] ${!m.read ? "font-semibold text-ink" : "font-medium text-ink/80"}`}>
                      {m.name || "Anonymous"}
                    </span>
                    <Chip tone="gold">{m.topic}</Chip>
                    <span className="text-[11.5px] text-mute">{m.email}</span>
                    <span className="ml-auto text-[11.5px] text-mute">{timeAgo(m.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-mute">{m.message}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <a href={`mailto:${m.email}`} className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-gold hover:text-ink">
                      Reply by email →
                    </a>
                    <IconBtn tone="danger" title="Delete" onClick={() => remove(m.id)}>
                      <Icon.trash size={15} />
                    </IconBtn>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
