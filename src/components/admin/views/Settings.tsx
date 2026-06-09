"use client";

import { Icon } from "@/components/admin/icons";
import { Card, PageHeader, Btn, type ViewProps } from "./_shared";

export function Settings({ adminName, adminEmail, go }: ViewProps) {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/admin/login";
  }
  return (
    <div>
      <PageHeader title="Settings" subtitle="Store profile and storefront controls." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 font-serif text-[18px] font-semibold text-ink">Account</div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-[13px] font-semibold text-gold">
              {(adminName || "YK").split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[14px] font-medium text-ink">{adminName || "Store owner"}</div>
              <div className="text-[12.5px] text-mute">{adminEmail}</div>
            </div>
          </div>
          <div className="mt-5">
            <Btn variant="danger" onClick={logout}>Log out</Btn>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 font-serif text-[18px] font-semibold text-ink">Storefront controls</div>
          <div className="space-y-2 text-[13px]">
            <ControlLink icon={<Icon.sun size={16} />} label="Seasonal theme" onClick={() => go("seasons")} />
            <ControlLink icon={<Icon.mega size={16} />} label="Popups & banners" onClick={() => go("popups")} />
            <ControlLink icon={<Icon.menu size={16} />} label="Storefront menu" onClick={() => go("menu")} />
            <ControlLink icon={<Icon.tag size={16} />} label="Discount codes" onClick={() => go("discounts")} />
          </div>
          <div className="mt-5 rounded-lg bg-sand/40 p-3 text-[12px] text-mute">
            Bank-transfer details and Stripe keys are configured via environment variables (see <span className="font-mono">.env.example</span>).
          </div>
        </Card>
      </div>
    </div>
  );
}

function ControlLink({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border border-ink/10 px-4 py-2.5 text-left text-ink transition-colors hover:border-gold hover:bg-gold/[0.04]">
      <span className="text-gold">{icon}</span>
      <span className="flex-1">{label}</span>
      <Icon.chevR size={14} className="text-mute" />
    </button>
  );
}
