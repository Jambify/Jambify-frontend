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
  },
  esbuild: {
    target: "es2022",
  },
   optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
    },
  },
});
