import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PATHOS by Yeralis",
    short_name: "PATHOS",
    description:
      "Handmade jewelry from the Aegean — gemstones, shells and minerals shaped into pieces made to last a lifetime.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f0e6",
    theme_color: "#2a241e",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
    ],
  };
}
