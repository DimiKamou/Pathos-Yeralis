"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center font-sans text-ink">
      <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">Something broke</div>
      <h1 className="mt-3 font-serif text-[34px] font-medium leading-tight text-ink">A small hiccup at the atelier</h1>
      <p className="mt-3 max-w-md text-[14px] font-light leading-relaxed text-mute">
        Please try again. If it keeps happening, refresh the page or come back shortly.
      </p>
      <button onClick={reset} className="mt-7 rounded-full bg-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-ink/90">
        Try again
      </button>
    </main>
  );
}
