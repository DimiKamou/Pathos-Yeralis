// Seasonal themes — ported verbatim from prototypes/pathos-store.js.
// One accent + a small motif per season, plus auto-by-date switching.
import type { SeasonSetting } from "./types";

export interface Season {
  label: string;
  occasion: string;
  hex: string;
  rgb: string;
  motif: string;
  greeting: string;
}

export const SEASONS: Record<string, Season> = {
  none: { label: "Year-round", occasion: "Signature gold", hex: "#b1894e", rgb: "177 137 78", motif: "diamond", greeting: "" },
  christmas: { label: "Christmas", occasion: "Festive evergreen", hex: "#2e6249", rgb: "46 98 73", motif: "star", greeting: "Season’s greetings — free gift wrapping on every order" },
  easter: { label: "Easter", occasion: "Soft spring lilac", hex: "#8a6f9e", rgb: "138 111 158", motif: "egg", greeting: "Happy Easter — new spring pieces have landed" },
  halloween: { label: "Halloween", occasion: "Autumn amber", hex: "#b5652f", rgb: "181 101 47", motif: "moon", greeting: "Autumn at the atelier — handmade in warm tones" },
  summer: { label: "Summer", occasion: "Aegean blue", hex: "#2f86a3", rgb: "47 134 163", motif: "sun", greeting: "Summer by the Aegean — free EU shipping over 100€" },
};

export const MOTIF: Record<string, string> = {
  diamond: '<path d="M12 3 19 12 12 21 5 12Z"/>',
  star: '<path d="M12 2.5 13.7 9.4 20.5 11 13.7 12.6 12 21.5 10.3 12.6 3.5 11 10.3 9.4Z"/>',
  egg: '<path d="M12 3c3.6 2.6 5 8 5 10.4a5 5 0 0 1-10 0C7 11 8.4 5.6 12 3Z"/>',
  moon: '<path d="M17 3.5a7.2 7.2 0 1 0 3.4 11.8A8 8 0 0 1 17 3.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7"/>',
};

export function seasonMotif(key: string, size = 14, color = "currentColor"): string {
  return (
    '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color +
    '" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + (MOTIF[key] || MOTIF.diamond) + "</svg>"
  );
}

// Date windows for auto-switching (month*100 + day, inclusive). First match wins.
export const SEASON_WINDOWS = [
  { key: "christmas", from: 1201, to: 1231, when: "1 – 31 December" },
  { key: "halloween", from: 1008, to: 1101, when: "8 Oct – 1 Nov" },
  { key: "easter", from: 325, to: 415, when: "25 Mar – 15 Apr" },
  { key: "summer", from: 601, to: 831, when: "1 Jun – 31 Aug" },
];

export function seasonForDate(d: Date = new Date()): string {
  const md = (d.getMonth() + 1) * 100 + d.getDate();
  for (const w of SEASON_WINDOWS) {
    if (md >= w.from && md <= w.to) return w.key;
  }
  return "none";
}

// Resolve the season actually in effect (honors the auto-by-date toggle).
export function effectiveSeason(s?: SeasonSetting | null): string {
  return s && s.auto ? seasonForDate() : (s && s.key) || "none";
}
