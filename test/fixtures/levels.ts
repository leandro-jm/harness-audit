import type { FixtureSpec, CommitSpec } from "./build-fixture.js";
import type { Profile } from "../../src/core/types.js";
import type { SelfReportAnswers } from "../../src/self-report/types.js";
import type { MaturityLevel } from "../../src/scoring/types.js";

export interface LevelFixture {
  name: string;
  band: MaturityLevel;
  profile: Profile;
  spec: FixtureSpec;
  answers: SelfReportAnswers;
}

const NO_ANSWERS: SelfReportAnswers = { answered: false };
const BEST_ANSWERS: SelfReportAnswers = {
  answered: true,
  fixFirst: "guide-or-sensor",
  harnessOwner: "yes-backlog",
  sensorsBlockMerge: "block",
  learningsToGuide: "yes",
  tasksFromSpec: "yes",
  vulnToRule: "yes",
};

const MEDIUM_ANSWERS: SelfReportAnswers = {
  answered: true,
  fixFirst: "prompt",
  harnessOwner: "informal",
  sensorsBlockMerge: "inform",
  learningsToGuide: "sometimes",
  tasksFromSpec: "partial",
};

const CLAUDE = { "Co-authored-by": "Claude <noreply@anthropic.com>" };

const CI_FULL =
  "name: CI\non: [pull_request]\njobs:\n  ci:\n    runs-on: ubuntu-latest\n    steps:\n" +
  "      - run: pnpm lint\n      - run: tsc --noEmit\n      - run: pnpm test\n";

const PKG_FULL = JSON.stringify({
  name: "demo",
  scripts: { build: "tsup", test: "vitest", lint: "eslint .", typecheck: "tsc --noEmit" },
  devDependencies: { "dependency-cruiser": "^16" },
});

const SPECIFIC_GUIDE =
  "# CLAUDE.md\n\n## Comandos\nRode `pnpm build`, `pnpm test`, `pnpm lint`.\n\n" +
  "## Arquitetura\nCódigo em src/. Specs em specs/. Veja as convenções abaixo.\n";

// ── Sinais de segurança (D7), graduados por nível ───────────────────────────
const LOCKFILE = "lockfileVersion: '9.0'\n";
const SECURITY_MD = "# Política de Segurança\n\nReporte vulnerabilidades a security@example.com.\n";
const DEPENDABOT =
  "version: 2\nupdates:\n  - package-ecosystem: npm\n    directory: /\n    schedule:\n      interval: weekly\n";
const CODEQL_WORKFLOW =
  "name: CodeQL\non: [pull_request]\njobs:\n  analyze:\n    runs-on: ubuntu-latest\n    steps:\n" +
  "      - uses: github/codeql-action/init@v3\n      - uses: github/codeql-action/analyze@v3\n";

// ── Fé: nada além de código ────────────────────────────────────────────────
function feFixture(): FixtureSpec {
  return {
    commits: Array.from({ length: 6 }, (_, i) => ({
      message: `commit ${i}`,
      files: { [`src/mod${i}.ts`]: `export const v${i} = ${i};` },
    })),
  };
}

// ── Improviso: guia genérico (template) + estilo, feedback no olho, sem CI ───
function improvisoFixture(): FixtureSpec {
  const genericGuide =
    "# CLAUDE.md\nEste projeto usa TypeScript. Substitua <your-project-name>. TODO: detalhar.\n";
  const commits: CommitSpec[] = [
    {
      message: "chore: guia inicial",
      files: {
        "package.json": JSON.stringify({ name: "x" }),
        "CLAUDE.md": genericGuide,
        ".editorconfig": "root = true\n",
        "spec.md": "# Especificação solta",
      },
    },
    ...Array.from({ length: 8 }, (_, i) => ({
      message: `feat ${i}`,
      files: { [`src/mod${i}.ts`]: `export const v${i} = ${i};` },
    })),
  ];
  return { commits };
}

// ── Instrumentado: CI com sensores, guia específico, specs ──────────────────
function instrumentadoFixture(): FixtureSpec {
  const commits: CommitSpec[] = [
    {
      message: "init: base instrumentada",
      files: {
        "package.json": PKG_FULL,
        "CLAUDE.md": SPECIFIC_GUIDE,
        ".github/workflows/ci.yml": CI_FULL,
        ".editorconfig": "root = true\n",
        "specs/feature.md": "# Especificação inicial",
        "src/index.ts": "export const x = 1;",
      },
      author: { name: "Ana", email: "ana@x.co" },
    },
    ...Array.from({ length: 6 }, (_, i) => ({
      message: `feat ${i}`,
      files: { [`src/mod${i}.ts`]: `export const v${i} = ${i};`, [`specs/mod${i}.md`]: `# spec ${i}` },
      author: i % 2 === 0 ? { name: "Ana", email: "ana@x.co" } : { name: "Bibi", email: "bibi@x.co" },
    })),
  ];
  return { commits };
}

// ── Regulado: loop fechado — guardrails, memória, specs acompanham ──────────
function reguladoFixture(): FixtureSpec {
  const base: CommitSpec = {
    message: "init: base regulada",
    files: {
      "package.json": PKG_FULL,
      "CLAUDE.md": SPECIFIC_GUIDE,
      ".github/workflows/ci.yml": CI_FULL,
      ".editorconfig": "root = true\n",
      ".dependency-cruiser.js": "module.exports = { forbidden: [] };",
      "specs/feature.md": "# Especificação",
      "docs/adr/0001-arq.md": "# ADR 1: arquitetura",
      "docs/adr/0002-db.md": "# ADR 2: banco",
      ".devcontainer/devcontainer.json": "{}",
      "CODEOWNERS": "* @time",
      ".github/pull_request_template.md": "## O quê\n## Por quê",
      ".gitleaks.toml": "[allowlist]",
      ".gitignore": ".env\nnode_modules/\n",
      // D7: secret scanner (gitleaks) + supply chain (lockfile) + SCA + política.
      "pnpm-lock.yaml": LOCKFILE,
      "SECURITY.md": SECURITY_MD,
      ".github/dependabot.yml": DEPENDABOT,
      "src/index.ts": "export const x = 1;",
    },
    author: { name: "Ana", email: "ana@x.co" },
  };
  const commits: CommitSpec[] = [
    base,
    ...Array.from({ length: 6 }, (_, i) => ({
      message: `feat ${i}`,
      files: { [`src/mod${i}.ts`]: `export const v${i} = ${i};`, [`specs/mod${i}.md`]: `# spec ${i}` },
      author: i % 2 === 0 ? { name: "Ana", email: "ana@x.co" } : { name: "Bibi", email: "bibi@x.co" },
      trailers: i % 2 === 0 ? CLAUDE : undefined,
    })),
  ];
  return { commits };
}

// ── Dirigido: itera no harness, permissões escopadas, tudo no talo ──────────
function dirigidoFixture(): FixtureSpec {
  const base: CommitSpec = {
    message: "init: base dirigida",
    files: {
      "package.json": PKG_FULL,
      "CLAUDE.md": SPECIFIC_GUIDE,
      ".github/workflows/ci.yml": CI_FULL,
      ".editorconfig": "root = true\n",
      ".dependency-cruiser.js": "module.exports = { forbidden: [] };",
      "specs/feature.md": "# Especificação",
      "docs/adr/0001-arq.md": "# ADR 1",
      "docs/adr/0002-db.md": "# ADR 2",
      ".devcontainer/devcontainer.json": "{}",
      "CODEOWNERS": "* @time",
      ".github/pull_request_template.md": "## O quê",
      ".gitleaks.toml": "[allowlist]",
      ".gitignore": ".env\nnode_modules/\n",
      ".claude/settings.json": JSON.stringify({
        permissions: { allow: ["Bash(pnpm test)", "Read(src/**)"], deny: ["Bash(rm)"] },
      }),
      // D7 completo: SAST (CodeQL em PR), SCA, secret scanner, lockfile, política.
      "pnpm-lock.yaml": LOCKFILE,
      "SECURITY.md": SECURITY_MD,
      ".github/dependabot.yml": DEPENDABOT,
      ".github/workflows/codeql.yml": CODEQL_WORKFLOW,
      "src/index.ts": "export const x = 1;",
    },
    author: { name: "Ana", email: "ana@x.co" },
  };
  const commits: CommitSpec[] = [base];
  // Feature de agente + spec, sem fix humano depois (6.1 baixa taxa).
  for (let i = 0; i < 5; i++) {
    commits.push({
      message: `feat: recurso ${i}`,
      files: { [`src/mod${i}.ts`]: `export const v${i} = ${i};`, [`specs/mod${i}.md`]: `# spec ${i}` },
      author: i % 2 === 0 ? { name: "Ana", email: "ana@x.co" } : { name: "Bibi", email: "bibi@x.co" },
      trailers: CLAUDE,
    });
  }
  // Rajada de fix seguida de iteração no harness (6.2 correlacionado).
  commits.push({ message: "fix: corrige borda", files: { "src/mod0.ts": "// fix" } });
  commits.push({
    message: "chore: reforça guia e sensor após o fix",
    files: { "CLAUDE.md": SPECIFIC_GUIDE + "\n## Aprendizado\nNão repita a borda.\n" },
    author: { name: "Ana", email: "ana@x.co" },
  });
  return { commits };
}

export const LEVEL_FIXTURES: LevelFixture[] = [
  { name: "Fé", band: "fe", profile: "built-by-ai", spec: feFixture(), answers: NO_ANSWERS },
  {
    name: "Improviso",
    band: "improviso",
    profile: "built-by-ai",
    spec: improvisoFixture(),
    answers: NO_ANSWERS,
  },
  {
    name: "Instrumentado",
    band: "instrumentado",
    profile: "built-by-ai",
    spec: instrumentadoFixture(),
    answers: { answered: true, sensorsBlockMerge: "inform" },
  },
  {
    name: "Regulado",
    band: "regulado",
    profile: "built-by-ai",
    spec: reguladoFixture(),
    answers: MEDIUM_ANSWERS,
  },
  {
    name: "Dirigido",
    band: "dirigido",
    profile: "built-by-ai",
    spec: dirigidoFixture(),
    answers: BEST_ANSWERS,
  },
];
