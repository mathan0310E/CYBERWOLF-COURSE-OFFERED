import type { Config } from "tailwindcss";

/**
 * CyberWolf 360 public-site design system.
 *
 * Mirrors the Apple Store (https://www.apple.com/in/store) visual language:
 * a clean white surface (#FFFFFF) with the #F5F5F7 alt surface, near-black ink
 * (#1D1D1F), grey text (#86868B), Apple blue (#0071E3, hover #0076DF), hairlines
 * (#D2D2D7) and 18px card radii with the `2px 4px 12px rgba(0,0,0,.08)` soft
 * shadow. Type is the SF Pro stack with the usual system fallbacks.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1024px" },
    },
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
        // Apple palette tokens, exposed for direct use.
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
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out",
        "slide-up": "slide-up 320ms ease-out",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
