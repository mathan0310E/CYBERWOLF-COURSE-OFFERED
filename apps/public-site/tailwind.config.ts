import type { Config } from "tailwindcss";

/**
 * CyberWolf 360 public-site design system — futuristic "cyber" theme.
 *
 * Dark surfaces (#05070D page, #0B1120 alt, #0F172A cards, #1E293B lines) with
 * neon cyan (#22D3EE), violet (#8B5CF6) and lime (#7CF29C) accents, aimed at a
 * college/student audience. Type is Space Grotesk (display) + Manrope (body) +
 * JetBrains Mono (code), self-hosted from /fonts.
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
        violet: "0 0 0 1px rgba(139,92,246,0.35), 0 0 28px -6px rgba(139,92,246,0.55)",
        glow: "0 0 40px -10px rgba(34, 211, 238, 0.55)",
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
          "0%": { boxShadow: "0 0 0 0 rgba(34,211,238,0.45)" },
          "70%": { boxShadow: "0 0 0 14px rgba(34,211,238,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34,211,238,0)" },
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
