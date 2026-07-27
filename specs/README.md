# Specs — harness-audit

Este projeto pratica **Spec-Driven Development**: a especificação vem antes do código.

## Fonte da verdade

A spec completa do produto é o PRD: [`../prd-harness-audit-cli.md`](../prd-harness-audit-cli.md).
Ele é a spec normativa — mudanças de comportamento passam primeiro por lá, e cada PR
referencia a seção que implementa.

## Mapa rápido (PRD → código)

| Seção do PRD | Onde vive |
|---|---|
| §7.4 Checks por dimensão | `src/checks/dN-*/` + `src/checks/registry.ts` |
| §7.5 Modelo de pontuação | `src/scoring/engine.ts`, `src/scoring/levels.ts` |
| §6 Experiência (wizard) | `src/app/wizard.ts` |
| §7.6 Saídas (relatórios) | `src/report/*` |
| §9 Arquitetura (RepoContext) | `src/context/*` |

## Roadmap

- **v0.1 (atual):** fluxo interativo, checks D1–D5 + proxies D6, JS/TS, GitHub Actions, pt-BR.
- **v0.2:** `--ci`, `--gate`, badge, `--github`, en-US, Python, **dimensão D7 (segurança/DevSecOps)**.
- **v1.0:** trilha de runtime harness, modo org multi-repo, comparação histórica.
