import type { Config } from "tailwindcss";

// Design system "the instrument" — design guide, Modernist revision.
//
// Every color below is also a CSS variable in app/globals.css. They are
// declared twice on purpose: Tailwind needs literal values at build time to
// generate classes, and hand-written SVG needs the variables at runtime.
//
// RULE: change one, change the other. If these two files disagree the site
// quietly develops two slightly different palettes and nobody notices for
// weeks. This is design guide open item #1.
//
// AUGUST 11, 2026 — the palette pass. Warm ground, warm ink, brass promoted
// to a role. The reasoning is written out in globals.css; this file is the
// mirror, so it carries the values and not the argument.
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
        ink: "#171A1D",
        "ink-2": "#3A4249",
        paper: "#F2EEE6",
        surface: "#FFFFFF",
        accent: "#0D6E5F",
        "accent-dk": "#0A574B",
        "accent-soft": "#E4EFEB",
        brass: "#9C6A12",
        "brass-soft": "#F6EEDC",
        before: "#98917F",
        muted: "#5A6066",
        line: "#E0D9CB",

        // utility — design guide §1.2
        "paper-2": "#E7E1D4",
        "line-strong": "#C9C0AE",
        "ink-deep": "#101A18",

        // A brass tint for brass on the dark band. Kept under its old name so
        // existing references resolve; it is no longer a separate gold.
        "gold-dark": "#C88F2A",

        // Retained so existing references resolve, but no longer part of the
        // system — these were the homepage category tints. Do not reach for
        // them on a new page.
        mint: "#EFF6F4",
        "indigo-soft": "#EAF0F7",

        // the data palette — design guide §1.4. Data only, as of August 11:
        // never navigation, cards or icons.
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
        // Modernist, August 10 2026 — square corners are the system's whole
        // gesture, so the entire scale is overridden rather than just the one
        // named key. `rounded-full`, `rounded-lg` and friends all resolve to
        // zero, which means a stray utility on a future page cannot quietly
        // reintroduce a curve. Mirrors --radius in globals.css.
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px",
        card: "0px",
      },
      borderWidth: {
        // Two weights and only two — see globals.css. `border-rule` separates
        // structure, the default hairline separates repetition.
        rule: "2px",
      },
      boxShadow: {
        // Elevation comes from the rule, not from a shadow. Both keys resolve
        // to none so an existing `shadow-card` cannot re-soften a panel.
        sm: "none",
        card: "none",
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
