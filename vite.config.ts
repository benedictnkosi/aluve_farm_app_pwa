import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mockServer from "vite-plugin-mock-server";
import dotenv from 'dotenv';

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "aluve-crop",
        short_name: "aluve-crop",
        description: "Aluve crop is a web application that helps you manage your crop farm",
        theme_color: "#ffffff",

        icons: [
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: true,
      },
    }),
    mockServer(),
  ],
  define: {
    'process.env': process.env,
  },
  resolve: {
  },
  preview: {
    port: 5173,
  },
});
