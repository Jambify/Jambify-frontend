import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/", // Use absolute paths for assets
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
    // Optimize chunks for better code splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks for better caching
          if (id.includes("node_modules")) {
            if (id.includes("react")) {
              return "react-vendor";
            }
            if (id.includes("supabase")) {
              return "supabase-vendor";
            }
            if (id.includes("framer-motion")) {
              return "animation-vendor";
            }
            return "vendor";
          }
        },
      },
    },
    // Enable compression for smaller bundles
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    // Progressive enhancement with smaller chunks
    cssCodeSplit: true,
    reportCompressedSize: true,
  },
  esbuild: {
    target: "es2022",
    // Drop console in production
    drop: ["console", "debugger"],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
    },
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-helmet-async",
      "framer-motion",
      "zustand",
    ],
  },
});
