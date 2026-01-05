import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
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
        },
      },
    },
    // Increase warning threshold since we're now splitting
    chunkSizeWarningLimit: 500,
  },
  server: {
    host: "0.0.0.0",
  },
});
