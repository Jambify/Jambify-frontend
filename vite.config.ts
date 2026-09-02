import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      open: process.env.ANALYZE === "true",
    }),
  ],
  base: "/", // Use absolute paths for assets
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
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