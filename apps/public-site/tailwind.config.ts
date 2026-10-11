import type { Config } from "tailwindcss";

/**
 * CyberWolf 360 public-site design system.
 *
 * Palette and component language mirror the Hopewell reference theme
 * (https://preview.themewagon.com/hopewell/): a soft light surface (#F8FAFC /
 * #FFFFFF), a green primary (#16A34A, dark #0F7A37, light #DCFCE7), an amber
 * secondary (#F59E0B / #FEF3C7) and a red accent (#EF4444). Display type is
 * Poppins; body type is Nunito Sans. Spacing follows Tailwind's 4px rem scale.
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
        background: "#F8FAFC",
        "background-secondary": "#F1F5F9",
        card: "#FFFFFF",
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#16A34A",
        foreground: "#0F172A",
        muted: "#5B6B7C",
        "muted-foreground": "#5B6B7C",
        accent: {
          DEFAULT: "#16A34A", // brand green (primary)
          secondary: "#F59E0B", // amber (secondary)
        },
        primary: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F59E0B",
          foreground: "#0F172A",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        // Hopewell brand tokens, exposed for direct use.
        brand: {
          green: "#16A34A",
          "green-dark": "#0F7A37",
          "green-light": "#DCFCE7",
          amber: "#F59E0B",
          "amber-light": "#FEF3C7",
          red: "#EF4444",
          surface: "#FFFFFF",
          bg: "#F8FAFC",
          ink: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["Nunito Sans", "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Poppins", "Nunito Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        pill: "999px",
      },
      boxShadow: {
        focus: "0 0 0 2px #FFFFFF, 0 0 0 4px #16A34A",
        soft: "0 10px 30px -10px rgba(15, 23, 42, 0.12)",
        lift: "0 20px 45px -12px rgba(22, 163, 74, 0.35)",
        card: "0 10px 30px -10px rgba(15, 23, 42, 0.12)",
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
