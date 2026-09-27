import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "node:path";

/**
 * D22: month simulation against the `homeworks_test` schema (`npm run test:sim`).
 * Env comes from `.env.test.local` (mode "test" wins over `.env`).
 */
export default defineConfig(({ mode }) => ({
  test: {
    include: ["tests/simulation/**/*.sim.ts"],
    environment: "node",
    env: loadEnv(mode ?? "test", process.cwd(), ""),
    setupFiles: ["tests/simulation/setup.ts"],
    testTimeout: 60 * 60_000,
    hookTimeout: 5 * 60_000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "tests/simulation/stubs/server-only.ts"),
    },
  },
}));
