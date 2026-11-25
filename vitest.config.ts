import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    restoreMocks: true,
    // The default worker count outruns this machine: worker start-up times out and whole files are skipped.
    maxWorkers: 4,
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/store/**", "src/data/**"],
    },
  },
});
