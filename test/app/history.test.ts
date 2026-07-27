import { describe, it, expect, afterEach } from "vitest";
import { buildFixture, cleanupFixture, type FixtureSpec } from "../fixtures/build-fixture.js";
import { loadRepoContext } from "../../src/context/repo-context.js";
import { buildTrend, renderTrend } from "../../src/app/history.js";
import { setLang } from "../../src/i18n/index.js";

setLang("pt");

const created: string[] = [];
afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

function scoreJson(global: number, level: string): string {
  return JSON.stringify({ schemaVersion: "2.0.0", score: { global, level } });
}

async function ctxOf(spec: FixtureSpec) {
  const path = buildFixture(spec);
  created.push(path);
  return loadRepoContext({ path, lang: "pt", color: false, json: false, ci: false });
}

describe("--history (trend via git show)", () => {
  it("lê os harness-score.json commitados ao longo do tempo (oldest→newest)", async () => {
    const ctx = await ctxOf({
      commits: [
        { message: "score 1", files: { "harness-score.json": scoreJson(1.0, "improviso") }, dayOffset: 0 },
        { message: "score 2", files: { "harness-score.json": scoreJson(2.0, "instrumentado") }, dayOffset: 5 },
        { message: "score 3", files: { "harness-score.json": scoreJson(3.0, "regulado") }, dayOffset: 10 },
      ],
    });
    const trend = await buildTrend(ctx);
    expect(trend.map((p) => p.global)).toEqual([1.0, 2.0, 3.0]);
    expect(trend[0]!.date <= trend[2]!.date).toBe(true);

    const rendered = renderTrend(trend, 3.5);
    expect(rendered).toContain("EVOLUÇÃO DO HARNESS SCORE");
    expect(rendered).toContain("Atual");
  });

  it("sem score.json commitado → trend vazio", async () => {
    const ctx = await ctxOf({ commits: [{ message: "c0", files: { "src/a.ts": "export const a=1;" } }] });
    expect(await buildTrend(ctx)).toHaveLength(0);
  });
});
