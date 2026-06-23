// URL slugs for collection names, e.g. "Shells & Corals" → "shells-corals".
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Title-case a slug back into a readable label fallback.
export function unslug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
