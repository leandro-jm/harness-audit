# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/).
Este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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
