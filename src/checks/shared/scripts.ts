import type { RepoContext } from "../../context/repo-context.js";

/**
 * Nomes de "scripts"/alvos do projeto, agnóstico de stack — para o check de
 * especificidade do guia (2.2) funcionar além de JS/TS. Coleta de:
 *   - `scripts` do package.json (JS/TS)
 *   - alvos de Makefile
 *   - `[project.scripts]` / `[tool.poetry.scripts]` do pyproject.toml (Python)
 */
export function projectScripts(ctx: RepoContext): string[] {
  const names = new Set<string>(Object.keys(ctx.pkg?.scripts ?? {}));

  const makefile = ctx.files.read("Makefile") ?? ctx.files.read("makefile") ?? "";
  for (const m of makefile.matchAll(/^([A-Za-z0-9][\w-]*):/gm)) {
    const target = m[1];
    if (target && target !== "PHONY") names.add(target);
  }

  const pyproject = ctx.files.read("pyproject.toml") ?? "";
  const sections = pyproject.match(/\[(?:project|tool\.poetry)\.scripts\]([\s\S]*?)(?=\n\[|$)/g) ?? [];
  for (const section of sections) {
    for (const m of section.matchAll(/^\s*["']?([A-Za-z0-9_-]+)["']?\s*=/gm)) {
      if (m[1]) names.add(m[1]);
    }
  }

  return [...names];
}
