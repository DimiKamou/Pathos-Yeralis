import type { Config } from "tailwindcss";

/**
 * Ported 1:1 from the prototype `tailwind.config` blocks in
 * `prototypes/PATHOS by Yeralis.html` and `prototypes/PATHOS Admin.html`.
 * Colors resolve through CSS custom properties (see globals.css) so the
 * single antique-gold accent can be swapped per active season and the
 * whole palette flips for dark mode.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jost)", "Jost", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", '"Cormorant Garamond"', "Georgia", "serif"],
      },
      colors: {
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        mute: "rgb(var(--c-mute) / <alpha-value>)",
        steel: "rgb(var(--c-steel) / <alpha-value>)",
        gold: "rgb(var(--c-gold) / <alpha-value>)",
        sand: "rgb(var(--c-sand) / <alpha-value>)",
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        // admin sidebar tokens
        sidebar: "rgb(var(--c-side) / <alpha-value>)",
        sideink: "rgb(var(--c-side-ink) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};

export default config;
