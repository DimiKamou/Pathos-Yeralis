// Minimal 1.4px line-icons drawn to suit the lapidary, hairline aesthetic.
// (The original ships a larger set; v2 only needs these.)
import type { SVGProps } from "react";

const base = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const CloseIcon = ({ size = 20 }: { size?: number }) => (
  <svg {...base(size)}><path d="M5 5l14 14M19 5L5 19" /></svg>
);
export const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);
export const BagIcon = ({ size = 20 }: { size?: number }) => (
  <svg {...base(size)}><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
);
export const TruckIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...base(size)}><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" /><circle cx="7" cy="17" r="1.6" /><circle cx="17" cy="17" r="1.6" /></svg>
);
export const ArrowIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...base(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const HeartIcon = ({ size = 18, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.6-9.2-9C1.3 7.7 3 4.5 6.3 4.5c2 0 3.2 1.2 3.7 2.2.5-1 1.7-2.2 3.7-2.2 3.3 0 5 3.2 3.5 6.5C19 15.4 12 20 12 20Z" />
  </svg>
);
