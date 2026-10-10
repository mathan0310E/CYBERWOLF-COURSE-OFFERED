import type { Config } from "tailwindcss";

// The admin application shares the CyberWolf 360 design tokens but is a
// separate build with its own content paths.
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        background: "#090B10",
        "background-secondary": "#11151D",
        card: "#171D27",
        border: "#242B37",
        input: "#242B37",
        ring: "#73F59B",
        foreground: "#F5F7FA",
        muted: "#A4ADBB",
        "muted-foreground": "#A4ADBB",
        accent: { DEFAULT: "#73F59B", secondary: "#9B7CFF" },
        primary: { DEFAULT: "#73F59B", foreground: "#090B10" },
        secondary: { DEFAULT: "#9B7CFF", foreground: "#090B10" },
        destructive: { DEFAULT: "#FF6B6B", foreground: "#090B10" },
        warning: { DEFAULT: "#FFB84D", foreground: "#090B10" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      boxShadow: {
        focus: "0 0 0 2px #090B10, 0 0 0 4px #73F59B",
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "fade-in": "fade-in 240ms ease-out", "slide-up": "slide-up 320ms ease-out" },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
