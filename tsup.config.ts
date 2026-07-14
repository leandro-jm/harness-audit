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
  // Shebang + shim de require: deps CJS bundladas (ex.: simple-git) chamam
  // require("fs"). Em bundle ESM, o __require do esbuild só funciona se houver
  // um `require` real no escopo — criado aqui via createRequire.
  banner: {
    js: [
      "#!/usr/bin/env node",
      "import { createRequire as __harnessCreateRequire } from 'node:module';",
      "const require = __harnessCreateRequire(import.meta.url);",
    ].join("\n"),
  },
  splitting: false,
  sourcemap: false,
  minify: false,
});
