"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (res.ok && data.ok) {
        const from = new URLSearchParams(location.search).get("from") || "/admin";
        window.location.href = from;
        return;
      }
      setError("Wrong email or password");
    } catch {
      setError("Wrong email or password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12 text-ink">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <svg width="44" height="35" viewBox="0 0 30 24" fill="none">
            <path d="M6 2 H24 L28 8 L15 22 L2 8 Z" stroke="rgb(177 137 78)" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M2 8 H28 M11 2 L8 8 L15 22 M19 2 L22 8 L15 22" stroke="rgb(177 137 78)" strokeWidth="0.9" />
          </svg>
          <div className="mt-3 font-serif text-[28px] font-semibold tracking-[0.18em] text-ink">PATHOS</div>
          <div className="mt-1 text-[10px] font-light tracking-[0.22em] text-gold">ADMIN · BY YERALIS</div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-ink/10 bg-paper p-7 shadow-[0_24px_60px_-30px_rgba(80,60,30,0.45)]"
        >
          <h1 className="font-serif text-[22px] font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-[12.5px] text-mute">Sign in to manage the storefront.</p>

          <label className="mt-6 block text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Email</label>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 w-full rounded-lg border border-ink/15 bg-paper px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-mute focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
            placeholder="you@example.com"
          />

          <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5 w-full rounded-lg border border-ink/15 bg-paper px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-mute focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
            placeholder="••••••••"
          />

          {error && <p className="mt-4 text-[12.5px] font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-full bg-ink px-5 py-3 text-[13px] font-semibold tracking-wide text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-mute">
            Seeded admin — see .env (ADMIN_EMAIL / ADMIN_PASSWORD).
          </p>
        </form>
      </div>
    </main>
  );
}
