import { describe, it, expect, afterEach } from "vitest";
import { buildFixture, cleanupFixture, type FixtureSpec } from "../fixtures/build-fixture.js";
import { loadRepoContext } from "../../src/context/repo-context.js";
import { runChecks } from "../../src/app/run-checks.js";
import type { CheckResult } from "../../src/checks/types.js";
import type { Profile } from "../../src/core/types.js";
import type { SelfReportAnswers } from "../../src/self-report/types.js";
import { setLang } from "../../src/i18n/index.js";

setLang("pt");

const created: string[] = [];
afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

const CI_ON_PR =
  "on: [pull_request]\njobs:\n  ci:\n    runs-on: ubuntu-latest\n    steps:\n" +
  "      - run: pnpm lint\n      - run: tsc --noEmit\n      - run: pnpm test\n";

async function audit(
  files: Record<string, string>,
  opts: { profile?: Profile; answers?: SelfReportAnswers } = {},
) {
  const spec: FixtureSpec = { commits: [{ message: "init", files: { "src/a.ts": "export const a=1;", ...files } }] };
  const path = buildFixture(spec);
  created.push(path);
  const ctx = await loadRepoContext({
    path,
    lang: "pt",
    color: false,
    json: false,
    ci: false,
    profile: opts.profile ?? "built-by-ai",
  });
  ctx.profile = opts.profile ?? "built-by-ai";
  if (opts.answers) ctx.selfReport = opts.answers;
  const results = await runChecks(ctx);
  const by = new Map(results.map((r) => [r.checkId, r]));
  return (id: string): CheckResult => by.get(id)!;
}

describe("D1 · 1.1 spec no repo", () => {
  it("nenhuma → 0 · avulsa → 1 · diretório estruturado → 2", async () => {
    expect((await audit({}))("1.1").points).toBe(0);
    expect((await audit({ "spec.md": "# spec" }))("1.1").points).toBe(1);
    const g = await audit({ "specs/a.md": "# a", "specs/b.md": "# b" });
    expect(g("1.1").points).toBe(2);
  });
});

describe("D2 · 2.1 guia existe · 2.4 regras", () => {
  it("2.1: nenhum → 0 · só auxiliar → 1 · principal → 2", async () => {
    expect((await audit({}))("2.1").points).toBe(0);
    expect((await audit({ ".cursorrules": "x" }))("2.1").points).toBe(1);
    expect((await audit({ "CLAUDE.md": "# guia" }))("2.1").points).toBe(2);
  });
  it("2.4: nada → 0 · só estilo → 1 · estilo+arquitetura → 2", async () => {
    expect((await audit({}))("2.4").points).toBe(0);
    expect((await audit({ ".editorconfig": "root=true" }))("2.4").points).toBe(1);
    const both = await audit({ ".editorconfig": "root=true", ".dependency-cruiser.js": "module.exports={}" });
    expect(both("2.4").points).toBe(2);
  });
});

describe("D3 · sensores", () => {
  it("3.1: sem CI → 0 · CI sem PR → 1 · CI em PR → 2", async () => {
    expect((await audit({}))("3.1").points).toBe(0);
    const noPr = "on: [push]\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n";
    expect((await audit({ ".github/workflows/ci.yml": noPr }))("3.1").points).toBe(1);
    expect((await audit({ ".github/workflows/ci.yml": CI_ON_PR }))("3.1").points).toBe(2);
  });
  it("3.2/3.4 medem lint/test no CI; sem CI → N/A", async () => {
    const g = await audit({ ".github/workflows/ci.yml": CI_ON_PR });
    expect(g("3.2").points).toBe(2);
    expect(g("3.4").points).toBe(2);
    expect((await audit({}))("3.2").status).toBe("not-applicable");
  });
  it("3.5: config de fronteiras → 2 · nada → 0", async () => {
    expect((await audit({ ".dependency-cruiser.js": "module.exports={}" }))("3.5").points).toBe(2);
    expect((await audit({}))("3.5").points).toBe(0);
  });
  it("3.6 autorrelato: block → 2 · inform → 1 (com CI)", async () => {
    const files = { ".github/workflows/ci.yml": CI_ON_PR };
    expect((await audit(files, { answers: { answered: true, sensorsBlockMerge: "block" } }))("3.6").points).toBe(2);
    expect((await audit(files, { answers: { answered: true, sensorsBlockMerge: "inform" } }))("3.6").points).toBe(1);
  });
});

describe("D4 · guardrails", () => {
  it("4.1: devcontainer → 2 · só Dockerfile → 1 · nada → 0", async () => {
    expect((await audit({ ".devcontainer/devcontainer.json": "{}" }))("4.1").points).toBe(2);
    expect((await audit({ Dockerfile: "FROM node" }))("4.1").points).toBe(1);
    expect((await audit({}))("4.1").points).toBe(0);
  });
  it("4.3: CODEOWNERS+PR template → 2 · um → 1 · nada → 0", async () => {
    const both = await audit({ CODEOWNERS: "* @t", ".github/pull_request_template.md": "## O quê" });
    expect(both("4.3").points).toBe(2);
    expect((await audit({ CODEOWNERS: "* @t" }))("4.3").points).toBe(1);
    expect((await audit({}))("4.3").points).toBe(0);
  });
  it("4.4: allowlist → 2 · convencional sem config → not-prepared", async () => {
    const allow = await audit({
      ".claude/settings.json": JSON.stringify({ permissions: { allow: ["Bash(pnpm test)"] } }),
    });
    expect(allow("4.4").points).toBe(2);
    expect((await audit({}, { profile: "conventional" }))("4.4").status).toBe("not-prepared");
  });
});

describe("D5 · memória", () => {
  it("5.2: ≥2 ADRs → 2 · 1 → 1 · nada → 0", async () => {
    const two = await audit({ "docs/adr/0001.md": "# 1", "docs/adr/0002.md": "# 2" });
    expect(two("5.2").points).toBe(2);
    expect((await audit({ "docs/adr/0001.md": "# 1" }))("5.2").points).toBe(1);
    expect((await audit({}))("5.2").points).toBe(0);
  });
  it("5.3 autorrelato: yes → 2 · no → 0 (com guia)", async () => {
    const files = { "CLAUDE.md": "# guia" };
    expect((await audit(files, { answers: { answered: true, learningsToGuide: "yes" } }))("5.3").points).toBe(2);
    expect((await audit(files, { answers: { answered: true, learningsToGuide: "no" } }))("5.3").points).toBe(0);
  });
});

describe("D6 · steering autorrelato", () => {
  it("6.3: guia-ou-sensor → 2 · código → 0", async () => {
    expect((await audit({}, { answers: { answered: true, fixFirst: "guide-or-sensor" } }))("6.3").points).toBe(2);
    expect((await audit({}, { answers: { answered: true, fixFirst: "code" } }))("6.3").points).toBe(0);
  });
  it("6.4: yes-backlog → 2 · none → 0", async () => {
    expect((await audit({}, { answers: { answered: true, harnessOwner: "yes-backlog" } }))("6.4").points).toBe(2);
    expect((await audit({}, { answers: { answered: true, harnessOwner: "none" } }))("6.4").points).toBe(0);
  });
});
