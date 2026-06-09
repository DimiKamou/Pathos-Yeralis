"use client";

// Announcement bar (admin-controlled) — ported from the prototype. Reads from
// props instead of localStorage; the season greeting wins over the plain text.
import type { AnnouncementSetting, SeasonSetting } from "@/lib/types";
import { SEASONS, effectiveSeason, seasonMotif } from "@/lib/seasons";

export function AnnouncementBar({
  announcement,
  season,
}: {
  announcement: AnnouncementSetting;
  season: SeasonSetting;
}) {
  const key = effectiveSeason(season);
  const seas = SEASONS[key] || SEASONS.none;
  const active = key !== "none";
  const text =
    active && season.useGreeting && seas.greeting
      ? seas.greeting
      : announcement.enabled
        ? announcement.text
        : "";
  if (!text) return null;
  const motif = active ? (
    <span className="opacity-80" dangerouslySetInnerHTML={{ __html: seasonMotif(seas.motif, 13, "currentColor") }} />
  ) : null;
  return (
    <div className="flex items-center justify-center gap-3 bg-[#2a241e] px-4 py-2.5 text-center text-[11px] font-medium leading-snug tracking-[0.18em] text-[#f3ead9]">
      {motif}
      <span>{text}</span>
      {motif}
    </div>
  );
}
