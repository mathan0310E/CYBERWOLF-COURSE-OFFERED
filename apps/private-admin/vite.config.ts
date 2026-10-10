import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Private admin build. This is a SEPARATE application from the public site:
// its own entry, router, bundle and deployment target. It must never be
// bundled into the public site and must be deployed behind a restricted
// network boundary or private hosting.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // never publish source maps for private admin code
    target: "es2022",
    rollupOptions: {
      output: {
        // Split large vendors so no single admin chunk dominates the load and
        // unchanged libraries stay cached across deploys.
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth"],
          router: ["react-router-dom"],
          query: ["@tanstack/react-query", "@tanstack/react-table"],
          charts: ["recharts"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
});
