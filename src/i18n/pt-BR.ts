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

  // Dimensões
  "dim.D1": "Especificação",
  "dim.D2": "Guias",
  "dim.D3": "Sensores",
  "dim.D4": "Guardrails",
  "dim.D5": "Memória",
  "dim.D6": "Steering",

  // Selos de origem
  "seal.evidencia": "evidência",
  "seal.proxy": "proxy",
  "seal.autorrelato": "autorrelato",

  // Níveis de maturidade
  "level.fe": "Fé",
  "level.improviso": "Improviso",
  "level.instrumentado": "Instrumentado",
  "level.regulado": "Regulado",
  "level.dirigido": "Dirigido",

  // Relatório (terminal + arquivos)
  "report.scoreLabel": "HARNESS SCORE",
  "report.level": "Nível",
  "report.confidence": "Confiança: {pct} do score baseado em evidência",
  "report.topGaps": "TOP {n} LACUNAS",
  "report.noGaps": "Sem lacunas priorizadas — harness sólido.",
  "report.dimNa": "n/d",

  // Fontes conceituais (rastreabilidade, Apêndice B)
  "source.bockeler": "Böckeler · Harness Engineering (Thoughtworks)",
  "source.coala": "CoALA · taxonomia de memória de agente",
  "source.sdd": "Spec-Driven Development (Spec Kit / Kiro / OpenSpec)",
  "source.harness": "Série Harness Engineering",

  // Recomendações (rec.<checkId>)
  "rec.2.1":
    "Adicione um guia de agente (CLAUDE.md/AGENTS.md) citando scripts e diretórios reais do repositório.",
  "rec.3.1":
    "Configure CI que rode em pull_request (lint, tipos e testes) como sensor a cada mudança.",

  // Check 2.1 — guia de agente existe
  "check.2.1.title": "Guia de agente existe",
  "check.2.1.found": "Guia encontrado: {file}",
  "check.2.1.none": "Nenhum guia de agente (CLAUDE.md, AGENTS.md, .cursor/rules…)",
  "check.2.1.partial": "Só regras auxiliares; falta um guia principal (CLAUDE.md/AGENTS.md)",
  "check.2.1.notPrepared": "Sem guia de agente — a preparar para receber agentes",

  // Check 3.1 — CI existe e roda em PR
  "check.3.1.title": "CI existe e roda em PR",
  "check.3.1.noCi": "Nenhum CI detectado (sem workflows/pipelines)",
  "check.3.1.onPr": "Workflow roda em pull_request: {file}",
  "check.3.1.noPrTrigger": "CI existe mas não dispara em pull_request",
  "check.3.1.detectedNotParsed": "CI {provider} detectado; gatilho de PR não verificado nesta versão",
};
