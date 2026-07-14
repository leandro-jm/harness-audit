import { describe, it, expect, afterEach } from "vitest";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildFixture, cleanupFixture } from "../fixtures/build-fixture.js";
import { loadRepoContext } from "../../src/context/repo-context.js";
import { runAudit } from "../../src/app/run-audit.js";
import {
  writeReports,
  missingGitignoreEntries,
  appendGitignore,
  REPORT_MD,
  REPORT_JSON,
} from "../../src/report/export.js";
import { buildScoreJson } from "../../src/report/json.js";
import { buildMarkdownReport } from "../../src/report/markdown.js";
import { setLang } from "../../src/i18n/index.js";
import type { RunOptions } from "../../src/core/types.js";

setLang("pt");

const created: string[] = [];
afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

async function auditFixture() {
  const path = buildFixture({
    commits: [
      {
        message: "init",
        files: {
          "package.json": JSON.stringify({ name: "x", scripts: { test: "vitest" } }),
          "CLAUDE.md": "# guia\nRode `pnpm test`. src/ tem o código.",
          "src/a.ts": "x",
          "specs/f.md": "# spec",
        },
      },
    ],
  });
  created.push(path);
  const options: RunOptions = {
    path,
    lang: "pt",
    color: false,
    json: false,
    ci: false,
    profile: "built-by-ai",
  };
  const ctx = await loadRepoContext(options);
  const audit = await runAudit(ctx);
  return { ctx, audit };
}

const DATE = new Date("2026-07-14T12:00:00Z");

describe("harness-score.json", () => {
  it("tem schemaVersion, 6 dimensões e checks", async () => {
    const { ctx, audit } = await auditFixture();
    const json = buildScoreJson(ctx, audit, DATE.toISOString());
    expect(json.schemaVersion).toBe("1.0.0");
    const score = json.score as { dimensions: unknown[] };
    expect(score.dimensions).toHaveLength(6);
    expect((json.tool as { name: string }).name).toBe("harness-audit");
    expect(Array.isArray(json.recommendations)).toBe(true);
  });
});

describe("HARNESS-REPORT.md", () => {
  it("contém as seções principais", async () => {
    const { ctx, audit } = await auditFixture();
    const md = buildMarkdownReport(ctx, audit, DATE);
    expect(md).toContain("# Harness Report");
    expect(md).toContain("## Resumo");
    expect(md).toContain("Harness Score");
    expect(md).toContain("## Detalhe por dimensão");
    expect(md).toContain("## Fontes conceituais");
    expect(md).toContain("somente leitura");
  });
});

describe("writeReports", () => {
  it("escreve só o que foi escolhido e devolve o snippet", async () => {
    const { ctx, audit } = await auditFixture();
    const res = writeReports(ctx, audit, ["json", "snippet"], DATE);
    expect(res.writtenFiles).toHaveLength(1);
    expect(existsSync(join(ctx.root, REPORT_JSON))).toBe(true);
    expect(existsSync(join(ctx.root, REPORT_MD))).toBe(false);
    expect(res.snippet).toContain("Harness Score");
  });

  it("nada é escrito quando não há escolha", async () => {
    const { ctx, audit } = await auditFixture();
    const res = writeReports(ctx, audit, [], DATE);
    expect(res.writtenFiles).toHaveLength(0);
    expect(existsSync(join(ctx.root, REPORT_JSON))).toBe(false);
  });
});

describe(".gitignore", () => {
  it("detecta ausência e acrescenta os relatórios", async () => {
    const { ctx } = await auditFixture();
    writeFileSync(join(ctx.root, ".gitignore"), "node_modules/\n");
    const missing = missingGitignoreEntries(ctx.root, [REPORT_MD, REPORT_JSON]);
    expect(missing).toEqual([REPORT_MD, REPORT_JSON]);

    appendGitignore(ctx.root, missing);
    const content = readFileSync(join(ctx.root, ".gitignore"), "utf8");
    expect(content).toContain(REPORT_MD);
    expect(content).toContain(REPORT_JSON);
    // idempotente: agora não falta nada
    expect(missingGitignoreEntries(ctx.root, [REPORT_MD, REPORT_JSON])).toEqual([]);
  });
});
