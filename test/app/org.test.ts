import { describe, it, expect, afterEach } from "vitest";
import { buildFixture, cleanupFixture } from "../fixtures/build-fixture.js";
import { LEVEL_FIXTURES } from "../fixtures/levels.js";
import { auditRepos, buildOrgJson, renderOrgTable } from "../../src/app/org.js";
import { setLang } from "../../src/i18n/index.js";
import type { RunOptions } from "../../src/core/types.js";

setLang("pt");

const created: string[] = [];
afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

const OPTS: RunOptions = { path: ".", lang: "pt", color: false, json: false, ci: false };

describe("modo org", () => {
  it("audita vários repos e ranqueia por score (desc)", async () => {
    const fe = buildFixture(LEVEL_FIXTURES.find((f) => f.name === "Fé")!.spec);
    const dirigido = buildFixture(LEVEL_FIXTURES.find((f) => f.name === "Dirigido")!.spec);
    created.push(fe, dirigido);

    const rows = await auditRepos([fe, dirigido], OPTS);
    expect(rows).toHaveLength(2);
    // Ranqueado: o mais maduro primeiro.
    expect(rows[0]!.global).toBeGreaterThan(rows[1]!.global);
    expect(rows[0]!.path).toBe(dirigido);

    const json = buildOrgJson(rows, "2026-07-19T00:00:00.000Z");
    expect((json.summary as { repos: number }).repos).toBe(2);
    expect((json.repos as unknown[]).length).toBe(2);
    expect(() => JSON.parse(JSON.stringify(json))).not.toThrow();

    const table = renderOrgTable(rows);
    expect(table).toContain("HARNESS ORG · 2 repositórios");
    expect(table).toContain("Média:");
  });

  it("ignora diretórios que não são repo git", async () => {
    const fe = buildFixture(LEVEL_FIXTURES.find((f) => f.name === "Fé")!.spec);
    created.push(fe);
    const rows = await auditRepos([fe, "/definitivamente/nao/existe/aqui"], OPTS);
    expect(rows).toHaveLength(1);
  });
});
