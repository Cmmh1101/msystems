import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1B2D",
        "ink-2": "#172A42",
        paper: "#F5F3EE",
        "paper-2": "#ECE8DE",
        graphite: "#1C2530",
        "graphite-soft": "#4A5568",
        line: "#7FB8D9",
        brass: "#B8935A",
        "brass-light": "#D4B483",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
