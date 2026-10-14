import type { Config } from "tailwindcss";

/**
 * CyberWolf 360 private-admin design system — warm editorial "studio" theme.
 *
 * Shares the public site's cream/ink/pastel tokens (cream #F5F2EB, ink #232323,
 * periwinkle #CBDBE9, lilac #DCC9F7, butter #FFE697, sand #E2DDD2) and the
 * Fraunces + Inter Tight type pairing, but is a separate build with its own
 * content paths and a wider container for the dense data tables.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1600px" } },
    extend: {
      colors: {
        background: "#F5F2EB",
        "background-secondary": "#EDE8DD",
        card: "#FFFFFF",
        border: "#252525",
        input: "#252525",
        ring: "#232323",
        foreground: "#232323",
        muted: "#5C574C",
        "muted-foreground": "#5C574C",
        primary: { DEFAULT: "#232323", foreground: "#F5F2EB" },
        secondary: { DEFAULT: "#DCC9F7", foreground: "#232323" },
        accent: { DEFAULT: "#FFE697", secondary: "#DCC9F7" },
        destructive: { DEFAULT: "#C2410C", foreground: "#FFFFFF" },
        warning: { DEFAULT: "#B45309", foreground: "#FFF7ED" },
        success: { DEFAULT: "#15803D", foreground: "#FFFFFF" },
        ink: "#232323",
        sky: "#CBDBE9",
        lilac: "#DCC9F7",
        butter: "#FFE697",
        sand: "#E2DDD2",
        blush: "#FFD7DE",
        tan: "#D5C3A7",
      },
      fontFamily: {
        sans: ["Inter Tight", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "Times New Roman", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        xl: "22px",
        pill: "980px",
      },
      boxShadow: {
        card: "1px 1px 0 0 #252525",
        lift: "4px 4px 0 0 #252525",
        pop: "6px 6px 0 0 #252525",
        focus: "0 0 0 4px rgba(35, 35, 35, 0.25)",
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
