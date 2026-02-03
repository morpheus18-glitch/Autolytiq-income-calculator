import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    wasm(),
    topLevelAwait()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "..", "..", "shared"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "..", "..", "dist/public"),
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          "react-vendor": ["react", "react-dom"],
          // Animation library
          "framer": ["framer-motion"],
          // Icons (tree-shaking helps but still significant)
          "icons": ["lucide-react"],
          // Router
          "router": ["wouter"],
          // WASM calculation engine
          "calc-wasm": ["@autolytiq/calc-wasm"],
          // Browser databases
          "browser-db": ["sql.js", "@duckdb/duckdb-wasm"],
        },
      },
    },
    // Increase warning threshold since we're now splitting
    chunkSizeWarningLimit: 500,
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ["@autolytiq/calc-wasm"],
  },
  worker: {
    format: "es",
    plugins: () => [wasm(), topLevelAwait()],
  },
});
