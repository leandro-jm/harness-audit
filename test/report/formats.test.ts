import { describe, it, expect, afterEach } from "vitest";
import { buildFixture, cleanupFixture } from "../fixtures/build-fixture.js";
import { LEVEL_FIXTURES } from "../fixtures/levels.js";
import { loadRepoContext } from "../../src/context/repo-context.js";
import { runAudit } from "../../src/app/run-audit.js";
import { renderGithubAnnotations } from "../../src/report/annotations.js";
import { buildSarif } from "../../src/report/sarif.js";
import { setLang } from "../../src/i18n/index.js";

setLang("pt");

const created: string[] = [];
afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

async function auditImproviso() {
  const fx = LEVEL_FIXTURES.find((f) => f.name === "Improviso")!;
  const path = buildFixture(fx.spec);
  created.push(path);
  const ctx = await loadRepoContext({
    path,
    lang: "pt",
    color: false,
    json: false,
    ci: false,
    profile: fx.profile,
  });
  return runAudit(ctx);
}

describe("--format=github (anotações de PR)", () => {
  it("emite notice de score + warnings por lacuna, com escaping", async () => {
    const out = renderGithubAnnotations(await auditImproviso());
    const lines = out.split("\n");
    expect(lines[0]).toMatch(/^::notice title=Harness Score::/);
    expect(lines.slice(1).every((l) => l.startsWith("::warning "))).toBe(true);
    // Sem '%' cru no corpo (deve virar %25).
    expect(out.includes(" 11% ")).toBe(false);
  });
});

describe("--format=sarif", () => {
  it("produz SARIF 2.1.0 válido com rules e results", async () => {
    const sarif = buildSarif(await auditImproviso()) as {
      version: string;
      runs: Array<{ tool: { driver: { name: string; rules: unknown[] } }; results: unknown[] }>;
    };
    expect(sarif.version).toBe("2.1.0");
    const run = sarif.runs[0]!;
    expect(run.tool.driver.name).toBe("harness-audit");
    expect(run.results.length).toBeGreaterThan(0);
    // Toda regra referenciada existe no driver.rules.
    const ruleIds = new Set(run.tool.driver.rules.map((r) => (r as { id: string }).id));
    for (const res of run.results as Array<{ ruleId: string }>) {
      expect(ruleIds.has(res.ruleId)).toBe(true);
    }
    expect(() => JSON.parse(JSON.stringify(sarif))).not.toThrow();
  });
});
