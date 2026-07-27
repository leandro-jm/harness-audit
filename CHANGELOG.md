# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/).
Este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

Fecha o roadmap v0.2 e adianta itens da v1.0. `harness-score.json` sobe para
`schemaVersion` **2.0.0** (D7 muda a média de 6→7 dimensões; baselines 1.x não são
diretamente comparáveis).

### Adicionado

- **D7 · Segurança (DevSecOps)** — 7 checks estáticos (SAST, SCA/deps, secret
  scanning, supply chain, política de vuln, sensores bloqueiam PR, vuln vira regra),
  ancorados em OWASP DSOMM e NIST SSDF. Cross-perfil. "Detecta o sensor, não o roda."
- **D8 · Runtime harness** (perfis `uses-ai`/`both`) — evals de LLM, prompts
  versionados, observabilidade/custo e guardrails de tool use (detecção estática).
- **Gate de CI**: `--ci`, `--gate`, `--min <n>` (exit 1 abaixo do limiar).
- **Modo org**: `harness-audit org <caminhos|glob>` ranqueia vários repos locais.
- **Comparação local** `--baseline <file>` e **tendência** `--history` (via `git show`,
  zero checkout).
- **Saídas de máquina**: `--format github` (anotações de PR) e `--format sarif`
  (code scanning). **Badge**: `--badge` → `harness-badge.svg` commitável.
- **`--github`**: branch protection vira evidência (via `gh`, opt-in — única exceção
  ao zero-rede; degrada para autorrelato).
- **Stack Python** de primeira classe (pytest/ruff/mypy, lockfiles, guia específico).
- **en-US** completo (`--lang en`) e **pesos por perfil** no score.
- **Config de projeto** `.harnessrc.json` (defaults de flag; não altera pontos).
- **Cobertura de testes** com gate (`test:coverage`), matriz de Node (20/22/24) e
  workflow de release/publish npm; Dependabot.
- 112 testes (era 48), incluindo testes de fronteira dos checks antes só cobertos
  indiretamente.

## [0.1.0] — 2026-07-14

MVP: fluxo interativo completo de auditoria de harness.

### Adicionado

- **Wizard interativo** (`@clack/prompts`): detecção de repo/stack/CI, confirmação
  de stack, perfil, progresso por dimensão e até 6 perguntas de autorrelato.
- **26 checks** nas 6 dimensões (D1 Especificação, D2 Guias, D3 Sensores,
  D4 Guardrails, D5 Memória, D6 Steering), com selo de origem
  `[evidência]`/`[proxy]`/`[autorrelato]`.
- **Harness Score (0–4)** com níveis Fé/Improviso/Instrumentado/Regulado/Dirigido,
  confiança baseada em evidência e top-3 lacunas com recomendações rastreáveis.
- **Detecção**: git (histórico via `simple-git`), stack JS/TS, GitHub Actions
  (parse completo do gatilho `pull_request` e sensores lint/type/test).
- **Saídas**: relatório de terminal, `HARNESS-REPORT.md`, `harness-score.json`
  (com `schemaVersion`) e snippet de compartilhamento.
- **Flags**: `--path`, `--profile`, `--json`, `--out`, `--no-color`, `--version`, `--help`.
- **Privacidade**: zero rede, somente leitura, nunca executa código do repo auditado;
  nada é escrito sem consentimento.
- i18n em pt-BR (arquitetura pronta para en-US na v0.2).
- 48 testes: engine, checks difíceis, orquestração e 5 fixtures por nível + dogfood.

### Não incluído (roadmap)

- v0.2: `--ci`, `--gate`, badge, `--github` (branch protection), en-US, Python.
- v1.0: trilha de runtime harness, modo org multi-repo, comparação histórica.
