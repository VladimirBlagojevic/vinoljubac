import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon-assets/favicon.ico",
        "favicon-assets/favicon-16x16.png",
        "favicon-assets/favicon-32x32.png",
        "favicon-assets/apple-touch-icon.png",
        "favicon-assets/pwa-192x192.png",
        "favicon-assets/pwa-512x512.png",
        "favicon-assets/pwa-maskable-192x192.png",
        "favicon-assets/pwa-maskable-512x512.png",
      ],
      manifest: {
        name: "Vinoljubac — Put oko Sveta",
        short_name: "Vinoljubac",
        description:
          "Pratilac degustacije salona Put oko Sveta, vol. 3. 17. oktobar 2026, Fabrika Events.",
        lang: "sr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#f4efe6",
        theme_color: "#f4efe6",
        icons: [
          {
            src: "/favicon-assets/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon-assets/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon-assets/pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/favicon-assets/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest,woff2}"],
        navigateFallback: "/index.html",
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 43123,
    strictPort: true,
  },
});
