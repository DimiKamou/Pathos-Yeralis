import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center font-sans text-ink">
      <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">404</div>
      <h1 className="mt-3 font-serif text-[40px] font-medium leading-tight text-ink">This page wandered off</h1>
      <p className="mt-3 max-w-md text-[14px] font-light leading-relaxed text-mute">
        The piece or page you’re looking for isn’t here. Let’s get you back to the shop.
      </p>
      <div className="mt-7 flex gap-3">
        <Link href="/" className="rounded-full bg-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-ink/90">Home</Link>
        <Link href="/shop" className="rounded-full border border-ink/20 px-6 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-ink/80 hover:border-ink hover:text-ink">Shop all</Link>
      </div>
    </main>
  );
}
