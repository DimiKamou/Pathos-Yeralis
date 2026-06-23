// Admin icon set — keys match the `Icon.*` references in the prototype
// admin shell (prototypes/PATHOS Admin.html). lucide line style.
import type { ReactNode } from "react";

interface P {
  size?: number;
  w?: number;
  className?: string;
}

const S = (p: P & { children: ReactNode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={p.size || 20}
    height={p.size || 20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={p.w || 1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={p.className}
  >
    {p.children}
  </svg>
);

export const Icon = {
  grid: (p: P) => (
    <S {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </S>
  ),
  bag: (p: P) => (
    <S {...p}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </S>
  ),
  gem: (p: P) => (
    <S {...p}>
      <path d="M6 3h12l4 6-10 12L2 9Z" />
      <path d="M2 9h20M9 3 7 9l5 12 5-12-2-6" />
    </S>
  ),
  layers: (p: P) => (
    <S {...p}>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
    </S>
  ),
  box: (p: P) => (
    <S {...p}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </S>
  ),
  truck: (p: P) => (
    <S {...p}>
      <path d="M1 4h13v12H1z" />
      <path d="M14 8h4l3 3v5h-7" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </S>
  ),
  users: (p: P) => (
    <S {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1A4 4 0 0 1 16 11" />
    </S>
  ),
  inbox: (p: P) => (
    <S {...p}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1Z" />
    </S>
  ),
  tag: (p: P) => (
    <S {...p}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </S>
  ),
  chart: (p: P) => (
    <S {...p}>
      <path d="M3 3v18h18" />
      <path d="M7 15v3M12 9v9M17 5v13" />
    </S>
  ),
  menu: (p: P) => (
    <S {...p}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </S>
  ),
  mega: (p: P) => (
    <S {...p}>
      <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M15 8a4 4 0 0 1 0 8M11 6l9-3v18l-9-3" />
    </S>
  ),
  sun: (p: P) => (
    <S {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </S>
  ),
  mail: (p: P) => (
    <S {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7L22 7" />
    </S>
  ),
  send: (p: P) => (
    <S {...p}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </S>
  ),
  gear: (p: P) => (
    <S {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </S>
  ),
  search: (p: P) => (
    <S {...p}>
      <circle cx="11" cy="11" r="7.5" />
      <line x1="21" y1="21" x2="16.8" y2="16.8" />
    </S>
  ),
  bell: (p: P) => (
    <S {...p}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </S>
  ),
  moon: (p: P) => (
    <S {...p}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </S>
  ),
  chevR: (p: P) => (
    <S {...p}>
      <path d="m9 18 6-6-6-6" />
    </S>
  ),
  close: (p: P) => (
    <S {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </S>
  ),
  plus: (p: P) => (
    <S {...p}>
      <path d="M12 5v14M5 12h14" />
    </S>
  ),
  trash: (p: P) => (
    <S {...p}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </S>
  ),
  check: (p: P) => (
    <S {...p}>
      <path d="M20 6 9 17l-5-5" />
    </S>
  ),
  star: (p: P) => (
    <S {...p}>
      <path
        d="m12 2.5 2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 18.56l-5.88 3.1 1.12-6.55-4.76-4.64 6.58-.96L12 2.5Z"
        fill="currentColor"
        stroke="none"
      />
    </S>
  ),
};

export type IconKey = keyof typeof Icon;
