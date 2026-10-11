import type { Config } from "tailwindcss";

/**
 * CyberWolf 360 private-admin design system — futuristic "cyber" theme.
 *
 * Shares the tokens with the public site (dark surfaces #05070D / #0B1120 /
 * #0F172A, neon cyan #22D3EE, violet #8B5CF6, lime #7CF29C, Space Grotesk +
 * Manrope + JetBrains Mono) but is a separate build with its own content paths.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1440px" } },
    extend: {
      colors: {
        background: "#05070D",
        "background-secondary": "#0B1120",
        card: "#0F172A",
        border: "#1E293B",
        input: "#1E293B",
        ring: "#22D3EE",
        foreground: "#E6EDF7",
        muted: "#8A94A6",
        "muted-foreground": "#8A94A6",
        accent: { DEFAULT: "#22D3EE", secondary: "#8B5CF6" },
        primary: { DEFAULT: "#22D3EE", foreground: "#04121A" },
        secondary: { DEFAULT: "#8B5CF6", foreground: "#FFFFFF" },
        destructive: { DEFAULT: "#F43F5E", foreground: "#FFFFFF" },
        warning: { DEFAULT: "#F59E0B", foreground: "#1F1300" },
        neon: "#22D3EE",
        violet: "#8B5CF6",
        lime: "#7CF29C",
        ink: "#E6EDF7",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        pill: "980px",
      },
      boxShadow: {
        focus: "0 0 0 4px rgba(34, 211, 238, 0.4)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 32px -18px rgba(0,0,0,0.9)",
        lift: "0 24px 60px -28px rgba(34, 211, 238, 0.45)",
        neon: "0 0 0 1px rgba(34,211,238,0.35), 0 0 24px -4px rgba(34,211,238,0.5)",
        glow: "0 0 40px -10px rgba(34, 211, 238, 0.55)",
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
