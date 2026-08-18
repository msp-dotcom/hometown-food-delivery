import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        charcoal: "#1F2937",
        charcoalSoft: "#6B7280",
        sand: "#F3F4F6",
        line: "#E5E7EB",
        mustard: "#FF6B35",
        mustardLight: "#FF9F68",
        chili: "#E63946",
        green: "#16A34A",
      },
    },
  },
  plugins: [],
};
export default config;
