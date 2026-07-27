import { describe, it, expect, afterEach } from "vitest";
import { buildFixture, cleanupFixture, type FixtureSpec } from "../fixtures/build-fixture.js";
import { loadRepoContext } from "../../src/context/repo-context.js";
import { runAudit } from "../../src/app/run-audit.js";
import { relevantQuestions } from "../../src/self-report/questions.js";
import type { RunOptions, Profile } from "../../src/core/types.js";
import type { SelfReportAnswers } from "../../src/self-report/types.js";

const created: string[] = [];
afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

function fixture(spec: FixtureSpec): string {
  const path = buildFixture(spec);
  created.push(path);
  return path;
}

async function audit(path: string, profile: Profile, selfReport?: SelfReportAnswers) {
  const options: RunOptions = { path, lang: "pt", color: false, json: false, ci: false, profile };
  const ctx = await loadRepoContext(options);
  ctx.profile = profile;
  if (selfReport) ctx.selfReport = selfReport;
  return { ctx, ...(await runAudit(ctx)) };
}

// Repo instrumentado: guia específico, CI com lint/type/test em PR, specs, ADRs.
function instrumentedRepo(): FixtureSpec {
  const pkg = JSON.stringify({
    name: "demo",
    scripts: { build: "tsup", test: "vitest", lint: "eslint ." },
    devDependencies: { "dependency-cruiser": "^16" },
  });
  const ci =
    "on: [pull_request]\njobs:\n  ci:\n    runs-on: ubuntu-latest\n    steps:\n" +
    "      - run: pnpm lint\n      - run: tsc --noEmit\n      - run: pnpm test\n";
  const guide = "# CLAUDE.md\nRode `pnpm build`, `pnpm test`, `pnpm lint`. Código em src/.";
  const commits = [
    {
      message: "init: base",
      files: {
        "package.json": pkg,
        "CLAUDE.md": guide,
        ".github/workflows/ci.yml": ci,
        "specs/feature.md": "# spec",
        "docs/adr/0001.md": "# ADR",
        "src/index.ts": "export const x = 1;",
        ".dependency-cruiser.js": "module.exports = {};",
      },
    },
    ...Array.from({ length: 5 }, (_, i) => ({
      message: `feat ${i}`,
      files: { [`src/m${i}.ts`]: "x", [`specs/m${i}.md`]: "s" },
      author: i % 2 === 0 ? { name: "A", email: "a@x.co" } : { name: "B", email: "b@x.co" },
    })),
  ];
  return { commits };
}

describe("e2e headless — orquestração completa", () => {
  it("respostas de autorrelato viram checks medidos e afetam o score/confiança", async () => {
    const answers: SelfReportAnswers = {
      answered: true,
      fixFirst: "guide-or-sensor",
      harnessOwner: "yes-backlog",
      sensorsBlockMerge: "block",
      learningsToGuide: "yes",
    };
    const { results, score } = await audit(fixture(instrumentedRepo()), "built-by-ai", answers);

    // Checks de autorrelato foram medidos (não N/A) porque houve resposta.
    const byId = new Map(results.map((r) => [r.checkId, r]));
    expect(byId.get("6.3")!.status).toBe("measured");
    expect(byId.get("6.4")!.status).toBe("measured");
    expect(byId.get("3.6")!.status).toBe("measured");

    // Repo bem instrumentado → pelo menos nível Instrumentado.
    expect(score.global).toBeGreaterThanOrEqual(2.0);
    // Mistura de evidência + autorrelato → confiança < 100%.
    expect(score.confidence).toBeLessThan(100);
    expect(score.confidence).toBeGreaterThan(0);
  });

  it("sem respostas de autorrelato, checks self-report saem do denominador", async () => {
    const { results } = await audit(fixture(instrumentedRepo()), "built-by-ai", {
      answered: false,
    });
    const byId = new Map(results.map((r) => [r.checkId, r]));
    // 6.3/6.4 sem resposta → not-applicable (fora do denominador, sem zero punitivo).
    expect(byId.get("6.3")!.status).toBe("not-applicable");
    expect(byId.get("6.4")!.status).toBe("not-applicable");
  });

  it("relevantQuestions respeita relevância e teto de 6", async () => {
    const options: RunOptions = {
      path: fixture(instrumentedRepo()),
      lang: "pt",
      color: false,
      json: false,
      ci: false,
      profile: "built-by-ai",
    };
    const ctx = await loadRepoContext(options);
    ctx.profile = "built-by-ai";
    const qs = relevantQuestions(ctx);
    expect(qs.length).toBeLessThanOrEqual(6);
    // AI + CI + guia + specs sem tasks + manifesto → +7.7 (única pergunta nova da D7).
    // Exatamente 6 — no teto de UX (§6.2), confirmando que a D7 cabe.
    expect(qs.map((q) => q.checkId).sort()).toEqual(["1.5", "3.6", "5.3", "6.3", "6.4", "7.7"]);
  });

  it("perfil conventional sem guia → 2.1/4.4 viram not-prepared, não zero", async () => {
    const spec: FixtureSpec = {
      commits: [
        { message: "init", files: { "src/index.ts": "x", "package.json": "{}" } },
        ...Array.from({ length: 5 }, (_, i) => ({
          message: `feat ${i}`,
          files: { [`src/m${i}.ts`]: "x" },
        })),
      ],
    };
    const { results } = await audit(fixture(spec), "conventional");
    const byId = new Map(results.map((r) => [r.checkId, r]));
    expect(byId.get("2.1")!.status).toBe("not-prepared");
    expect(byId.get("4.4")!.status).toBe("not-prepared");
  });
});
