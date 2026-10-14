import type { Config } from "tailwindcss";

/**
 * CyberWolf 360 public-site design system — warm editorial "studio" theme.
 *
 * A cream paper surface (#F5F2EB) with near-black ink (#232323), oversized
 * editorial headings, and a playful pastel accent set (periwinkle #CBDBE9,
 * lilac #DCC9F7, butter #FFE697, sand #E2DDD2). Cards and buttons are softly
 * rounded with 1px ink hairlines and a hard offset "sticker" shadow.
 *
 * Type is Fraunces (display serif, variable) + Inter Tight (grotesk body),
 * self-hosted from /fonts so the strict `font-src 'self'` CSP still holds.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
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
        // Kept so shared component variants keep resolving; mapped to the new
        // editorial palette (primary = ink, secondary = lilac accent).
        primary: { DEFAULT: "#232323", foreground: "#F5F2EB" },
        secondary: { DEFAULT: "#DCC9F7", foreground: "#232323" },
        accent: { DEFAULT: "#FFE697", secondary: "#DCC9F7" },
        destructive: { DEFAULT: "#C2410C", foreground: "#FFFFFF" },
        ink: "#232323",
        // Playful pastel accent set.
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
        lg: "20px",
        md: "14px",
        sm: "10px",
        xl: "28px",
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
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        sway: {
          "0%,100%": { transform: "rotate(4deg)" },
          "50%": { transform: "rotate(8deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out",
        "slide-up": "slide-up 320ms ease-out",
        shimmer: "shimmer 1.6s infinite",
        marquee: "marquee 30s linear infinite",
        sway: "sway 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
