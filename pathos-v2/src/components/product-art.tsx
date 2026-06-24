// Framed line-art thumbnail (search rows, cart/wishlist lines, related strip).
// v2 has no uploaded photos, so this always renders the line-art — tinted via
// the wrapper's text colour.
import { Art } from "./art";

export function ArtBox({
  art,
  box = "h-14 w-14",
  scale = "scale-[0.42]",
  tint = "text-slate",
}: {
  art: string;
  box?: string;
  scale?: string;
  tint?: string;
}) {
  return (
    <div className={`grid ${box} shrink-0 place-items-center overflow-hidden bg-stone/60 ${tint}`}>
      <div className={scale}>{Art[art] || Art.drop}</div>
    </div>
  );
}
