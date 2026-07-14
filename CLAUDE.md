# CLAUDE.md — guia de agente do harness-audit

Guia para agentes de código trabalharem neste repositório. A ferramenta nasce
praticando o que audita (SDD + Harness Engineering).

## Fonte da verdade

O comportamento do produto é definido pela spec em [`prd-harness-audit-cli.md`](prd-harness-audit-cli.md)
e resumido em [`specs/README.md`](specs/README.md). Mudança de comportamento passa
primeiro pela spec; cada PR referencia a seção que implementa.

## Comandos

Gerenciador: **pnpm**.

- `pnpm dev` — roda o CLI no diretório atual (via tsx), sem build.
- `pnpm build` — bundle ESM em `dist/` (tsup, `dist/cli.js` com shebang).
- `pnpm typecheck` — `tsc --noEmit` (também é o sensor de tipos que auditamos).
- `pnpm test` — testes (vitest); `pnpm test:watch` no modo watch.
- `pnpm lint` — eslint; `pnpm format` — prettier.

Rode `pnpm typecheck && pnpm test && pnpm lint` antes de commitar.

## Arquitetura (camadas, sem ciclos)

O fluxo de dependência é unidirecional:

```
context/  →  checks/  →  scoring/  →  report/
                 ↑            ↑
            core/ (tipos)  ·  i18n/  ·  util/
```

- `src/context/` — carrega o `RepoContext` (git, arquivos, stack, CI). Somente leitura.
- `src/checks/` — um arquivo por check (`dN-.../<id>.ts`), contrato em `checks/types.ts`.
  Novos checks entram no `checks/registry.ts` sem tocar o core.
- `src/scoring/` — engine de score, níveis, lacunas.
- `src/report/` — terminal, markdown, json, snippet, export.
- `src/app/` — orquestração (wizard interativo, headless, run-audit).
- `src/i18n/` — toda string de UI passa por `t(key, params)`; nunca literais no fluxo.

## Convenções

- TypeScript ESM estrito (`"type": "module"`, imports com extensão `.js`).
- Zero rede, somente leitura no repo auditado, nunca executa código dele (ver `SECURITY.md`).
- Números em pt-BR ("2,3"); cor respeita `--no-color`/`NO_COLOR`.
- Cada check retorna `measured` / `not-applicable` / `not-prepared` — nunca zero punitivo.
- Testes usam fixtures git determinísticos (`test/fixtures/build-fixture.ts`).
