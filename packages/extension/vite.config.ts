import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { resolve } from "path";

// Chrome extension manifest
const manifest = {
  manifest_version: 3,
  name: "Income Calculator Pro",
  version: "2.0.0",
  description: "Calculate your projected annual income from YTD earnings and vehicle affordability",
  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png",
  },
  action: {
    default_popup: "popup.html",
    default_icon: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png",
    },
  },
  permissions: ["storage"],
  offline_enabled: true,
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
};

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    crx({ manifest }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
      },
    },
    target: "esnext",
  },
  optimizeDeps: {
    exclude: ["@autolytiq/calc-wasm"],
  },
  resolve: {
    alias: {
      "@autolytiq/calc-wasm": resolve(__dirname, "../calc-wasm/pkg"),
    },
  },
});
