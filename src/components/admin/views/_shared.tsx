"use client";

// Shared admin view primitives — keeps every view visually consistent
// (cards, status chips, serif titles, gold accents) and DRY.
import type { ReactNode } from "react";
import { Icon } from "@/components/admin/icons";

export interface ViewProps {
  go: (v: string) => void;
  onDataChange?: () => void;
  adminEmail?: string;
  adminName?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[28px] font-semibold leading-none text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-[13px] text-mute">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-ink/10 bg-paper ${className}`}>{children}</div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <svg className="h-7 w-7 animate-spin text-gold" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" strokeOpacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-20 text-center">
      {icon && <div className="mb-4 text-gold/70">{icon}</div>}
      <div className="font-serif text-[20px] font-semibold text-ink">{title}</div>
      {body && <p className="mt-2 max-w-sm text-[13px] text-mute">{body}</p>}
    </Card>
  );
}

type Tone = "green" | "gold" | "grey" | "ink";

const TONES: Record<Tone, string> = {
  green: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  gold: "bg-gold/15 text-gold",
  grey: "bg-ink/8 text-mute",
  ink: "bg-ink/10 text-ink",
};

export function Chip({ children, tone = "grey" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function paymentTone(payment: string): Tone {
  if (payment === "Paid") return "green";
  if (payment === "Awaiting payment") return "gold";
  return "grey"; // Refunded
}

export function fulfillmentTone(fulfillment: string): Tone {
  if (fulfillment === "Shipped" || fulfillment === "Delivered") return "green";
  return "grey"; // Unfulfilled
}

export function statusTone(status: string): Tone {
  return status === "Active" ? "green" : "grey";
}

// Buttons --------------------------------------------------------------------
export function Btn({
  children,
  onClick,
  variant = "ghost",
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold tracking-wide transition-colors disabled:opacity-50";
  const styles: Record<string, string> = {
    primary: "bg-ink text-paper hover:opacity-90",
    ghost: "border border-ink/15 text-ink/80 hover:bg-ink/[0.04]",
    danger: "border border-red-500/25 text-red-600 hover:bg-red-500/10",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

// Tiny icon button for row actions.
export function IconBtn({
  children,
  onClick,
  title,
  tone = "ink",
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  tone?: "ink" | "danger";
}) {
  const t = tone === "danger" ? "text-mute hover:text-red-600 hover:bg-red-500/10" : "text-mute hover:text-ink hover:bg-ink/5";
  return (
    <button type="button" onClick={onClick} title={title} className={`rounded-lg p-1.5 transition-colors ${t}`}>
      {children}
    </button>
  );
}

// Form fields ----------------------------------------------------------------
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">{label}</span>
      {children}
    </label>
  );
}

const inputCx =
  "w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-[13px] text-ink placeholder:text-mute focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCx} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCx} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCx} ${props.className ?? ""}`} />;
}

// Toggle switch --------------------------------------------------------------
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-left"
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-gold" : "bg-ink/15"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-paper shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      {label && <span className="text-[13px] text-ink">{label}</span>}
    </button>
  );
}

// Modal ----------------------------------------------------------------------
export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm sm:p-8">
      <div
        className={`my-auto w-full ${wide ? "max-w-2xl" : "max-w-lg"} rounded-2xl border border-ink/10 bg-paper shadow-[0_24px_60px_-24px_rgba(80,60,30,0.4)]`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 className="font-serif text-[20px] font-semibold text-ink">{title}</h2>
          <IconBtn onClick={onClose} title="Close">
            <Icon.close size={18} />
          </IconBtn>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// Helpers --------------------------------------------------------------------
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 30) return `${d}d ago`;
  return fmtDate(iso);
}
