"use client";

import { useEffect, useState } from "react";
import { SEASONS, SEASON_WINDOWS, effectiveSeason, seasonForDate, seasonMotif } from "@/lib/seasons";
import type { SeasonSetting } from "@/lib/types";
import { Card, PageHeader, Spinner, Btn, Toggle, type ViewProps } from "./_shared";

export function Seasons(_props: ViewProps) {
  const [season, setSeason] = useState<SeasonSetting | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSeason(d.settings?.season ?? { key: "none", useGreeting: false, auto: false }));
  }, []);

  async function save(next: SeasonSetting) {
    setSeason(next);
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "season", value: next }),
    }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!season) return <Spinner />;
  const effective = effectiveSeason(season);

  return (
    <div>
      <PageHeader
        title="Seasonal Theme"
        subtitle="Swaps the storefront's gold accent and (optionally) the announcement greeting."
        action={saving ? <span className="text-[12px] text-mute">Saving…</span> : saved ? <span className="text-[12px] text-gold">Saved ✓</span> : undefined}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(SEASONS).map(([key, s]) => {
          const active = (season.auto ? effective : season.key) === key;
          return (
            <button
              key={key}
              onClick={() => save({ ...season, key, auto: false })}
              className={`flex flex-col items-center gap-2 rounded-xl border p-5 text-center transition-colors ${active ? "border-gold bg-gold/[0.06]" : "border-ink/10 bg-paper hover:border-ink/30"}`}
            >
              <span className="text-gold" dangerouslySetInnerHTML={{ __html: seasonMotif(s.motif, 22, s.hex) }} />
              <span className="text-[13.5px] font-semibold text-ink">{s.label}</span>
              <span className="text-[11px] text-mute">{s.occasion}</span>
              <span className="mt-1 h-4 w-4 rounded-full ring-1 ring-ink/15" style={{ background: s.hex }} />
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <Toggle checked={season.auto} onChange={(v) => save({ ...season, auto: v })} label="Switch automatically by date" />
          {season.auto && (
            <div className="mt-4 space-y-1.5 text-[12.5px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">Schedule</div>
              {SEASON_WINDOWS.map((w) => (
                <div key={w.key} className="flex justify-between">
                  <span className="text-ink">{SEASONS[w.key].label}</span>
                  <span className="text-mute">{w.when}</span>
                </div>
              ))}
              <div className="mt-2 border-t border-ink/10 pt-2 text-mute">
                Today ({seasonForDate()}): <span className="font-semibold text-gold">{SEASONS[effective].label}</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <Toggle checked={season.useGreeting} onChange={(v) => save({ ...season, useGreeting: v })} label="Use the seasonal greeting in the announcement bar" />
          <div className="mt-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">Preview</div>
            <div className="mt-2 rounded-lg bg-[#2a241e] px-4 py-2.5 text-center text-[11px] font-medium tracking-[0.18em] text-[#f3ead9]">
              {SEASONS[effective].greeting || "— no greeting for this season —"}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
