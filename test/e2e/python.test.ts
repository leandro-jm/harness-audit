import { describe, it, expect, afterEach } from "vitest";
import { buildFixture, cleanupFixture, type FixtureSpec } from "../fixtures/build-fixture.js";
import { loadRepoContext } from "../../src/context/repo-context.js";
import { runAudit } from "../../src/app/run-audit.js";
import { setLang } from "../../src/i18n/index.js";

setLang("pt");

const created: string[] = [];
afterEach(() => {
  while (created.length) cleanupFixture(created.pop()!);
});

const PY_CI =
  "name: CI\non: [pull_request]\njobs:\n  ci:\n    runs-on: ubuntu-latest\n    steps:\n" +
  "      - run: ruff check .\n      - run: mypy .\n      - run: pytest\n";

const PY_GUIDE =
  "# CLAUDE.md\n\n## Comandos\nRode `pytest`, `ruff check .`, `mypy .`.\n\n" +
  "## Arquitetura\nCódigo em src/. Veja as convenções.\n";

describe("e2e — repositório Python é suportado", () => {
  it("stack python não degrada; sensores e D7 são medidos", async () => {
    const spec: FixtureSpec = {
      commits: [
        {
          message: "init: projeto python",
          files: {
            "pyproject.toml":
              "[project]\nname = 'demo'\n\n[project.scripts]\ndemo = 'demo:main'\n",
            "poetry.lock": "# lock",
            "CLAUDE.md": PY_GUIDE,
            ".github/workflows/ci.yml": PY_CI,
            "SECURITY.md": "# Security",
            "src/demo.py": "def main():\n    return 1\n",
            ".gitignore": ".env\n",
          },
        },
      ],
    };
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

    expect(ctx.stack.primary).toBe("python");
    expect(ctx.stack.supported).toBe(true);
    expect(ctx.stack.packageManager).toBe("poetry");
    expect(ctx.notes.some((n) => n.kind === "stack-partial")).toBe(false);

    const { results } = await runAudit(ctx);
    const by = (id: string) => results.find((r) => r.checkId === id)!;

    // Sensores Python detectados no CI.
    expect(by("3.2").points).toBe(2); // ruff
    expect(by("3.3").points).toBe(2); // mypy (typecheck)
    expect(by("3.4").points).toBe(2); // pytest
    // Guia específico reconhece comandos Python (não é template).
    expect(by("2.2").points).toBeGreaterThanOrEqual(1);
    // D7 supply chain com lockfile Python.
    expect(by("7.4").points).toBeGreaterThanOrEqual(1);
    expect(by("7.5").points).toBe(2); // SECURITY.md
  });
});
