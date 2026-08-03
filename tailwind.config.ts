import type { Config } from "tailwindcss";

// Design system "the instrument" — brief v2 §7.
// Colours are defined once here and once in globals.css as CSS variables.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
