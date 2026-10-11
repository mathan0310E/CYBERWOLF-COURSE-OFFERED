import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Public site build. Environment variables must be VITE_-prefixed and must
// never contain secrets; anything here is embedded in the client bundle.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  // Extra hosts allowed to reach the dev server (e.g. a hosted preview proxy).
  // Local-only: set VITE_ALLOWED_HOSTS in a gitignored .env.local; production
  // static hosting is unaffected.
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(",").map((h) => h.trim()).filter(Boolean)
    : undefined;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false, // never publish source maps for anything holding private data
      target: "es2022",
    },
    server: {
      port: 5173,
      strictPort: true,
      allowedHosts,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
    preview: {
      port: 5173,
      strictPort: true,
    },
  };
});
