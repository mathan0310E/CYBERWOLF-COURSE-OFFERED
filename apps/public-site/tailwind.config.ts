import type { Config } from "tailwindcss";

/**
 * CyberWolf 360 public-site design system — "matrix" cyber-green theme.
 *
 * Deep near-black surfaces (#040A06 page, #07130C alt, #0B1F14 cards, #16352A
 * lines) with a matrix-green primary (#39FF14), emerald secondary (#10B981) and
 * mint highlight (#5EEAD4), aimed at a college/student audience. Type is Space
 * Grotesk (display) + Manrope (body) + JetBrains Mono (code), self-hosted from
 * /fonts.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1180px" },
    },
    extend: {
      colors: {
        background: "#040A06",
        "background-secondary": "#07130C",
        card: "#0B1F14",
        border: "#16352A",
        input: "#16352A",
        ring: "#39FF14",
        foreground: "#E7F5EC",
        muted: "#8FA79A",
        "muted-foreground": "#8FA79A",
        accent: { DEFAULT: "#39FF14", secondary: "#10B981" },
        primary: { DEFAULT: "#39FF14", foreground: "#04140A" },
        secondary: { DEFAULT: "#10B981", foreground: "#04140A" },
        destructive: { DEFAULT: "#F43F5E", foreground: "#FFFFFF" },
        neon: "#39FF14",
        emerald: "#10B981",
        mint: "#5EEAD4",
        ink: "#E7F5EC",
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
        focus: "0 0 0 4px rgba(57, 255, 20, 0.4)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 32px -18px rgba(0,0,0,0.9)",
        lift: "0 24px 60px -28px rgba(57, 255, 20, 0.45)",
        neon: "0 0 0 1px rgba(57,255,20,0.35), 0 0 24px -4px rgba(57,255,20,0.5)",
        emerald: "0 0 0 1px rgba(16,185,129,0.35), 0 0 28px -6px rgba(16,185,129,0.55)",
        glow: "0 0 40px -10px rgba(57, 255, 20, 0.55)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(57,255,20,0.45)" },
          "70%": { boxShadow: "0 0 0 14px rgba(57,255,20,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(57,255,20,0)" },
        },
        blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out",
        "slide-up": "slide-up 320ms ease-out",
        shimmer: "shimmer 1.6s infinite",
        float: "float 9s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        blink: "blink 1.05s step-end infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
