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
          if (id.includes("node_modules")) {
            // Split heavy libraries into their own chunks
            if (id.includes("framer-motion")) return "animation-vendor";
            if (id.includes("@supabase")) return "supabase-vendor";
            
            // Catch-all for other dependencies
            return "vendor";
          }
        },
      },
    },
    // Raise the limit to avoid the warning without sacrificing performance
    chunkSizeWarningLimit: 800,
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
