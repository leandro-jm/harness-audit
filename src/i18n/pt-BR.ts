import type { Messages } from "./index.js";

// Dicionário pt-BR. Cresce a cada milestone; en-US (v0.2) espelha estas chaves.
export const ptBR: Messages = {
  // Banner / cabeçalho
  "app.tagline": "Auditoria de SDD e Harness Engineering.",
  "app.privacy": "100% local · somente leitura · nenhum dado sai desta máquina.",

  // Detecção
  "detect.repo": "Repositório: {name} (git · {commits} commits · branch {branch})",
  "detect.noGit":
    "Nenhum repositório git encontrado em {path}. harness-audit precisa de um repositório git.",
  "detect.stack": "Stack detectada: {stack} ({pm}) · CI: {ci}",
  "detect.ci.github-actions": "GitHub Actions",
  "detect.ci.gitlab": "GitLab CI (parcial)",
  "detect.ci.azure": "Azure Pipelines (parcial)",
  "detect.ci.jenkins": "Jenkins (parcial)",
  "detect.ci.none": "nenhum",
  "detect.pm.unknown": "gerenciador desconhecido",

  // Notas de contexto
  "note.stackPartial": "checks parciais (stack {primary} não totalmente suportada nesta versão)",
  "note.shallowHistory":
    "histórico raso ({commits} commits) — checks de histórico ficam parciais",
  "note.noPackageJson": "sem package.json na raiz — cobertura JS/TS reduzida",
  "note.workspaces":
    "workspaces detectados — auditando a raiz; use --path para escopo por pacote",

  // Rótulos de linguagem
  "lang.ts": "TypeScript",
  "lang.js": "JavaScript",
  "lang.python": "Python",
  "lang.go": "Go",
  "lang.unknown": "não identificada",
};
