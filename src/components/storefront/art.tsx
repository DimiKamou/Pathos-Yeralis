// Product line-art — ported verbatim from the `Art` map in the storefront
// prototype. Keyed by `art`; used as the fallback when a product has no photo.
import type { ReactElement } from "react";

const GOLD = "#a9824a";

export const Art: Record<string, ReactElement> = {
  bracelet: (
    <svg viewBox="0 0 160 130" className="h-32 w-auto" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round">
      <path d="M20 58 Q80 104 140 58" opacity="0.5" />
      {Array.from({ length: 11 }).map((_, i) => {
        const t = i / 10;
        const x = 20 + t * 120;
        const y = 58 + Math.sin(Math.PI * t) * 44;
        return <circle key={i} cx={x} cy={y} r={i === 0 || i === 10 ? 4.5 : 6} fill="#fffdf8" />;
      })}
    </svg>
  ),
  necklace: (
    <svg viewBox="0 0 160 130" className="h-32 w-auto" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M34 16 C32 58 66 76 80 94 C94 76 128 58 126 16" />
      <circle cx="80" cy="92" r="3" />
      <path d="M80 96 l11 9 -11 18 -11 -18 z" />
      <path d="M69 105 h22" opacity="0.55" />
    </svg>
  ),
  earrings: (
    <svg viewBox="0 0 160 130" className="h-32 w-auto" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {[56, 104].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="26" r="6" />
          <path d={`M${cx} 32 v8`} />
          <path d={`M${cx} 40 C${cx - 12} 60 ${cx - 12} 84 ${cx} 96 C${cx + 12} 84 ${cx + 12} 60 ${cx} 40 Z`} />
          <path d={`M${cx} 54 v30`} opacity="0.5" />
        </g>
      ))}
    </svg>
  ),
  ring: (
    <svg viewBox="0 0 160 130" className="h-32 w-auto" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="80" cy="86" rx="27" ry="29" />
      <path d="M80 30 l16 14 -16 18 -16 -18 z" />
      <path d="M64 44 h32 M80 30 v32" opacity="0.5" />
    </svg>
  ),
  shell: (
    <svg viewBox="0 0 160 130" className="h-32 w-auto" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round">
      <path d="M106 65 A23 23 0 1 1 59 65 A15.5 15.5 0 1 1 90 65 A9 9 0 1 1 72 65 A4.5 4.5 0 1 1 81 65" />
      <path d="M106 65 c10 4 16 12 18 22" opacity="0.55" />
    </svg>
  ),
  drop: (
    <svg viewBox="0 0 160 130" className="h-32 w-auto" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M38 16 C40 52 70 66 80 82 C90 66 120 52 122 16" />
      <circle cx="80" cy="80" r="3" />
      <path d="M80 84 C67 100 67 118 80 124 C93 118 93 100 80 84 Z" />
      <path d="M80 94 v24" opacity="0.5" />
    </svg>
  ),
};

export function artFor(key: string): ReactElement {
  return Art[key] || Art.drop;
}
