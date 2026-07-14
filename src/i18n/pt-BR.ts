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

  // Compartilhado (sensores dependentes de CI)
  "check.sensor.noCi": "Sem CI — não há onde hospedar o sensor",
  "check.sensor.notParsed": "CI {provider} não parseado por completo nesta versão",

  // D1 · Especificação
  "check.1.1.title": "Spec mora no repo",
  "check.1.1.found": "Spec encontrada: {file}",
  "check.1.1.none": "Nenhuma spec no repositório (specs/, spec.md, .speckit/…)",
  "check.1.1.loose": "Spec avulsa; falta um diretório estruturado (specs/)",
  "check.1.2.title": "Spec é versionada de verdade",
  "check.1.2.stats": "{commits} commits na spec, {authors} autor(es)",
  "check.1.2.weak": "Spec pouco versionada ({commits} commits, {authors} autor(es))",
  "check.1.2.noSpec": "Sem spec para versionar",
  "check.1.2.noHistory": "Histórico insuficiente para avaliar versionamento",
  "check.1.3.title": "Spec vem antes do código",
  "check.1.3.ratio": "{covered}/{srcCommits} commits de código tiveram spec antes ({pct}%)",
  "check.1.3.weak": "Só {pct}% das mudanças de código tiveram spec antes",
  "check.1.3.noSpec": "Sem spec para comparar ordem",
  "check.1.3.noHistory": "Histórico insuficiente para inferir ordem spec→código",
  "check.1.3.noSrcCommits": "Nenhum commit de código na janela analisada",
  "check.1.4.title": "Spec drift",
  "check.1.4.drift": "{drift}/{srcCommits} commits mudaram código sem tocar specs ({pct}%)",
  "check.1.4.summary": "Spec drift: {drift} dos últimos {srcCommits} commits mudaram código sem tocar specs",
  "check.1.4.noSpec": "Sem specs — drift não se aplica (ver 1.1)",
  "check.1.4.noHistory": "Histórico insuficiente para medir drift",
  "check.1.4.noSrcCommits": "Nenhum commit de código na janela analisada",
  "check.1.5.title": "Tarefas derivam da spec",
  "check.1.5.artifact": "Rastro de tarefas/plano: {file}",
  "check.1.5.unanswered": "Autorrelato não respondido",
  "check.1.5.answer.yes": "Time confirma: tarefas derivam da spec",
  "check.1.5.answer.partial": "Parcialmente: às vezes as tarefas derivam da spec",
  "check.1.5.answer.no": "Tarefas não derivam da spec",
  "check.1.5.weak": "Tarefas não derivam claramente da spec",

  // D2 · Guias
  "check.2.2.title": "Guia é específico, não template",
  "check.2.2.refs": "{refs} referências reais (scripts: {scripts}, dirs: {dirs})",
  "check.2.2.placeholder": "Contém placeholders de template não preenchidos",
  "check.2.2.weak": "Guia genérico — cita poucos scripts/diretórios reais do repo",
  "check.2.2.noGuide": "Sem guia para avaliar especificidade",
  "check.2.3.title": "Guia está fresco",
  "check.2.3.fresh": "Guia fresco ({commits} commits de código desde a última edição)",
  "check.2.3.attention": "Guia em atenção ({commits} commits de código desde a última edição)",
  "check.2.3.stale": "Guia estale ({commits} commits de código desde a última edição)",
  "check.2.3.summary": "Guia desatualizado: {commits} commits de código desde a última edição",
  "check.2.3.untracked": "Guia existe mas não está no histórico git",
  "check.2.3.noGuide": "Sem guia para avaliar frescor",
  "check.2.3.noHistory": "Histórico insuficiente para avaliar frescor",
  "check.2.4.title": "Regras de arquitetura/estilo declaradas",
  "check.2.4.style": "Config de estilo: {file}",
  "check.2.4.arch": "Config de arquitetura: {file}",
  "check.2.4.section": "Seção de convenção/arquitetura no guia",
  "check.2.4.none": "Sem regras de estilo ou arquitetura declaradas",
  "check.2.4.weak": "Regras de arquitetura/estilo parcialmente declaradas",

  // D3 · Sensores
  "check.3.2.title": "Sensor de estilo (lint)",
  "check.3.2.found": "Step de lint no CI",
  "check.3.2.none": "Sem sensor de lint no CI",
  "check.3.3.title": "Sensor de tipos (typecheck)",
  "check.3.3.found": "Step de typecheck no CI",
  "check.3.3.none": "Sem sensor de tipos no CI",
  "check.3.3.notTyped": "Stack não tipada — typecheck não se aplica",
  "check.3.4.title": "Sensor de comportamento (testes)",
  "check.3.4.found": "Step de testes no CI",
  "check.3.4.none": "Sem sensor de testes no CI",
  "check.3.5.title": "Sensor de arquitetura",
  "check.3.5.config": "Config de fronteiras: {file}",
  "check.3.5.dep": "Dependência de fronteiras: {dep}",
  "check.3.5.none": "Sem sensor de fronteiras de módulo (dependency-cruiser, boundaries…)",
  "check.3.6.title": "Sensores bloqueiam merge",
  "check.3.6.block": "Time confirma: sensores bloqueiam merge (branch protection)",
  "check.3.6.inform": "Sensores apenas informam, não bloqueiam merge",
  "check.3.6.noCi": "Sem CI — nada a bloquear",
  "check.3.6.unknown": "Bloqueio de merge não confirmado",

  // D4 · Guardrails
  "check.4.1.title": "Execução isolada disponível",
  "check.4.1.devcontainer": "Ambiente isolado declarado: {file}",
  "check.4.1.docker": "Container de dev: {file}",
  "check.4.1.none": "Sem execução isolada declarada (devcontainer, Dockerfile…)",
  "check.4.1.weak": "Isolamento parcial — considere um devcontainer",
  "check.4.2.title": "Higiene de segredos",
  "check.4.2.scanner": "Scanner de segredos: {file}",
  "check.4.2.envIgnored": ".env no .gitignore",
  "check.4.2.leak": "Possível segredo commitado em {file}",
  "check.4.2.none": "Sem scanner de segredos nem .env ignorado",
  "check.4.2.weak": "Higiene de segredos parcial",
  "check.4.3.title": "Revisão estruturada",
  "check.4.3.codeowners": "CODEOWNERS: {file}",
  "check.4.3.prTemplate": "Template de PR: {file}",
  "check.4.3.none": "Sem CODEOWNERS nem template de PR",
  "check.4.3.weak": "Revisão estruturada parcial",
  "check.4.4.title": "Permissões de agente escopadas",
  "check.4.4.found": "Config de permissão de agente: {file}",
  "check.4.4.broad": "Permissões de agente amplas (sem allowlist específica)",
  "check.4.4.none": "Sem configuração de permissões de agente",
  "check.4.4.notPrepared": "Sem permissões de agente — a preparar para receber agentes",

  // D5 · Memória
  "check.5.1.title": "Memória procedural viva",
  "check.5.1.fresh": "Guia vivo e fresco ({commits} commits desde a última edição)",
  "check.5.1.attention": "Guia em atenção ({commits} commits desde a última edição)",
  "check.5.1.untracked": "Guia existe mas não está no histórico git",
  "check.5.1.stale": "Guia estale ({commits} commits desde a última edição)",
  "check.5.1.summary": "Memória procedural envelhecendo ({commits} commits desde a última edição do guia)",
  "check.5.1.noGuide": "Sem guia — memória procedural ausente",
  "check.5.1.notPrepared": "Sem guia — a preparar memória procedural para agentes",
  "check.5.2.title": "Memória semântica de decisões",
  "check.5.2.found": "Registro de decisão: {file}",
  "check.5.2.none": "Sem ADRs/registros de decisão de arquitetura",
  "check.5.2.weak": "Poucos registros de decisão",
  "check.5.3.title": "Aprendizados voltam pro guia",
  "check.5.3.yes": "Time confirma: erro novo vira regra nova",
  "check.5.3.sometimes": "Às vezes o aprendizado volta pro guia",
  "check.5.3.no": "Aprendizados não voltam pro guia",
  "check.5.3.unanswered": "Autorrelato não respondido",
  "check.5.3.weak": "Aprendizados nem sempre voltam pro guia",

  // D6 · Steering
  "check.6.1.title": "Correção manual crônica",
  "check.6.1.rate": "{followUps}/{agents} commits de agente seguidos de fix humano ({pct}%)",
  "check.6.1.summary": "Correção manual em {pct}% dos commits de agente",
  "check.6.1.noHistory": "Histórico insuficiente para o proxy de steering",
  "check.6.1.noAgent": "Nenhum commit de agente detectado — proxy não aplicável",
  "check.6.1.noAgentConventional": "Nenhum commit de agente — a preparar para receber agentes",
  "check.6.2.title": "Time itera no harness",
  "check.6.2.correlated": "Edições de harness correlacionadas a fixes ({edits} edições)",
  "check.6.2.edits": "Harness editado {edits}x, sem correlação clara com fixes",
  "check.6.2.none": "Sem edições no harness (guia/rules/CI) na janela",
  "check.6.2.weak": "Harness raramente iterado a partir de fixes",
  "check.6.3.title": "Pergunta-assinatura (conserto primeiro)",
  "check.6.3.code": "Time conserta o código na mão primeiro",
  "check.6.3.prompt": "Time conserta o prompt daquela vez primeiro",
  "check.6.3.guide-or-sensor": "Time conserta o guia ou o sensor primeiro",
  "check.6.3.unanswered": "Autorrelato não respondido",
  "check.6.3.weak": "Conserto ainda não fecha no guia/sensor",
  "check.6.4.title": "Harness tem dono",
  "check.6.4.yes-backlog": "Harness tem dono com backlog",
  "check.6.4.informal": "Harness cuidado informalmente",
  "check.6.4.none": "Ninguém responsável pelo harness",
  "check.6.4.unanswered": "Autorrelato não respondido",
  "check.6.4.weak": "Harness sem dono claro com backlog",
};
