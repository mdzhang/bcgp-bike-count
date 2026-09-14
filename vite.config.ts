/// <reference types="vitest/config" />

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/bcgp-bike-count/" : "/",
  plugins: [react(), tailwindcss()],
  test: {
    environment: "happy-dom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
  },
}));
