"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import type { AdminReview } from "@/lib/admin-data";
import { Card, Chip, PageHeader, Spinner, EmptyState, Btn, IconBtn, fmtDate, type ViewProps } from "./_shared";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[13px] tracking-tight text-gold" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-ink/20">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function Reviews(_props: ViewProps) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  async function setApproved(r: AdminReview, approved: boolean) {
    setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, approved } : x)));
    await fetch(`/api/admin/reviews/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    }).catch(() => {});
  }
  async function remove(id: string) {
    setReviews((prev) => prev.filter((x) => x.id !== id));
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" }).catch(() => {});
  }

  if (loading) return <Spinner />;
  const pending = reviews.filter((r) => !r.approved).length;

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle={`${reviews.length} review${reviews.length === 1 ? "" : "s"} · ${pending} pending approval.`}
      />
      {reviews.length === 0 ? (
        <EmptyState
          icon={<Icon.star size={34} />}
          title="No reviews yet"
          body="Reviews submitted from product pages appear here for approval before going live."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className={`px-5 py-4 ${!r.approved ? "ring-1 ring-gold/30" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-[13.5px] font-semibold text-ink">{r.name}</span>
                    <span className="text-[11.5px] text-mute">on {r.productName}</span>
                    <Chip tone={r.approved ? "green" : "gold"}>{r.approved ? "Approved" : "Pending"}</Chip>
                    <span className="ml-auto text-[11.5px] text-mute">{fmtDate(r.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-mute">{r.body}</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    {r.approved ? (
                      <Btn onClick={() => setApproved(r, false)}>Unapprove</Btn>
                    ) : (
                      <Btn variant="primary" onClick={() => setApproved(r, true)}>
                        <Icon.check size={15} /> Approve
                      </Btn>
                    )}
                    <IconBtn tone="danger" title="Delete" onClick={() => remove(r.id)}>
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
