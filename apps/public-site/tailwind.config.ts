import type { Config } from "tailwindcss";

/**
 * CyberWolf 360 design system.
 *
 * Palette mirrored from the A2Z Academy site (https://www.a2zacademy.co.in/):
 * a white/light surface scale, the brand green (#71BF43, hover #5FA536, soft
 * #EAF6E1), the brand navy (#1A335A, deep #0F2340) and near-black ink (#1A1A1A)
 * / body text (#333). Typography uses the Zoho Puvi typeface. Spacing derives
 * from Tailwind's default 4px-based rem scale.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
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
        accent: {
          DEFAULT: "#71BF43", // brand green (primary)
          secondary: "#1A335A", // brand navy (secondary)
        },
        primary: {
          DEFAULT: "#71BF43",
          foreground: "#1A1A1A",
        },
        secondary: {
          DEFAULT: "#1A335A",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#D92D20",
          foreground: "#FFFFFF",
        },
        // A2Z brand tokens, exposed for direct use.
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        focus: "0 0 0 2px #FFFFFF, 0 0 0 4px #71BF43",
        card: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px -12px rgba(16,24,40,0.12)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
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
