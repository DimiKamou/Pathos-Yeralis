// Photo-aware media. Falls back to the inline line-art (keyed by `art`) when a
// product has no uploaded `imageUrl` — the alpha behavior the prompt calls for.
import { Art } from "./art";

// Small framed thumbnail (search row, cart/wishlist lines, related strip).
// Ported from the prototype's ArtBox, extended to show a photo when present.
export function ArtBox({
  art,
  imageUrl,
  box = "h-14 w-14",
  scale = "scale-[0.42]",
  alt = "",
}: {
  art: string;
  imageUrl?: string | null;
  box?: string;
  scale?: string;
  alt?: string;
}) {
  return (
    <div className={`grid ${box} shrink-0 place-items-center overflow-hidden rounded-lg bg-sand/50`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className={scale}>{Art[art] || Art.drop}</div>
      )}
    </div>
  );
}

// Large media for the product card / PDP art panel. `wrapClass` lets callers
// add hover transforms (e.g. group-hover:scale-105) to the line-art wrapper.
export function ProductMedia({
  art,
  imageUrl,
  alt = "",
  wrapClass = "",
  imgClass = "h-full w-full object-cover",
}: {
  art: string;
  imageUrl?: string | null;
  alt?: string;
  wrapClass?: string;
  imgClass?: string;
}) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={alt} className={imgClass} />;
  }
  return <span className={wrapClass}>{Art[art] || Art.drop}</span>;
}
