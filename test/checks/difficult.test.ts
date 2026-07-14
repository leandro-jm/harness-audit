import { describe, it, expect, afterEach } from "vitest";
import { buildFixture, cleanupFixture, CLAUDE_TRAILER } from "../fixtures/build-fixture.js";
import { loadRepoContext, type RepoContext } from "../../src/context/repo-context.js";
import type { RunOptions } from "../../src/core/types.js";
import { check14 } from "../../src/checks/d1-spec/1.4.js";
import { check22 } from "../../src/checks/d2-guides/2.2.js";
import { check23 } from "../../src/checks/d2-guides/2.3.js";
import { check61 } from "../../src/checks/d6-steering/6.1.js";

const created: string[] = [];

function fixture(commits: Parameters<typeof buildFixture>[0]["commits"]): string {
  const path = buildFixture({ commits });
  created.push(path);
  return path;
}

function ctxFor(path: string): Promise<RepoContext> {
  const options: RunOptions = {
    path,
    lang: "pt",
    color: false,
    json: false,
    ci: false,
    profile: "built-by-ai",
  };
  return loadRepoContext(options);
}

afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

describe("1.4 · spec drift", () => {
  it("alto drift (código sem tocar specs) → 0 pontos", async () => {
    const commits = [
      { message: "feat: base", files: { "specs/f.md": "spec", "src/a.ts": "a" } },
      ...Array.from({ length: 8 }, (_, i) => ({
        message: `feat: mod ${i}`,
        files: { [`src/mod${i}.ts`]: `code ${i}` },
      })),
    ];
    const ctx = await ctxFor(fixture(commits));
    const r = await check14.run(ctx);
    expect(r.status).toBe("measured");
    expect(r.points).toBe(0);
  });

  it("sem drift (specs acompanham código) → 2 pontos", async () => {
    const commits = Array.from({ length: 9 }, (_, i) => ({
      message: `feat: mod ${i}`,
      files: { [`src/mod${i}.ts`]: `code ${i}`, [`specs/mod${i}.md`]: `spec ${i}` },
    }));
    const ctx = await ctxFor(fixture(commits));
    const r = await check14.run(ctx);
    expect(r.points).toBe(2);
  });

  it("sem specs → not-applicable (não penaliza duas vezes)", async () => {
    const commits = Array.from({ length: 6 }, (_, i) => ({
      message: `feat ${i}`,
      files: { [`src/mod${i}.ts`]: `code ${i}` },
    }));
    const ctx = await ctxFor(fixture(commits));
    const r = await check14.run(ctx);
    expect(r.status).toBe("not-applicable");
  });
});

describe("6.1 · correção manual crônica", () => {
  it("todo commit de agente seguido de fix humano → 0 pontos", async () => {
    const commits = [];
    for (let i = 0; i < 3; i++) {
      commits.push({
        message: `feat: recurso ${i}`,
        files: { [`src/f${i}.ts`]: "v1" },
        trailers: CLAUDE_TRAILER,
      });
      commits.push({
        message: `fix: corrige recurso ${i}`,
        files: { [`src/f${i}.ts`]: "v2-corrigido" },
      });
    }
    const ctx = await ctxFor(fixture(commits));
    const r = await check61.run(ctx);
    expect(r.status).toBe("measured");
    expect(r.points).toBe(0);
  });

  it("commits de agente sem fixes → 2 pontos", async () => {
    const commits = [];
    for (let i = 0; i < 3; i++) {
      commits.push({
        message: `feat: recurso ${i}`,
        files: { [`src/f${i}.ts`]: "v1" },
        trailers: CLAUDE_TRAILER,
      });
      commits.push({ message: `docs: nota ${i}`, files: { [`docs/n${i}.md`]: "ok" } });
    }
    const ctx = await ctxFor(fixture(commits));
    const r = await check61.run(ctx);
    expect(r.points).toBe(2);
  });

  it("sem commits de agente → not-applicable", async () => {
    const commits = Array.from({ length: 6 }, (_, i) => ({
      message: `feat ${i}`,
      files: { [`src/mod${i}.ts`]: "x" },
    }));
    const ctx = await ctxFor(fixture(commits));
    const r = await check61.run(ctx);
    expect(r.status).toBe("not-applicable");
  });
});

describe("2.3 · frescor do guia", () => {
  it("guia editado por último → fresco (2)", async () => {
    const commits = [
      ...Array.from({ length: 6 }, (_, i) => ({
        message: `feat ${i}`,
        files: { [`src/m${i}.ts`]: "x" },
      })),
      { message: "docs: guia", files: { "CLAUDE.md": "# guia" } },
    ];
    const ctx = await ctxFor(fixture(commits));
    const r = await check23.run(ctx);
    expect(r.points).toBe(2);
  });

  it("15 commits de código após o guia → atenção (1)", async () => {
    const commits = [
      { message: "docs: guia", files: { "CLAUDE.md": "# guia", "src/base.ts": "x" } },
      ...Array.from({ length: 15 }, (_, i) => ({
        message: `feat ${i}`,
        files: { [`src/m${i}.ts`]: "x" },
      })),
    ];
    const ctx = await ctxFor(fixture(commits));
    const r = await check23.run(ctx);
    expect(r.points).toBe(1);
  });
});

describe("2.2 · guia específico vs template", () => {
  it("guia citando scripts e dirs reais → 2", async () => {
    const pkg = JSON.stringify({
      name: "x",
      scripts: { build: "tsup", test: "vitest", lint: "eslint ." },
    });
    const guide = "# Guia\nRode `pnpm build`, `pnpm test`. Código em src/. Veja pnpm lint.";
    const ctx = await ctxFor(
      fixture([{ message: "init", files: { "package.json": pkg, "CLAUDE.md": guide, "src/a.ts": "x" } }]),
    );
    const r = await check22.run(ctx);
    expect(r.points).toBe(2);
  });

  it("guia genérico com placeholder → 0", async () => {
    const pkg = JSON.stringify({ name: "x", scripts: { build: "tsup" } });
    const guide = "# Guia\nEste projeto usa TypeScript. Replace <your-project-name> aqui.";
    const ctx = await ctxFor(
      fixture([{ message: "init", files: { "package.json": pkg, "CLAUDE.md": guide, "src/a.ts": "x" } }]),
    );
    const r = await check22.run(ctx);
    expect(r.points).toBe(0);
  });
});
