# harness-audit

**CLI interativo de auditoria de SDD e Harness Engineering.** 100% local · somente leitura · nenhum dado sai da sua máquina.

`harness-audit` responde a uma pergunta que hoje ninguém responde com evidência: **"este repositório está equipado para agentes de IA trabalharem nele com segurança e qualidade?"**

Ele lê o repositório (arquivos, histórico do git, configuração de CI), roda checks objetivos nas 6 dimensões de um harness, complementa com poucas perguntas interativas, e devolve um **Harness Score (0 a 4)** com nível de maturidade, lacunas priorizadas e recomendações rastreáveis.

> **Princípio central:** o repo não mente; o processo declarado, sim. Evidência vem primeiro; autorrelato existe, mas sempre rotulado.

## Como rodar em um projeto

O `harness-audit` audita **o diretório atual** por padrão, ou o diretório passado em `--path`. O projeto-alvo precisa ser um repositório git.

### Depois de publicado (npm)

```bash
cd /caminho/do/projeto
npx harness-audit
```

### Durante o desenvolvimento (deste repositório)

```bash
# opção A — apontar para outro projeto sem instalar
pnpm build
node dist/cli.js --path /caminho/do/projeto

# opção B — instalar como comando global local (mais fiel ao produto)
pnpm build
pnpm link --global
cd /caminho/do/projeto
harness-audit
```

## Uso

```bash
harness-audit                       # wizard interativo
harness-audit --ci --gate --min 2   # gate de CI (exit 1 se score < mínimo)
harness-audit org ./repos/*         # ranqueia vários repositórios locais
harness-audit checks [id]           # lista/detalha os checks e suas fontes
```

## Flags

| Flag | Função |
|---|---|
| `--path <dir>` | Auditar subdiretório (monorepo) |
| `--profile <built-by-ai\|uses-ai\|both\|conventional>` | Pular a pergunta de perfil |
| `--ci` | Headless, sem prompts (pipelines) |
| `--gate` / `--min <n>` | Falha (exit 1) se o score global < mínimo (default 2,0) |
| `--baseline <file>` | Comparar com um `harness-score.json` anterior (local) |
| `--history` | Evolução do score pelos `harness-score.json` commitados |
| `--format <terminal\|github\|sarif>` | Saída de máquina (anotações de PR / code scanning) |
| `--badge` | Gerar `harness-badge.svg` commitável |
| `--github` | Ler branch protection via `gh` (opt-in; única exceção ao zero-rede) |
| `--json` | Exportar `harness-score.json` sem prompt |
| `--out <dir>` | Diretório de saída dos relatórios |
| `--lang <pt\|en>` | Idioma da saída (default pt) |
| `--no-color` | Terminal sem cores (acessibilidade/CI) |
| `--version` / `--help` | Versão / ajuda |

Defaults de flag podem morar em `.harnessrc.json` (`profile`, `gate`, `min`, `lang`, `out`);
a CLI sempre vence. Config **não** mexe em pontos de check — só em apresentação/gate.

## Desenvolvimento

```bash
pnpm install
pnpm dev          # roda o CLI no diretório atual (via tsx)
pnpm test         # testes (vitest)
pnpm build        # bundle → dist/
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
```

## Dogfood

A ferramenta nasce praticando o que audita (SDD + Harness Engineering): tem
[`CLAUDE.md`](CLAUDE.md) específico, CI com sensores, spec ([`specs/`](specs/) → PRD)
e permissões de agente escopadas. Rodar `harness-audit` no próprio repositório
devolve um score honesto — com as lacunas reais que ainda faltam fechar.

## Segurança

Zero rede, somente leitura, nunca executa código do repositório auditado. Veja [SECURITY.md](SECURITY.md).

## Licença

MIT.
