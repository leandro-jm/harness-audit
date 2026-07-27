import { describe, it, expect, afterEach } from "vitest";
import { buildFixture, cleanupFixture } from "../fixtures/build-fixture.js";
import { LEVEL_FIXTURES } from "../fixtures/levels.js";
import { loadRepoContext } from "../../src/context/repo-context.js";
import { runAudit } from "../../src/app/run-audit.js";
import { buildScoreJson, serializeScoreJson } from "../../src/report/json.js";
import { setLang } from "../../src/i18n/index.js";
import type { RunOptions } from "../../src/core/types.js";

setLang("pt");

const created: string[] = [];
afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

describe("e2e — score por nível de maturidade", () => {
  for (const fixture of LEVEL_FIXTURES) {
    it(`${fixture.name} → nível ${fixture.band}`, async () => {
      const path = buildFixture(fixture.spec);
      created.push(path);

      const options: RunOptions = {
        path,
        lang: "pt",
        color: false,
        json: false,
        ci: false,
        profile: fixture.profile,
      };
      const ctx = await loadRepoContext(options);
      ctx.profile = fixture.profile;
      ctx.selfReport = fixture.answers;

      const { score } = await runAudit(ctx);
      expect(score.level, `${fixture.name} score=${score.global.toFixed(2)}`).toBe(fixture.band);
      expect(score.global).toBeGreaterThanOrEqual(0);
      expect(score.global).toBeLessThanOrEqual(4);
    });
  }

  it("progressão monotônica: Fé < Improviso < ... < Dirigido", async () => {
    const globals: number[] = [];
    for (const fixture of LEVEL_FIXTURES) {
      const path = buildFixture(fixture.spec);
      created.push(path);
      const ctx = await loadRepoContext({
        path,
        lang: "pt",
        color: false,
        json: false,
        ci: false,
        profile: fixture.profile,
      });
      ctx.profile = fixture.profile;
      ctx.selfReport = fixture.answers;
      globals.push((await runAudit(ctx)).score.global);
    }
    for (let i = 1; i < globals.length; i++) {
      expect(globals[i]!, `nível ${i} deve superar o anterior`).toBeGreaterThan(globals[i - 1]!);
    }
  });
});

describe("dogfood — auditoria do próprio repositório", () => {
  it("roda de ponta a ponta e produz saída válida", async () => {
    const ctx = await loadRepoContext({
      path: process.cwd(),
      lang: "pt",
      color: false,
      json: false,
      ci: false,
      profile: "built-by-ai",
    });
    ctx.profile = "built-by-ai";
    const audit = await runAudit(ctx);

    // 8 dimensões (D8 nula p/ built-by-ai), 33 checks executados, score válido.
    expect(audit.score.dimensions).toHaveLength(8);
    const totalChecks = audit.results.length;
    expect(totalChecks).toBe(33); // D8 só roda em uses-ai/both
    expect(audit.score.dimensions.find((d) => d.dimension === "D8")!.score).toBeNull();
    expect(audit.score.global).toBeGreaterThanOrEqual(0);
    expect(audit.score.global).toBeLessThanOrEqual(4);

    // A ferramenta detecta os próprios commits de agente (trailer Co-authored-by).
    const d6 = audit.results.filter((r) => r.dimension === "D6");
    const agentCheck = d6.find((r) => r.checkId === "6.1");
    expect(agentCheck).toBeDefined();

    // O JSON serializa e tem schemaVersion.
    const json = buildScoreJson(ctx, audit, "2026-07-14T00:00:00.000Z");
    const serialized = serializeScoreJson(json);
    expect(() => JSON.parse(serialized)).not.toThrow();
    expect(json.schemaVersion).toBe("2.0.0");
  });
});
