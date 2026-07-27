import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Fixture builds shell out to git and touch tmp dirs — give them room.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary", "html"],
      include: ["src/**/*.ts"],
      // Pontos de entrada e i18n (dados) não precisam de cobertura de linha.
      exclude: ["src/cli.ts", "src/index.ts", "src/version.ts", "src/i18n/*.ts", "src/app/wizard.ts"],
      // Pisos logo abaixo do medido — funcionam como catraca contra regressão.
      thresholds: {
        lines: 82,
        functions: 82,
        statements: 80,
        branches: 70,
      },
    },
  },
});
