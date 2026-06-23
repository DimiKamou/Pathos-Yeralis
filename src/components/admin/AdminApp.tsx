"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/admin/icons";
import { SEASONS, effectiveSeason } from "@/lib/seasons";
import type { StoreSettings } from "@/lib/types";
import type { AdminMessage } from "@/lib/admin-data";

import type { ViewProps } from "@/components/admin/views/_shared";
import { Dashboard } from "@/components/admin/views/Dashboard";
import { Orders } from "@/components/admin/views/Orders";
import { Products } from "@/components/admin/views/Products";
import { Collections } from "@/components/admin/views/Collections";
import { Inventory } from "@/components/admin/views/Inventory";
import { Deliveries } from "@/components/admin/views/Deliveries";
import { Customers } from "@/components/admin/views/Customers";
import { AbandonedCarts } from "@/components/admin/views/AbandonedCarts";
import { Inbox } from "@/components/admin/views/Inbox";
import { Reviews } from "@/components/admin/views/Reviews";
import { Discounts } from "@/components/admin/views/Discounts";
import { Analytics } from "@/components/admin/views/Analytics";
import { MenuManager } from "@/components/admin/views/MenuManager";
import { Popups } from "@/components/admin/views/Popups";
import { Seasons } from "@/components/admin/views/Seasons";
import { Subscribers } from "@/components/admin/views/Subscribers";
import { Campaigns } from "@/components/admin/views/Campaigns";
import { Settings } from "@/components/admin/views/Settings";

interface NavEntry {
  id: string;
  label: string;
  icon: (typeof Icon)[keyof typeof Icon];
  badge?: number;
}

const NAV: NavEntry[] = [
  { id: "dashboard", label: "Dashboard", icon: Icon.grid },
  { id: "orders", label: "Orders", icon: Icon.bag },
  { id: "products", label: "Products", icon: Icon.gem },
  { id: "collections", label: "Collections", icon: Icon.layers },
  { id: "inventory", label: "Inventory", icon: Icon.box },
  { id: "deliveries", label: "Deliveries", icon: Icon.truck },
  { id: "customers", label: "Customers", icon: Icon.users },
  { id: "abandoned", label: "Abandoned carts", icon: Icon.bell },
  { id: "inbox", label: "Inbox", icon: Icon.inbox },
  { id: "reviews", label: "Reviews", icon: Icon.star },
  { id: "discounts", label: "Discounts", icon: Icon.tag },
  { id: "analytics", label: "Analytics", icon: Icon.chart },
];

const SITE_NAV: NavEntry[] = [
  { id: "menu", label: "Storefront Menu", icon: Icon.menu },
  { id: "popups", label: "Popups & Banners", icon: Icon.mega },
  { id: "seasons", label: "Seasonal Theme", icon: Icon.sun },
  { id: "subscribers", label: "Subscribers", icon: Icon.mail },
  { id: "campaigns", label: "Newsletter", icon: Icon.send },
];

const VIEWS: Record<string, (p: ViewProps) => React.ReactNode> = {
  dashboard: Dashboard,
  orders: Orders,
  products: Products,
  collections: Collections,
  inventory: Inventory,
  deliveries: Deliveries,
  customers: Customers,
  abandoned: AbandonedCarts,
  inbox: Inbox,
  reviews: Reviews,
  discounts: Discounts,
  analytics: Analytics,
  menu: MenuManager,
  popups: Popups,
  seasons: Seasons,
  subscribers: Subscribers,
  campaigns: Campaigns,
  settings: Settings,
};

function Brand() {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <svg width="26" height="21" viewBox="0 0 30 24" fill="none">
        <path d="M6 2 H24 L28 8 L15 22 L2 8 Z" stroke="#b1894e" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M2 8 H28 M11 2 L8 8 L15 22 M19 2 L22 8 L15 22" stroke="#b1894e" strokeWidth="0.9" />
      </svg>
      <div className="leading-none">
        <div className="font-serif text-[20px] font-semibold tracking-[0.18em] text-sideink">PATHOS</div>
        <div className="mt-0.5 text-[10px] font-light tracking-[0.2em] text-gold">ADMIN · BY YERALIS</div>
      </div>
    </div>
  );
}

function NavItem({ item, active, onClick }: { item: NavEntry; active: boolean; onClick: () => void }) {
  const A = item.icon;
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium tracking-wide transition-colors ${
        active ? "bg-gold/15 text-gold" : "text-sideink/70 hover:bg-white/5 hover:text-sideink"
      }`}
    >
      <A size={18} w={active ? 1.9 : 1.6} />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge ? (
        <span className="rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-white">{item.badge}</span>
      ) : null}
    </button>
  );
}

function Sidebar({
  view,
  go,
  open,
  setOpen,
  unread,
  adminName,
  onLogout,
}: {
  view: string;
  go: (v: string) => void;
  open: boolean;
  setOpen: (b: boolean) => void;
  unread: number;
  adminName: string;
  onLogout: () => void;
}) {
  const withBadge = (n: NavEntry): NavEntry => (n.id === "inbox" ? { ...n, badge: unread || undefined } : n);
  const initials =
    adminName
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "YK";
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Brand />
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          <div className="px-3.5 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sideink/35">
            Manage
          </div>
          {NAV.map((n) => (
            <NavItem
              key={n.id}
              item={withBadge(n)}
              active={view === n.id}
              onClick={() => {
                go(n.id);
                setOpen(false);
              }}
            />
          ))}
          <div className="px-3.5 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sideink/35">
            Storefront
          </div>
          {SITE_NAV.map((n) => (
            <NavItem
              key={n.id}
              item={n}
              active={view === n.id}
              onClick={() => {
                go(n.id);
                setOpen(false);
              }}
            />
          ))}
          <div className="px-3.5 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sideink/35">
            Store
          </div>
          <NavItem
            item={{ id: "settings", label: "Settings", icon: Icon.gear }}
            active={view === "settings"}
            onClick={() => {
              go("settings");
              setOpen(false);
            }}
          />
        </nav>
        <div className="border-t border-white/[0.08] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-[12px] font-semibold text-gold">
              {initials}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[12.5px] font-medium text-sideink">{adminName}</div>
              <div className="truncate text-[11px] text-sideink/45">Store owner</div>
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="rounded-lg p-1.5 text-sideink/40 transition-colors hover:bg-white/5 hover:text-sideink"
            >
              <Icon.gear size={16} />
            </button>
          </div>
          <button
            onClick={onLogout}
            className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-[11.5px] font-medium tracking-wide text-sideink/70 transition-colors hover:bg-white/5 hover:text-sideink"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({ setOpen, dark, onToggleTheme, adminName }: { setOpen: (b: boolean) => void; dark: boolean; onToggleTheme: () => void; adminName: string }) {
  const initials =
    adminName
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "YK";
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-ink/10 bg-paper/85 px-5 py-3.5 backdrop-blur lg:px-8">
      <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-ink/70 hover:bg-ink/5 lg:hidden">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <div className="hidden items-center gap-2 rounded-lg border border-ink/[0.12] bg-paper px-3 py-2 sm:flex sm:w-72">
        <Icon.search size={15} className="text-mute" />
        <input
          placeholder="Search orders, products, customers…"
          className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-mute focus:outline-none"
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={onToggleTheme}
          title="Toggle theme"
          className="rounded-lg border border-ink/15 p-2 text-ink/75 hover:bg-ink/[0.04]"
        >
          {dark ? <Icon.sun size={18} /> : <Icon.moon size={18} />}
        </button>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg border border-ink/15 px-3 py-2 text-[12px] font-medium text-ink/75 hover:bg-ink/[0.04] sm:flex"
        >
          View store <Icon.chevR size={13} />
        </a>
        <button className="relative rounded-lg p-2 text-ink/70 hover:bg-ink/5">
          <Icon.bell size={19} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-paper" />
        </button>
        <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-[11px] font-semibold text-gold">
          {initials}
        </div>
      </div>
    </header>
  );
}

export function AdminApp({ adminName, adminEmail }: { adminName: string; adminEmail: string }) {
  const [view, setView] = useState("dashboard");
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [unread, setUnread] = useState(0);

  const go = (v: string) => {
    setView(v);
    if (typeof window !== "undefined") window.location.hash = v;
  };

  const toggleTheme = () =>
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("pathos.theme", next ? "dark" : "light");
      } catch {
        /* ignore */
      }
      return next;
    });

  // initial view from hash + theme from localStorage (client only)
  useEffect(() => {
    setView((location.hash || "").replace("#", "") || "dashboard");
    try {
      setDark(localStorage.getItem("pathos.theme") === "dark");
    } catch {
      /* ignore */
    }
    const onHash = () => setView((location.hash || "").replace("#", "") || "dashboard");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // unread badge — fetch messages, refetch when a view reports a change
  const refreshUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messages");
      if (!res.ok) return;
      const data: { messages: AdminMessage[] } = await res.json();
      setUnread((data.messages || []).filter((m) => !m.read).length);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  // refresh the badge whenever we land on (or leave) the inbox
  useEffect(() => {
    if (view === "inbox") refreshUnread();
  }, [view, refreshUnread]);

  // seasonal accent — read settings, set --c-gold like the prototype
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) return;
        const data: { settings: StoreSettings } = await res.json();
        if (cancelled) return;
        const key = effectiveSeason(data.settings?.season);
        const seas = SEASONS[key];
        if (key && key !== "none" && seas) document.documentElement.style.setProperty("--c-gold", seas.rgb);
        else document.documentElement.style.removeProperty("--c-gold");
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [view]);

  async function logout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    window.location.href = "/admin/login";
  }

  const View = VIEWS[view] || Dashboard;
  return (
    <div className="flex min-h-screen text-ink">
      <Sidebar
        view={view}
        go={go}
        open={open}
        setOpen={setOpen}
        unread={unread}
        adminName={adminName}
        onLogout={logout}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar setOpen={setOpen} dark={dark} onToggleTheme={toggleTheme} adminName={adminName} />
        <main className="flex-1 px-5 py-7 lg:px-8 lg:py-9">
          <View go={go} onDataChange={refreshUnread} adminEmail={adminEmail} adminName={adminName} />
        </main>
      </div>
    </div>
  );
}
