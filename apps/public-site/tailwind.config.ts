import type { Config } from "tailwindcss";

/**
 * CyberWolf 360 design system.
 *
 * Typography, palette and button styling are derived from the A2Z Academy site
 * (https://www.a2zacademy.co.in/): the Zoho Puvi typeface, a deep-navy surface
 * scale and a single vivid brand green (#71BF43) with a #5FA536 hover and
 * #EAF6E1 soft tint. Spacing derives from Tailwind's default 4px-based rem scale.
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
        background: "#0B1220",
        "background-secondary": "#101A2E",
        card: "#16223A",
        border: "#24314D",
        input: "#24314D",
        ring: "#71BF43",
        foreground: "#F5F7FA",
        muted: "#A4ADBB",
        "muted-foreground": "#A4ADBB",
        accent: {
          DEFAULT: "#71BF43", // brand green (primary)
          secondary: "#B7E39A", // soft green highlight
        },
        primary: {
          DEFAULT: "#71BF43",
          foreground: "#0B1220",
        },
        secondary: {
          DEFAULT: "#B7E39A",
          foreground: "#0B1220",
        },
        destructive: {
          DEFAULT: "#FF6B6B",
          foreground: "#0B1220",
        },
        // A2Z brand tokens, exposed for direct use.
        brand: {
          green: "#71BF43",
          "green-hover": "#5FA536",
          "green-soft": "#EAF6E1",
          navy: "#1A335A",
          "navy-deep": "#0F2340",
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
        focus: "0 0 0 2px #0B1220, 0 0 0 4px #71BF43",
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)",
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
