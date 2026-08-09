import type { Config } from "tailwindcss";

// Design system "the instrument" — design guide v1.
//
// Every color below is also a CSS variable in app/globals.css. They are
// declared twice on purpose: Tailwind needs literal values at build time to
// generate classes, and hand-written SVG needs the variables at runtime.
//
// RULE: change one, change the other. If these two files disagree the site
// quietly develops two slightly different palettes and nobody notices for
// weeks. This is design guide open item #1.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // core — design guide §1.1
        ink: "#0E1A24",
        "ink-2": "#1C2E3D",
        paper: "#F4F6F8",
        surface: "#FFFFFF",
        accent: "#0D6E5F",
        "accent-dk": "#0A574B",
        "accent-soft": "#E6F2EF",
        brass: "#9C6A12",
        "brass-soft": "#FBF3E2",
        before: "#8A98A5",
        muted: "#5B6B79",
        line: "#DFE5EA",

        // utility — design guide §1.2
        "paper-2": "#EAEFF3",
        "line-strong": "#C2CED8",
        "ink-deep": "#08302A",
        "gold-dark": "#F3C560",
        mint: "#EFF6F4",
        "indigo-soft": "#EAF0F7",

        // the data palette — design guide §1.4
        "c-pi": "#0D6E5F",
        "c-pi-2": "#17A188",
        "c-tax": "#2E7FD1",
        "c-ins": "#EF9A2E",
        "c-pmi": "#8B6FB0",
        "c-hoa": "#C4788C",
        "c-interest": "#4E748F",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      borderRadius: {
        // design guide §1.2 — one radius, used everywhere
        card: "12px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(14,26,36,.07)",
        card: "0 1px 2px rgba(14,26,36,.06), 0 10px 28px -14px rgba(14,26,36,.24)",
      },
      maxWidth: {
        // design guide §2.3 — prose measure. Never applied to a heading.
        lede: "70ch",
        prose: "68ch",
        wrap: "1200px",
      },
      minHeight: {
        // design guide §4.2 — fixed slot so results never jump while typing
        tab: "260px",
        tap: "42px",
      },
    },
  },
  plugins: [],
};

export default config;
