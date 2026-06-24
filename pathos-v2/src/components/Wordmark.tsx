// The PATHOS wordmark — a small garnet lozenge + the name set in the Greek
// display face. Left-aligned and lapidary, a deliberate break from the
// original's centred wordmark.
export function Wordmark({ tone = "slate" }: { tone?: "slate" | "marble" }) {
  const name = tone === "marble" ? "text-marble" : "text-slate";
  const sub = tone === "marble" ? "text-stone" : "text-ash";
  return (
    <a href="#top" className="group flex items-center gap-3" aria-label="PATHOS by Yeralis — home">
      <span className="block h-2.5 w-2.5 rotate-45 bg-garnet transition-transform duration-500 group-hover:rotate-[135deg]" />
      <span className="leading-none">
        <span className={`block font-display text-[22px] font-700 tracking-[0.3em] ${name}`}>ΠΑΘΟΣ</span>
        <span className={`mt-0.5 block font-ui text-[9px] uppercase tracking-[0.34em] ${sub}`}>by Yeralis</span>
      </span>
    </a>
  );
}
