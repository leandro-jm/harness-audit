import { describe, it, expect, afterEach } from "vitest";
import { buildFixture, cleanupFixture, type FixtureSpec } from "../fixtures/build-fixture.js";
import { loadRepoContext } from "../../src/context/repo-context.js";
import { runChecks } from "../../src/app/run-checks.js";
import type { CheckResult } from "../../src/checks/types.js";
import type { SelfReportAnswers } from "../../src/self-report/types.js";
import { setLang } from "../../src/i18n/index.js";

setLang("pt");

const created: string[] = [];
afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

async function runD7(files: Record<string, string>, answers?: SelfReportAnswers) {
  const spec: FixtureSpec = { commits: [{ message: "init", files }] };
  const path = buildFixture(spec);
  created.push(path);
  const ctx = await loadRepoContext({
    path,
    lang: "pt",
    color: false,
    json: false,
    ci: false,
    profile: "built-by-ai",
  });
  if (answers) ctx.selfReport = answers;
  const results = await runChecks(ctx);
  const byId = new Map(results.map((r) => [r.checkId, r]));
  return (id: string): CheckResult => byId.get(id)!;
}

const CODEQL_PR =
  "name: CodeQL\non: [pull_request]\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n" +
  "      - uses: github/codeql-action/analyze@v3\n";

describe("D7 · 7.1 SAST", () => {
  it("workflow dedicado (CodeQL) → 2", async () => {
    const get = await runD7({ "package.json": "{}", ".github/workflows/codeql.yml": CODEQL_PR });
    expect(get("7.1").points).toBe(2);
  });
  it("só eslint-plugin-security → 1", async () => {
    const get = await runD7({
      "package.json": JSON.stringify({ devDependencies: { "eslint-plugin-security": "^3" } }),
    });
    expect(get("7.1").points).toBe(1);
  });
  it("nada → 0 medido (não N/A)", async () => {
    const get = await runD7({ "package.json": "{}" });
    const r = get("7.1");
    expect(r.status).toBe("measured");
    expect(r.points).toBe(0);
  });
});

describe("D7 · 7.2 SCA", () => {
  it("dependabot + audit no CI → 2", async () => {
    const ci =
      "on: [pull_request]\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm audit\n";
    const get = await runD7({
      "package.json": "{}",
      ".github/dependabot.yml": "version: 2\n",
      ".github/workflows/ci.yml": ci,
    });
    expect(get("7.2").points).toBe(2);
  });
  it("só dependabot → 1", async () => {
    const get = await runD7({ "package.json": "{}", ".github/dependabot.yml": "version: 2\n" });
    expect(get("7.2").points).toBe(1);
  });
  it("sem manifesto → N/A (fora do denominador)", async () => {
    const get = await runD7({ "src/a.ts": "export const a = 1;" });
    expect(get("7.2").status).toBe("not-applicable");
  });
});

describe("D7 · 7.4 supply chain", () => {
  it("lockfile + deps pinadas → 2", async () => {
    const get = await runD7({
      "package.json": JSON.stringify({ dependencies: { left: "^1.0.0" } }),
      "package-lock.json": "{}",
    });
    expect(get("7.4").points).toBe(2);
  });
  it("lockfile + dep por git (não pinada) → 1", async () => {
    const get = await runD7({
      "package.json": JSON.stringify({ dependencies: { x: "git+https://example.com/x.git" } }),
      "pnpm-lock.yaml": "lockfileVersion: '9.0'\n",
    });
    expect(get("7.4").points).toBe(1);
  });
  it("manifesto sem lockfile → 0", async () => {
    const get = await runD7({ "package.json": JSON.stringify({ dependencies: { left: "^1" } }) });
    expect(get("7.4").points).toBe(0);
  });
});

describe("D7 · 7.5 política de vuln", () => {
  it("SECURITY.md → 2", async () => {
    const get = await runD7({ "package.json": "{}", "SECURITY.md": "# Security" });
    expect(get("7.5").points).toBe(2);
  });
  it("sem SECURITY.md → 0 medido", async () => {
    const get = await runD7({ "package.json": "{}" });
    expect(get("7.5").points).toBe(0);
  });
});

describe("D7 · 7.6 sensores bloqueiam em PR", () => {
  it("sensor de segurança em PR + bloqueio → 2", async () => {
    const get = await runD7(
      { "package.json": "{}", ".github/workflows/codeql.yml": CODEQL_PR },
      { answered: true, sensorsBlockMerge: "block" },
    );
    expect(get("7.6").points).toBe(2);
  });
  it("sem sensor de segurança → N/A (não pune duas vezes)", async () => {
    const ci =
      "on: [pull_request]\njobs:\n  a:\n    runs-on: ubuntu-latest\n    steps:\n      - run: pnpm test\n";
    const get = await runD7(
      { "package.json": "{}", ".github/workflows/ci.yml": ci },
      { answered: true, sensorsBlockMerge: "block" },
    );
    expect(get("7.6").status).toBe("not-applicable");
  });
});

describe("D7 · 7.7 vuln vira regra (autorrelato)", () => {
  it("yes → 2, no → 0, ausente → N/A", async () => {
    const yes = await runD7({ "package.json": "{}" }, { answered: true, vulnToRule: "yes" });
    expect(yes("7.7").points).toBe(2);
    const no = await runD7({ "package.json": "{}" }, { answered: true, vulnToRule: "no" });
    expect(no("7.7").points).toBe(0);
    const none = await runD7({ "package.json": "{}" }, { answered: false });
    expect(none("7.7").status).toBe("not-applicable");
  });
});
