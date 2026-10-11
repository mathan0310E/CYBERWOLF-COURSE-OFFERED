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
        background: "#FFFFFF",
        "background-secondary": "#F7F7F7",
        card: "#FFFFFF",
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#71BF43",
        foreground: "#1A1A1A",
        muted: "#666666",
        "muted-foreground": "#666666",
        accent: { DEFAULT: "#71BF43", secondary: "#1A335A" },
        primary: { DEFAULT: "#71BF43", foreground: "#1A1A1A" },
        secondary: { DEFAULT: "#1A335A", foreground: "#FFFFFF" },
        destructive: { DEFAULT: "#D92D20", foreground: "#FFFFFF" },
        warning: { DEFAULT: "#B45309", foreground: "#FFFFFF" },
        brand: {
          green: "#71BF43",
          "green-hover": "#5FA536",
          "green-soft": "#EAF6E1",
          navy: "#1A335A",
          "navy-deep": "#0F2340",
          "navy-soft": "#8FA8CE",
          surface: "#F7F7F7",
          ink: "#1A1A1A",
          white: "#FFFFFF",
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
        focus: "0 0 0 2px #FFFFFF, 0 0 0 4px #71BF43",
        card: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px -12px rgba(16,24,40,0.12)",
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
