import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts", "src/index.ts"],
  format: ["esm"],
  target: "node20",
  platform: "node",
  clean: true,
  // Bundle ALL runtime deps → zero-runtime-dependency published package.
  // Better supply-chain story for running inside corporate repos (PRD §12).
  noExternal: [/.*/],
  banner: { js: "#!/usr/bin/env node" },
  splitting: false,
  sourcemap: false,
  minify: false,
});
