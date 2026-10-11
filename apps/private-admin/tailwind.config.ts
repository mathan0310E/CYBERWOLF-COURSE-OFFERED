import type { Config } from "tailwindcss";

/**
 * CyberWolf 360 private-admin design system.
 *
 * Shares the Apple-Store-derived tokens with the public site (white surface,
 * #F5F5F7 alt surface, #1D1D1F ink, #86868B grey, #0071E3 blue, #D2D2D7
 * hairlines) but is a separate build with its own content paths.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1440px" } },
    extend: {
      colors: {
        background: "#FFFFFF",
        "background-secondary": "#F5F5F7",
        card: "#FFFFFF",
        border: "#D2D2D7",
        input: "#D2D2D7",
        ring: "#0071E3",
        foreground: "#1D1D1F",
        muted: "#86868B",
        "muted-foreground": "#86868B",
        accent: { DEFAULT: "#0071E3", secondary: "#86868B" },
        primary: { DEFAULT: "#0071E3", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#1D1D1F", foreground: "#FFFFFF" },
        destructive: { DEFAULT: "#E30000", foreground: "#FFFFFF" },
        warning: { DEFAULT: "#B45309", foreground: "#FFFFFF" },
        apple: {
          blue: "#0071E3",
          "blue-hover": "#0076DF",
          ink: "#1D1D1F",
          grey: "#86868B",
          line: "#D2D2D7",
          surface: "#F5F5F7",
          hover: "#E8E8ED",
          dark: "#000000",
        },
      },
      fontFamily: {
        sans: [
          "SF Pro Text",
          "SF Pro Icons",
          "-apple-system",
          "BlinkMacSystemFont",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        display: [
          "SF Pro Display",
          "SF Pro Icons",
          "-apple-system",
          "BlinkMacSystemFont",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 6px)",
        sm: "calc(var(--radius) - 10px)",
        pill: "980px",
      },
      boxShadow: {
        focus: "0 0 0 4px rgba(0, 113, 227, 0.35)",
        card: "2px 4px 12px rgba(0, 0, 0, 0.08)",
        lift: "2px 4px 16px rgba(0, 0, 0, 0.16)",
        soft: "2px 4px 12px rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-in": "fade-in 240ms ease-out", "slide-up": "slide-up 320ms ease-out" },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
