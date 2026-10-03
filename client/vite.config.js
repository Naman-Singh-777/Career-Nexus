import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Only set for the GitHub Pages build (see .github/workflows/deploy-pages.yml),
  // so a plain local build still serves from "/" like it always has.
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
  build: {
    outDir: "dist",
  },
});
