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

/** Execução isolada / sandbox (4.1). */
export const DEVCONTAINER_GLOBS = [".devcontainer/**", ".gitpod.yml", ".gitpod.Dockerfile"];
export const DOCKER_GLOBS = [
  "Dockerfile",
  "Dockerfile.*",
  "**/Dockerfile.dev",
  "docker-compose.yml",
  "docker-compose.yaml",
  "compose.yml",
  "compose.yaml",
];

/** Higiene de segredos (4.2). */
export const SECRET_SCANNER_GLOBS = [
  ".gitleaks.toml",
  "gitleaks.toml",
  ".secretlintrc",
  ".secretlintrc.*",
  ".pre-commit-config.yaml",
  ".trufflehog.*",
];

/** Revisão estruturada (4.3). */
export const CODEOWNERS_GLOBS = ["CODEOWNERS", ".github/CODEOWNERS", "docs/CODEOWNERS"];
export const PR_TEMPLATE_GLOBS = [
  ".github/pull_request_template.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/PULL_REQUEST_TEMPLATE/**",
  "docs/pull_request_template.md",
];

/** Permissões de agente escopadas (4.4). */
export const AGENT_PERMS_GLOBS = [
  ".claude/settings.json",
  ".claude/settings.local.json",
  ".mcp.json",
  ".cursor/environment.json",
];

/** Artefatos cujas edições indicam iteração no harness (6.2). */
export const HARNESS_GLOBS = [
  ...GUIDE_GLOBS,
  ...RULES_STYLE_GLOBS,
  ...ARCH_SENSOR_GLOBS,
  ".github/workflows/**",
];

// ── D7 · Segurança (DevSecOps) ──────────────────────────────────────────────

/** SAST dedicado: workflow ou config no repo (7.1). */
export const SAST_WORKFLOW_GLOBS = [
  ".github/workflows/codeql.yml",
  ".github/workflows/codeql.yaml",
  ".github/workflows/codeql-analysis.yml",
  ".github/workflows/codeql-analysis.yaml",
  ".github/workflows/semgrep.yml",
  ".github/workflows/semgrep.yaml",
];
export const SAST_CONFIG_GLOBS = [
  ".semgrep.yml",
  ".semgrep.yaml",
  ".semgrep/**",
  "semgrep.yml",
  ".njsscan",
  "njsscan.yml",
  ".bandit",
  "bandit.yaml",
];

/** Atualização automatizada de dependências (7.2). */
export const DEP_UPDATE_GLOBS = [
  ".github/dependabot.yml",
  ".github/dependabot.yaml",
  "renovate.json",
  "renovate.json5",
  ".renovaterc",
  ".renovaterc.json",
  ".github/renovate.json",
];

/** Manifestos de dependência (para saber se há deps a monitorar/pinar — 7.2/7.4). */
export const MANIFEST_GLOBS = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "requirements/*.txt",
  "Pipfile",
  "setup.py",
  "go.mod",
];

/** Lockfiles commitados (7.4). */
export const LOCKFILE_GLOBS = [
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "bun.lock",
  "poetry.lock",
  "Pipfile.lock",
  "uv.lock",
  "pdm.lock",
  "go.sum",
];

/** SBOM / attestation declarada (bônus em 7.4). */
export const SBOM_GLOBS = [
  "sbom.json",
  "sbom.xml",
  "**/*.cdx.json",
  "**/*.spdx.json",
  "**/bom.json",
];

/** Política de resposta a vulnerabilidade (7.5). */
export const SECURITY_POLICY_GLOBS = [
  "SECURITY.md",
  ".github/SECURITY.md",
  "docs/SECURITY.md",
  ".github/SECURITY.rst",
];

/** Hooks de pre-commit (guardrail local; secret scan em 7.3, sinal em F13). */
export const PRECOMMIT_GLOBS = [
  ".pre-commit-config.yaml",
  ".pre-commit-config.yml",
  ".husky/**",
  "lefthook.yml",
  "lefthook.yaml",
  ".lefthook.yml",
  ".lefthook.yaml",
];

// ── D8 · Runtime harness (perfis uses-ai / both) ────────────────────────────

/** Configs/dirs de avaliação (evals) de LLM (8.1). */
export const EVAL_GLOBS = [
  "promptfooconfig.yaml",
  "promptfooconfig.yml",
  "promptfoo.config.*",
  ".promptfoo/**",
  "evals/**",
  "eval/**",
  "**/*.eval.ts",
  "**/*.eval.py",
  "deepeval.config.*",
  ".deepeval/**",
  "ragas/**",
];

/** Prompts versionados no repo (8.2). */
export const PROMPT_GLOBS = [
  "prompts/**",
  "prompt/**",
  ".prompts/**",
  "**/*.prompt",
  "**/*.prompty",
  "**/*.prompt.md",
  "**/*.prompt.txt",
];

/** Configs de guardrails de tool use / saída de LLM (8.4). */
export const GUARDRAIL_GLOBS = [
  "guardrails.yml",
  "guardrails.yaml",
  ".guardrails/**",
  "nemoguardrails/**",
  "config/rails/**",
];
