import type { Config } from "tailwindcss";

// The admin application shares the CyberWolf 360 design tokens but is a
// separate build with its own content paths. Typography, palette and buttons
// mirror the A2Z Academy style (Zoho Puvi, brand green #71BF43).
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        background: "#0B1220",
        "background-secondary": "#101A2E",
        card: "#16223A",
        border: "#24314D",
        input: "#24314D",
        ring: "#71BF43",
        foreground: "#F5F7FA",
        muted: "#A4ADBB",
        "muted-foreground": "#A4ADBB",
        accent: { DEFAULT: "#71BF43", secondary: "#1A335A" },
        primary: { DEFAULT: "#71BF43", foreground: "#0B1220" },
        secondary: { DEFAULT: "#1A335A", foreground: "#F5F7FA" },
        destructive: { DEFAULT: "#FF6B6B", foreground: "#0B1220" },
        warning: { DEFAULT: "#FFB84D", foreground: "#0B1220" },
        brand: {
          green: "#71BF43",
          "green-hover": "#5FA536",
          "green-soft": "#EAF6E1",
          navy: "#1A335A",
          "navy-deep": "#0F2340",
          "navy-soft": "#8FA8CE",
        },
      },
      fontFamily: {
        sans: [
          "Zoho Puvi",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      boxShadow: {
        focus: "0 0 0 2px #0B1220, 0 0 0 4px #71BF43",
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
