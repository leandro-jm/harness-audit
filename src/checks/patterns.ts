// Conjuntos de padrões glob reutilizados por vários checks. Centralizados aqui
// para consistência (ex.: 2.1/2.3/5.1 usam GUIDE_GLOBS; 1.x usam SPEC_GLOBS).

/** Guias de agente (feedforward). Usado por D2 e D5. */
export const GUIDE_GLOBS = [
  "CLAUDE.md",
  "AGENTS.md",
  "GEMINI.md",
  ".github/copilot-instructions.md",
  ".cursorrules",
  ".cursor/rules/**",
  ".windsurfrules",
  ".clinerules",
  ".clinerules/**",
  ".aider.conf.yml",
];

/** Guias "principais" de nível de topo (pontuam mais em 2.1). */
export const PRIMARY_GUIDE_GLOBS = [
  "CLAUDE.md",
  "AGENTS.md",
  "GEMINI.md",
  ".github/copilot-instructions.md",
];

/** Artefatos de especificação (SDD). Usado por D1. */
export const SPEC_GLOBS = [
  "spec.md",
  "SPEC.md",
  "specs/**",
  "spec/**",
  "docs/specs/**",
  "**/*.spec.md",
  ".speckit/**",
  ".kiro/**",
  "openspec/**",
  "OPENSPEC.md",
];

/** Código-fonte (para drift/frescor). Amplo o suficiente para vários layouts. */
export const SRC_GLOBS = [
  "src/**",
  "lib/**",
  "app/**",
  "packages/*/src/**",
  "internal/**",
  "pkg/**",
  "cmd/**",
];

/** Rastros de planos/tarefas derivados de spec (booster de 1.5). */
export const TASKS_GLOBS = [
  "tasks.md",
  "TASKS.md",
  "plan.md",
  "PLAN.md",
  "specs/**/tasks*.md",
  "specs/**/plan*.md",
  ".speckit/**/tasks*",
  ".kiro/**/tasks*",
];

/** ADRs / decisões de arquitetura (memória semântica, 5.2). */
export const ADR_GLOBS = [
  "docs/adr/**",
  "docs/adrs/**",
  "docs/decisions/**",
  "adr/**",
  "adrs/**",
  "**/*.adr.md",
  "DECISIONS.md",
  "docs/architecture/decisions/**",
];

/** Configs de regras de arquitetura/estilo (2.4, 3.5). */
export const ARCH_SENSOR_GLOBS = [
  ".dependency-cruiser.js",
  ".dependency-cruiser.cjs",
  ".dependency-cruiser.mjs",
  ".dependency-cruiser.json",
  "dependency-cruiser.config.*",
];

export const RULES_STYLE_GLOBS = [
  ".editorconfig",
  ".eslintrc",
  ".eslintrc.*",
  "eslint.config.*",
  "biome.json",
  "biome.jsonc",
  ".prettierrc",
  ".prettierrc.*",
  "prettier.config.*",
];
