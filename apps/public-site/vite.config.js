import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
// Public site build. Environment variables must be VITE_-prefixed and must
// never contain secrets; anything here is embedded in the client bundle.
export default defineConfig({
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
        headers: {
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
    },
    preview: {
        port: 5173,
        strictPort: true,
    },
});
