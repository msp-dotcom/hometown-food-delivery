import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        charcoal: "#172033",
        charcoalSoft: "#697386",
        sand: "#F5F7FA",
        line: "#E8EBF0",
        mustard: "#FF5A1F",
        mustardLight: "#FF9B70",
        chili: "#E94812",
        green: "#18A957",
      },
      boxShadow: {
        soft: "0 6px 22px rgba(23,32,51,.06)",
        lift: "0 12px 30px rgba(23,32,51,.10)",
      },
    },
  },
  plugins: [],
};
export default config;
