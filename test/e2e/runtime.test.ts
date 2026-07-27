import { describe, it, expect, afterEach } from "vitest";
import { buildFixture, cleanupFixture, type FixtureSpec } from "../fixtures/build-fixture.js";
import { loadRepoContext } from "../../src/context/repo-context.js";
import { runAudit } from "../../src/app/run-audit.js";
import type { Profile } from "../../src/core/types.js";
import { setLang } from "../../src/i18n/index.js";

setLang("pt");

const created: string[] = [];
afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

async function auditProfile(files: Record<string, string>, profile: Profile) {
  const spec: FixtureSpec = { commits: [{ message: "init", files }] };
  const path = buildFixture(spec);
  created.push(path);
  const ctx = await loadRepoContext({
    path,
    lang: "pt",
    color: false,
    json: false,
    ci: false,
    profile,
  });
  ctx.profile = profile;
  return runAudit(ctx);
}

describe("D8 · trilha de runtime harness (uses-ai)", () => {
  it("built-by-ai NÃO roda D8 (dimensão nula)", async () => {
    const { results, score } = await auditProfile({ "package.json": "{}" }, "built-by-ai");
    expect(results.some((r) => r.dimension === "D8")).toBe(false);
    expect(score.dimensions.find((d) => d.dimension === "D8")!.score).toBeNull();
  });

  it("uses-ai com harness de runtime completo → D8 alto", async () => {
    const pkg = JSON.stringify({
      dependencies: { openai: "^4", langfuse: "^3", "guardrails-ai": "^0.5" },
    });
    const { results } = await auditProfile(
      {
        "package.json": pkg,
        "promptfooconfig.yaml": "prompts: [./prompts/x.txt]\n",
        "prompts/x.txt": "You are helpful.",
      },
      "uses-ai",
    );
    const by = (id: string) => results.find((r) => r.checkId === id)!;
    expect(by("8.1").points).toBe(2); // evals configuradas
    expect(by("8.2").points).toBe(2); // prompts versionados
    expect(by("8.3").points).toBe(2); // langfuse
    expect(by("8.4").points).toBe(2); // guardrails-ai
  });

  it("uses-ai sem nada de runtime → D8 medido em 0 (lacuna honesta, não N/A)", async () => {
    const { results } = await auditProfile({ "package.json": "{}" }, "uses-ai");
    const d8 = results.filter((r) => r.dimension === "D8");
    expect(d8).toHaveLength(4);
    expect(d8.every((r) => r.status === "measured" && r.points === 0)).toBe(true);
  });
});
