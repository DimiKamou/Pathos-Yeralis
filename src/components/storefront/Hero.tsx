"use client";

// Hero banner — the prototype used an <image-slot> web component; here it's a
// simple photo-or-placeholder block driven by a prop.

export function Hero({ imageUrl }: { imageUrl?: string | null }) {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-8 pt-10">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-[440px] w-full rounded-[2px] object-cover" />
      ) : (
        <div className="flex h-[440px] w-full flex-col items-center justify-center rounded-[2px] border border-ink/10 bg-sand/60">
          <svg
            width="46"
            height="46"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-mute"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9" r="1.6" />
            <path d="M21 16l-5-5L5 20" />
          </svg>
          <span className="mt-3 text-[13px] text-mute">Drop an Aegean editorial banner image</span>
        </div>
      )}
    </section>
  );
}
