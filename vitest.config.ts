import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Fixture builds shell out to git and touch tmp dirs — give them room.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
