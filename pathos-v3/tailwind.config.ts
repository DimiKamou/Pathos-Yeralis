import type { Config } from "tailwindcss";

/**
 * PATHOS v2 — "jewelry as feeling".
 * A cool marble-and-garnet system, deliberately unlike the original's warm
 * cream/serif/gold. Colours resolve through CSS custom properties (globals.css)
 * so dark sections can re-map a couple of tokens locally.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      // Numeric weight aliases (merged with the defaults) so type weights can be
      // written as font-300 … font-800, matching the loaded Alegreya/Manrope cuts.
      fontWeight: {
        "300": "300",
        "400": "400",
        "500": "500",
        "600": "600",
        "700": "700",
        "800": "800",
      },
      colors: {
        marble: "rgb(var(--c-marble) / <alpha-value>)", // page ground
        chalk: "rgb(var(--c-chalk) / <alpha-value>)", // raised cards
        stone: "rgb(var(--c-stone) / <alpha-value>)", // panels / vitrine
        ash: "rgb(var(--c-ash) / <alpha-value>)", // muted text
        slate: "rgb(var(--c-slate) / <alpha-value>)", // ink text
        night: "rgb(var(--c-night) / <alpha-value>)", // dark sections
        garnet: "rgb(var(--c-garnet) / <alpha-value>)", // the accent
        patina: "rgb(var(--c-patina) / <alpha-value>)", // whisper accent
      },
      letterSpacing: {
        lapidary: "0.34em",
      },
      maxWidth: {
        page: "1280px",
      },
      keyframes: {
        strike: {
          "0%": { opacity: "0", transform: "translateY(0.5em)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.16,0.84,0.44,1) both",
        fade: "fade 0.6s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
