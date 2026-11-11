import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // Django dev server; only used when VITE_USE_FIXTURES=false
    proxy: { "/api": "http://localhost:8000" },
  },
});
