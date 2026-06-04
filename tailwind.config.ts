import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        cream: "#f5f5f0",
        "gray-1": "#1a1a1a",
        "gray-2": "#242424",
        "gray-3": "#333333",
        "gray-4": "#555555",
        "gray-5": "#888888",
        "gray-6": "#aaaaaa",
        sage: { DEFAULT: "#4a7c59", light: "#6aab7a", bg: "#1e2e22" },
        amber: { DEFAULT: "#c47c2b", light: "#e09b45", bg: "#2c1f0e" },
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        ticker: "ticker 18s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
