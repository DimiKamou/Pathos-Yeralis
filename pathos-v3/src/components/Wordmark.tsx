// Minimalist wordmark: the Latin name set light and widely tracked, with a tiny
// signature beneath. Echoes the original's centred wordmark, stripped of the
// diamond mark.
export function Wordmark({ tone = "slate" }: { tone?: "slate" | "marble" }) {
  const name = tone === "marble" ? "text-marble" : "text-slate";
  const sub = tone === "marble" ? "text-stone" : "text-ash";
  return (
    <a href="#top" className="block text-center leading-none" aria-label="PATHOS by Yeralis — home">
      <span className={`block font-display text-[23px] font-400 tracking-[0.52em] ${name}`} style={{ textIndent: "0.52em" }}>PATHOS</span>
      <span className={`mt-1 block font-ui text-[8.5px] uppercase tracking-[0.42em] ${sub}`} style={{ textIndent: "0.42em" }}>by Yeralis</span>
    </a>
  );
}
