# PRD: harness-audit

**CLI interativo de auditoria de SDD e Harness Engineering**

| Campo | Valor |
|---|---|
| Autor | Leandro J Martins (Arquiteto de Software) |
| Status | Rascunho v1.0 para revisão |
| Data | 14/07/2026 |
| Nome de trabalho | `harness-audit` (executável via `npx harness-audit`) |
| Codinome do produto | Harness Scorecard v2 |

> **Nota de método:** este PRD é a spec do produto. O desenvolvimento deve seguir Spec-Driven Development: mudanças de comportamento passam primeiro por aqui, e cada PR referencia a seção que implementa. A ferramenta nasce praticando o que audita.

---

## 1. Resumo executivo

`harness-audit` é um CLI open source, interativo e 100% local que responde a uma pergunta que hoje ninguém responde com evidência: **"este repositório está equipado para agentes de IA trabalharem nele com segurança e qualidade?"**

Ele lê o repositório (arquivos, histórico do git, configuração de CI), roda checks objetivos nas 6 dimensões de um harness, complementa com poucas perguntas interativas para o que não dá pra ler em disco, e devolve um **Harness Score (0 a 4)** com nível de maturidade, lacunas priorizadas e recomendações rastreáveis.

O princípio central: **o repo não mente; o processo declarado, sim.** Evidência vem primeiro; autorrelato existe, mas sempre rotulado.

---

## 2. Contexto e problema

Times adotaram agentes de código (Claude Code, Copilot, Cursor) em velocidade recorde. A qualidade do que esses agentes produzem não depende do modelo: depende do **harness** em volta dele, os guias (feedforward) e sensores (feedback) que regulam o trabalho, conforme o framework de Birgitta Böckeler (Thoughtworks). E depende da intenção estar capturada antes do código, conforme a prática de **Spec-Driven Development**.

O problema:

1. **Ninguém sabe medir isso hoje.** A verificação existente é uma auditoria manual de ~30 minutos (checklist de 12 itens) que exige um especialista. Não escala, não repete, não compara.
2. **O ecossistema só gera, não audita.** Existem dezenas de ferramentas para criar harness, scaffolds de agentes, marketplaces de skills e geradores de CLAUDE.md. Não encontramos ferramenta que **avalie** a maturidade do harness existente com evidência.
3. **Autorrelato infla nota.** Perguntar ao time "vocês usam SDD?" retorna "sim". Olhar os últimos 10 PRs retorna a verdade.

### Oportunidade

A lacuna está na camada de **regulação e qualidade**, exatamente a tese da série de conteúdo Harness Engineering. A ferramenta materializa a tese: o diagnóstico do harness vira, ele mesmo, um sensor.

---

## 3. Objetivos e não-objetivos

### Objetivos (mensuráveis)

| # | Objetivo | Meta |
|---|---|---|
| O1 | Gerar um baseline objetivo de maturidade em uma sessão interativa | < 5 minutos em repo médio |
| O2 | Maximizar evidência sobre autorrelato | ≥ 70% dos pontos do score vindos de checks de evidência |
| O3 | Viabilizar uso recorrente (não só one-shot) | Modo `--gate` para CI a partir da v0.2 |
| O4 | Gerar distribuição orgânica | Relatório compartilhável + badge de README |
| O5 | Ser confiável para rodar em qualquer repo corporativo | Zero rede, zero execução de código do repo, somente leitura |

### Não-objetivos

- **Não mede qualidade do código.** Não é SonarQube nem linter. Mede se existe a *maquinaria* para controlar qualidade quando um agente trabalha no repo.
- **Não gera nem corrige harness.** Espaço saturado (metaharness, plugins de scaffold, geradores de CLAUDE.md). A ferramenta diagnostica e recomenda; não escreve arquivos no repo do usuário (exceto relatórios, com consentimento).
- **Não executa código do repositório.** Nenhum `npm install`, nenhum script, nenhum teste é rodado. Análise estática de arquivos e histórico apenas.
- **Não envia dados para lugar nenhum.** Sem telemetria por padrão, sem chamadas de rede.
- **Não substitui julgamento humano** na dimensão de steering (comportamento do time): essa dimensão combina proxies e autorrelato, sempre rotulados.

---

## 4. Personas e casos de uso

| Persona | Caso de uso | Modo |
|---|---|---|
| **Consultor / arquiteto** | Discovery: chegar no cliente, rodar `harness-audit .` e sair com baseline objetivo que vira anexo de proposta e prova de valor no fim do projeto | Interativo |
| **Tech lead** | Pre-flight de autonomia: decidir se um repo está pronto para receber agentes que abrem PR sozinhos | Interativo |
| **Time de produto** | Gate de higiene: bloquear regressão de harness em cada PR (guia estale, spec drift, sensor removido) | `--ci --gate` (v0.2) |
| **Platform engineering** | Rollout em escala: ranquear dezenas de repos por prontidão para priorizar onde liberar agente | Modo org (v1.0) |
| **Compliance / governança** | Responder "como garantimos a qualidade do código gerado por IA?" com relatório de evidências | Interativo + export |

---

## 5. Princípios de produto

1. **Evidência > proxy > autorrelato.** Todo resultado carrega um selo de origem: `[evidência]` (lido do repo), `[proxy]` (inferido de padrões, ex.: commits), `[autorrelato]` (respondido pelo usuário). O score exibe o percentual de confiança baseado em evidência.
2. **Local e somente leitura, sem exceção.** Auditável no código (open source). É pré-condição para rodar em repo corporativo.
3. **Interativo por padrão, headless por flag.** A experiência principal é um wizard de terminal. CI usa `--ci`.
4. **Rastreabilidade conceitual.** Cada check referencia sua fonte: framework da Böckeler (guias/sensores), taxonomia CoALA (memória), prática SDD. Nada de critério inventado sem lastro.
5. **Honestidade de medição.** O que a ferramenta não consegue medir bem (ex.: steering loop), ela declara como estimativa. Nunca vende proxy como fato.

---

## 6. Experiência do usuário (fluxo interativo)

### 6.1 Sessão exemplo (mock de terminal)

```
$ npx harness-audit

  ┌  harness-audit v0.1.0
  │  Auditoria de SDD e Harness Engineering.
  │  100% local · somente leitura · nenhum dado sai desta máquina.
  │
  ◇  Repositório: minha-plataforma (git · 1.243 commits · branch main)
  ◇  Stack detectada: Node.js + TypeScript (pnpm) · CI: GitHub Actions
  │
  ◆  Confirma a stack detectada?
  │  ● Sim  ○ Ajustar
  │
  ◆  Qual o perfil deste repositório?
  │  ● Aplicação desenvolvida COM agentes de IA
  │  ○ Aplicação que USA IA em runtime (LLM em produção)
  │  ○ Os dois
  │  ○ Convencional (quero preparar para receber agentes)
  │
  ◇  Rodando checks de evidência (23)...
  │  ✓ D1 Especificação ······ 4 checks · 1,2s
  │  ✓ D2 Guias ·············· 4 checks · 0,4s
  │  ✓ D3 Sensores ··········· 6 checks · 0,8s
  │  ✓ D4 Guardrails ········· 4 checks · 0,3s
  │  ✓ D5 Memória ············ 3 checks · 0,5s
  │  ✓ D6 Steering (proxies) · 2 checks · 2,1s
  │
  ◆  [autorrelato] Quando o agente entrega errado, o que o time
  │  conserta primeiro?
  │  ○ O código, na mão
  │  ○ O prompt daquela vez
  │  ● O guia ou o sensor que deixou aquilo passar
  │
  ◆  [autorrelato] Existe alguém responsável pelo harness
  │  (guias, sensores) com itens no backlog?
  │  ○ Sim, com backlog  ● Informalmente  ○ Ninguém
  │
  ◆  [autorrelato] Os checks de CI bloqueiam merge (branch
  │  protection) ou são informativos?
  │  ● Bloqueiam  ○ Só informam  ○ Não sei
  │
  └  Auditoria concluída.

  ══════════════════════════════════════════════════════
   HARNESS SCORE: 2,3 / 4 · Nível: INSTRUMENTADO
   Confiança: 78% do score baseado em evidência
  ══════════════════════════════════════════════════════

   D1 Especificação  ████░░░░░░  1,5   [evidência]
   D2 Guias          ███████░░░  2,8   [evidência]
   D3 Sensores       █████████░  3,4   [evidência]
   D4 Guardrails     ███████░░░  2,6   [evidência+autorrelato]
   D5 Memória        ███░░░░░░░  1,2   [evidência]
   D6 Steering       █████░░░░░  2,0   [proxy+autorrelato]

   TOP 3 LACUNAS
   1. Spec drift: 8 dos últimos 10 PRs mudaram src/ sem tocar
      specs/. A spec está mentindo. → recomendação R-1.4
   2. Memória procedural estale: 47 commits no código desde a
      última edição do CLAUDE.md. → recomendação R-2.3
   3. Sem sensor de arquitetura: lint e testes ok, mas nenhuma
      checagem de fronteiras de módulo. → recomendação R-3.5

  ◆  Exportar relatório?
  │  ◻ HARNESS-REPORT.md (humano)
  │  ◻ harness-score.json (máquina)
  │  ◻ Snippet de compartilhamento (texto p/ LinkedIn)
  │  ◻ Não exportar
```

### 6.2 Regras de UX

- **Wizard curto:** no máximo 6 perguntas interativas por sessão. Tudo o mais é evidência.
- **Toda pergunta de autorrelato é rotulada** como tal na própria tela.
- **Progresso visível** durante os checks (agrupado por dimensão, com tempo).
- **Resultado na hora**, no terminal, sem exigir export nem cadastro.
- **Nada é escrito no repo sem consentimento** (o export pergunta antes e sugere adicionar relatórios ao `.gitignore`).
- **Interrupção segura:** Ctrl+C a qualquer momento sai limpo, sem arquivos parciais.

---

## 7. Requisitos funcionais

### 7.1 Comandos e flags

| Comando / flag | Função | Fase |
|---|---|---|
| `harness-audit` | Auditoria interativa no diretório atual | v0.1 |
| `--path <dir>` | Auditar subdiretório (monorepo) | v0.1 |
| `--profile <built-by-ai\|uses-ai\|both\|conventional>` | Pular a pergunta de perfil | v0.1 |
| `--json` / `--out <dir>` | Export direto sem prompt | v0.1 |
| `--no-color` | Terminal sem cores (acessibilidade/CI) | v0.1 |
| `--ci` | Headless: sem prompts; autorrelato vira "não respondido" e sai do cálculo | v0.2 |
| `--gate --min <score>` | Falha (exit 1) se score global ou de dimensão ficar abaixo do mínimo | v0.2 |
| `--badge` | Gera SVG/JSON de badge para README | v0.2 |
| `--github` | Opcional: usa `gh` autenticado para ler branch protection (vira evidência) | v0.2 |
| `--lang <pt\|en>` | Idioma (padrão pt-BR; en-US na v0.2) | v0.2 |
| `harness-audit org <lista>` | Modo organização: audita N repos e ranqueia | v1.0 |

### 7.2 Detecção automática (fase 0 da sessão)

- Repositório git válido (obrigatório; sem git, aborta com mensagem clara).
- Stack: presença de `package.json`, `pyproject.toml`, `go.mod` etc. (v0.1 cobre JS/TS; demais stacks degradam com aviso "checks parciais").
- Provedor de CI: `.github/workflows/`, `.gitlab-ci.yml`, `azure-pipelines.yml`, `Jenkinsfile` (v0.1 interpreta GitHub Actions; demais são detectados mas com parsing limitado).
- Gerenciador de pacotes e scripts declarados (para o check de especificidade dos guias).

### 7.3 Perfis de repositório

O perfil ajusta **quais checks rodam** e **o que entra no denominador** do score:

| Perfil | Efeito |
|---|---|
| **Desenvolvida com IA** | Todos os checks de harness de desenvolvimento (D1 a D6) |
| **Usa IA em runtime** | D1 a D6 + trilha de checks de runtime harness (v1.0): evals em CI, prompts versionados, rastreio de custo, guardrails de tool use |
| **Os dois** | União dos dois conjuntos |
| **Convencional** | D1 a D6 com leitura "pre-flight": o resultado responde "o que falta para receber um agente", e dimensões específicas de IA aparecem como "não preparado" em vez de nota zero punitiva |

> **D7 (Segurança)** aplica-se a **todos os perfis** por igual — segurança não é específica de IA. Nos perfis de IA ela soma às dimensões de harness; no Convencional ela é medida normalmente (não degrada para "não preparado"). É a única dimensão cross-perfil.

### 7.4 Checks por dimensão

Legenda de tipo: **E** = evidência · **P** = proxy · **A** = autorrelato. Pontos padrão por check: 0 a 2.

#### D1 · Especificação (SDD)

| ID | Check | Como mede | Tipo |
|---|---|---|---|
| 1.1 | Spec mora no repo | Existência de `specs/`, `spec.md`, artefatos de Spec Kit (`.speckit/`), Kiro (`.kiro/`), OpenSpec | E |
| 1.2 | Spec é versionada de verdade | Histórico git dos arquivos de spec: nº de commits, mais de um autor | E |
| 1.3 | Spec vem antes do código | Nas últimas N features (heurística: merges que tocam `src/`), commit de spec antecede implementação | P |
| 1.4 | Spec drift | % dos últimos 20 commits/PRs que mudam `src/` sem tocar `specs/` | E |
| 1.5 | Tarefas derivam da spec | Pergunta interativa (existe rastro de plan/tasks?) | A |

#### D2 · Guias (feedforward)

| ID | Check | Como mede | Tipo |
|---|---|---|---|
| 2.1 | Guia de agente existe | `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md` | E |
| 2.2 | Guia é específico, não template | Heurística: cita scripts reais do `package.json`, diretórios reais do repo, comandos executáveis; penaliza texto genérico | E |
| 2.3 | Guia está fresco | Commits no código desde a última edição do guia (0 a 10 = fresco; 11 a 40 = atenção; > 40 = estale) | E |
| 2.4 | Regras de arquitetura/estilo declaradas | Arquivos de rules, seções de convenção no guia | E |

#### D3 · Sensores (feedback)

| ID | Check | Como mede | Tipo |
|---|---|---|---|
| 3.1 | CI existe e roda em PR | Workflow com gatilho `pull_request` | E |
| 3.2 | Sensor de estilo (lint) | Step de lint no CI | E |
| 3.3 | Sensor de tipos | Step de typecheck (`tsc --noEmit` ou equivalente) | E |
| 3.4 | Sensor de comportamento (testes) | Step de testes no CI | E |
| 3.5 | Sensor de arquitetura | Config de `dependency-cruiser`, `eslint-plugin-boundaries`, ArchUnit ou equivalente | E |
| 3.6 | Sensores bloqueiam merge | Via `--github` (branch protection) = E; senão pergunta interativa = A | E/A |

#### D4 · Ambiente e guardrails

| ID | Check | Como mede | Tipo |
|---|---|---|---|
| 4.1 | Execução isolada disponível | `.devcontainer/`, Dockerfile de dev, sandbox declarado | E |
| 4.2 | Higiene de segredos | Scanner configurado (gitleaks/secretlint), `.env` no `.gitignore`, ausência de segredo commitado (scan superficial) | E |
| 4.3 | Revisão estruturada | `CODEOWNERS`, template de PR | E |
| 4.4 | Permissões de agente escopadas | Configs de permissão de ferramenta de agente (ex.: allowlist de comandos), quando existirem | E |

#### D5 · Memória e contexto (taxonomia CoALA)

| ID | Check | Como mede | Tipo |
|---|---|---|---|
| 5.1 | Memória procedural viva | Reaproveita 2.1 + 2.3 com peso próprio: guia existente E fresco | E |
| 5.2 | Memória semântica de decisões | ADRs (`docs/adr/`, `docs/decisions/`), changelog de arquitetura | E |
| 5.3 | Aprendizados voltam pro guia | Pergunta interativa: erro novo vira regra nova? | A |

#### D6 · Steering loop

| ID | Check | Como mede | Tipo |
|---|---|---|---|
| 6.1 | Correção manual crônica | Detecta commits de agente (`Co-authored-by: Claude/Copilot/Cursor`, autores bot) e mede taxa de commits "fix/ajuste" humanos logo em seguida | P |
| 6.2 | Time itera no harness | Edições em guia/rules/CI correlacionadas a rajadas de fix | P |
| 6.3 | Pergunta-assinatura | "Quando o agente entrega errado, o que o time conserta primeiro?" (código na mão / prompt da vez / guia ou sensor) | A |
| 6.4 | Harness tem dono | Pergunta interativa (responsável + backlog) | A |

#### D7 · Segurança (DevSecOps)

Mede o **preparo de segurança do harness** — se os sensores e guardrails de segurança estão *configurados* no repositório —, **nunca** a execução de scanners nem a busca por vulnerabilidades. Como todo o resto do produto, é 100% estático: lê arquivos de config e de CI como evidência e **não roda** `npm audit`, njsscan, Semgrep etc. (respeita o `SECURITY.md`: zero rede, somente leitura, nunca executa código do repo auditado). A regra é **detectar o sensor, não rodá-lo**.

| ID | Check | Como mede | Tipo |
|---|---|---|---|
| 7.1 | SAST configurado | Análise estática de segurança presente: CodeQL (`.github/workflows/codeql.yml`, `github/codeql-action`), Semgrep (`.semgrep.yml`, job no CI), njsscan (job/`.njsscan`) ou `eslint-plugin-security` (devDep + regra ativa no ESLint). 0 = nenhum · 1 = só lint de segurança (heurístico) · 2 = SAST dedicado em CI | E |
| 7.2 | Dependências monitoradas (SCA) | Atualização automatizada (`.github/dependabot.yml`, `renovate.json`) e/ou varredura de deps no CI (`npm`/`pnpm audit`, `osv-scanner`, `trivy`) — detecta o *step*, não executa. 0 = nada · 1 = update automatizado OU audit · 2 = ambos | E |
| 7.3 | Secret scanning dedicado | Eleva o 4.2: scanner de segredos configurado (gitleaks/trufflehog/detect-secrets/secretlint) com step em CI ou pre-commit. 0 = nada · 1 = `.env` no `.gitignore` + scan superficial limpo (herda 4.2) · 2 = scanner dedicado em CI/pre-commit | E |
| 7.4 | Higiene de supply chain | Lockfile commitado; ausência de dependências não pinadas (por URL/git); bônus por SBOM/attestation declarada. 0 = sem lockfile · 1 = lockfile presente · 2 = lockfile + pinning íntegro (ou SBOM) | E |
| 7.5 | Política de resposta a vulnerabilidade | Canal de divulgação declarado: `SECURITY.md` (raiz ou `.github/`) com contato/processo de reporte. | E |
| 7.6 | Sensores de segurança bloqueiam e rodam em PR | Os sensores de 7.1–7.3 disparam em `pull_request` (não só `schedule`/manual) e bloqueiam merge — **reaproveita** o sinal de branch protection do 3.6 (via `--github` = evidência; senão o autorrelato já existente do 3.6), sem nova pergunta ao usuário. | E/A |
| 7.7 | Vuln vira regra/sensor | Autorrelato (espelha 5.3/6.3): ao aparecer uma vulnerabilidade, o time adiciona uma regra/sensor que pega a *classe inteira*, ou só corrige o caso pontual? | A |

**Rastreabilidade (Apêndice B):** os checks ancoram no **OWASP DSOMM** (dimensões Implementation, Build & Deployment, Test & Verification, Culture) e no **NIST SSDF (SP 800-218)** — 7.1→PW.7/PW.8, 7.2→PW.4/RV.1, 7.3→PS.1, 7.4→PS.3, 7.5→RV.3, 7.6→PO.3/PW.7, 7.7→RV/cultura. D7 estende o conceito de *sensor* da Böckeler para a classe de segurança.

**Orçamento de UX (§6.2):** D7 adiciona **apenas 1 pergunta interativa** (7.7); o 7.6 reutiliza o autorrelato do 3.6. O total de autorrelatos segue dentro do teto de 6 perguntas por sessão.

**Fase:** nova dimensão, alvo **v0.2** (ver §10 e questão em aberto §14.6).

### 7.5 Modelo de pontuação

- **Por check:** 0 a 2 pontos conforme critério do check (binário ou graduado).
- **Por dimensão:** `nota = (pontos obtidos / pontos aplicáveis) × 4`. Checks não aplicáveis (ex.: stack não suportada, autorrelato pulado em `--ci`) saem do denominador, nunca contam como zero.
- **Score global:** média simples das dimensões aplicáveis — D1 a D6 na v0.1; **D1 a D7 quando a D7 entrar** (v0.2, §10). Pesos configuráveis ficam como evolução (ver seção 14).
- **Confiança:** `% de pontos com origem [evidência]` exibido junto ao score. Proxy e autorrelato entram no score, mas rebaixam a confiança. (D7 é quase toda `[evidência]`, então tende a *elevar* a confiança.)
- **Migração ao incluir a D7:** a média passa de 6 para 7 dimensões, então o valor absoluto do score muda mesmo sem nenhuma mudança no repo. A escala 0–4 e os níveis (Fé…Dirigido) permanecem; comparações históricas exigem `schemaVersion` novo no `harness-score.json`. Como as demais, checks de D7 não aplicáveis (ex.: sinal indisponível na stack) saem do denominador — nunca viram zero punitivo.

**Níveis de maturidade:**

| Faixa | Nível | Leitura |
|---|---|---|
| 0,0 a 0,9 | **Fé** | Prompt e reza. Sem guia, sem sensor. |
| 1,0 a 1,9 | **Improviso** | Guia genérico, feedback no olho. |
| 2,0 a 2,9 | **Instrumentado** | Sensores computacionais rodando a cada mudança. |
| 3,0 a 3,7 | **Regulado** | Loop fechado: spec em sincronia, guardrails, saída de sensor consumível. |
| 3,8 a 4,0 | **Dirigido** | Time itera no harness, mede custo e qualidade, compartilha templates. |

### 7.6 Saídas

| Saída | Conteúdo | Fase |
|---|---|---|
| **Terminal** | Score, nível, barras por dimensão com selo de origem, confiança, top 3 lacunas com ID de recomendação | v0.1 |
| **HARNESS-REPORT.md** | Relatório completo: cada check, evidência encontrada (arquivo/linha/número), recomendação e fonte conceitual | v0.1 |
| **harness-score.json** | Estrutura por dimensão/check para comparação histórica e modo org | v0.1 |
| **Snippet de compartilhamento** | Texto curto com score e nível, pronto para post | v0.1 |
| **Badge** | SVG local + JSON estilo shields.io (`Harness Score 2,3 · Instrumentado`) | v0.2 |
| **Exit codes** | `0` sucesso · `1` gate reprovado · `2` erro de execução | v0.2 |

Cada recomendação tem ID estável (`R-1.4`, `R-2.3`...) e aponta a fonte conceitual (Böckeler, CoALA, prática SDD), mantendo a rastreabilidade que diferencia a ferramenta.

---

## 8. Requisitos não-funcionais

| Categoria | Requisito |
|---|---|
| **Privacidade** | Zero chamadas de rede em qualquer modo (exceto `--github`, explícito e opcional). Sem telemetria por padrão; se um dia existir, será opt-in explícito. |
| **Segurança** | Somente leitura no repo do usuário. Nunca executa código, scripts ou instala dependências do repo auditado. |
| **Performance** | Sessão completa < 60s em repo de até 5k commits; checks de git com `--max-count` e amostragem. |
| **Portabilidade** | Node 20+; macOS, Linux, Windows (WSL e nativo); uso via `npx` sem instalação global. |
| **Acessibilidade** | `--no-color`, saída legível por leitor de tela (sem depender só de cor para significado). |
| **Idioma** | pt-BR nativo na v0.1; en-US na v0.2 (arquitetura de i18n desde o início). |
| **Licença** | Open source (MIT), pré-requisito de confiança para rodar em ambiente corporativo. |

---

## 9. Arquitetura técnica sugerida

- **Runtime:** Node.js 20+ com TypeScript. Distribuição via npm (`npx harness-audit`).
- **Interatividade:** `@clack/prompts` (wizard leve e bonito). Alternativa avaliada: Ink (TUI React), descartada na v0.1 por peso.
- **Leitura de repo:** `simple-git` (histórico, blame de arquivos-chave), `fast-glob` (descoberta de arquivos), parser YAML para workflows de CI.
- **Motor de checks plugável:** cada check é um módulo com contrato único:

```ts
interface Check {
  id: string;              // "1.4"
  dimension: Dimension;    // D1..D6
  kind: "evidence" | "proxy" | "self-report";
  profiles: Profile[];     // em quais perfis roda
  run(ctx: RepoContext): Promise<CheckResult>; // pontos, máximo, evidências[]
}
```

  Novos checks (inclusive os de runtime harness da v1.0) entram sem tocar no core.
- **Relatórios:** templates markdown + serialização JSON versionada (`schemaVersion`).
- **Testes da própria ferramenta:** repositórios-fixture (um por nível de maturidade) validando o score de ponta a ponta. O harness da ferramenta segue os próprios critérios que ela audita.

---

## 10. Roadmap

| Versão | Escopo | Critério de saída |
|---|---|---|
| **v0.1 (MVP)** | Fluxo interativo completo; checks E das dimensões D1 a D5 + proxies básicos de D6; stack JS/TS; GitHub Actions; relatórios md/json; pt-BR | Rodar de ponta a ponta em 5 repos reais (incluindo a plataforma do autor) com resultado defensável |
| **v0.2** | `--ci`, `--gate`, badge, `--github` (branch protection como evidência), en-US, stack Python | Gate rodando no CI de pelo menos 1 projeto real por 2 semanas sem falso alarme crítico |
| **v1.0** | Trilha de runtime harness (evals em CI, prompts versionados, custo por turno, guardrails de tool use); modo org multi-repo; comparação histórica de scores | Auditoria dev + runtime no mesmo relatório; ranking de ≥ 10 repos em uma execução |

**Build in public:** cada versão vira conteúdo da série Harness Engineering (o dogfood da v0.1 na própria plataforma do autor, inclusive com as notas baixas, é o post de lançamento).

---

## 11. Métricas de sucesso

| Métrica | Alvo inicial (90 dias pós-lançamento) |
|---|---|
| Execuções (proxy: downloads npm/semana) | 200/semana |
| Taxa de export de relatório ao fim da sessão | ≥ 40% |
| Repos com uso recorrente (2ª execução em 30 dias) | ≥ 15% |
| Estrelas no GitHub | 300 |
| Conversas de consultoria originadas pela ferramenta | 5 qualificadas |

---

## 12. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Falso positivo: guia genérico pontuando como bom | Heurística de especificidade (2.2) cruza o guia com scripts e diretórios reais do repo; texto template pontua baixo |
| Monorepo distorce leitura | `--path` para escopo por pacote; detecção de workspaces com aviso |
| Diversidade de CI (GitLab, Jenkins...) | Arquitetura de adapter; v0.1 declara "parsing completo apenas GitHub Actions" e marca demais como parcial |
| Proxies de steering mal interpretados | Selo `[proxy]` sempre visível; relatório explica a heurística e seus limites |
| Percepção de risco ao rodar em repo corporativo | Open source, zero rede, somente leitura, e um `SECURITY.md` dizendo exatamente isso |
| Score virar métrica de vaidade (Goodhart) | Relatório prioriza lacunas e recomendações, não o número; badge sempre acompanhado do nível qualitativo |

---

## 13. Fora de escopo (registrado para não voltar)

- Análise de qualidade de código (complexidade, duplicação, bugs).
- Geração/correção automática de CLAUDE.md, specs ou workflows.
- Execução de agentes ou chamadas a LLM na v0.x (a trilha inferencial de runtime é v1.0 e será opt-in).
- Dashboard web/SaaS (o CLI é o produto; SaaS só se o modo org provar demanda).

## 14. Questões em aberto

1. **Nome e pacote npm:** `harness-audit` vs `harness-score` (verificar disponibilidade no registry).
2. **Pesos por dimensão:** média simples na v0.1; permitir peso configurável por perfil (ex.: Guardrails pesar mais em "usa IA em runtime")?
3. **Hospedagem do badge:** SVG commitado no repo vs endpoint (endpoint implicaria serviço, conflita com "zero rede"?).
4. **Detecção de commits de agente:** cobrir quais assinaturas além de `Co-authored-by` (bots, trailers customizados)?
5. **Limiar padrão do `--gate`:** 2,0 global? Por dimensão? Definir com dados dos primeiros dogfoods.
6. **Impacto da D7 no score:** entra com peso igual (média de 7) ou com peso próprio por perfil? Como sinalizar a quebra de comparabilidade histórica (novo `schemaVersion`) sem confundir quem já tem baseline? A D7 deve valer para o `--gate` desde a estreia ou só informar no começo?

---

## Apêndice A · Mapeamento: checklist manual (12 itens) → checks do CLI

| Item manual | Check(s) |
|---|---|
| 1. Spec mora no repo? | 1.1 |
| 2. Spec antes do código? | 1.3 |
| 3. Spec acompanha mudança? | 1.4 |
| 4. Tarefa deriva de spec? | 1.5 |
| 5. Feedforward específico? | 2.1, 2.2 |
| 6. Feedforward fresco? | 2.3 |
| 7. Sensores automáticos? | 3.1 a 3.4 |
| 8. Sensor de arquitetura? | 3.5 |
| 9. Guardrails de execução? | 4.1 a 4.4, 3.6 |
| 10. Pergunta-assinatura | 6.3 |
| 11. Rastro no git | 6.1, 6.2 |
| 12. Dono do harness | 6.4 |

## Apêndice B · Rastreabilidade conceitual

| Conceito usado | Fonte |
|---|---|
| Harness, guias (feedforward), sensores (feedback), sensores computacionais vs inferenciais, steering loop, keep quality left, harnessability | Birgitta Böckeler, *Harness Engineering for Coding Agent Users* (martinfowler.com / Thoughtworks, abr/2026) |
| Taxonomia de memória de agente (working, episódica, semântica, procedural) | Framework CoALA (Princeton/CMU, arXiv:2309.02427) |
| Spec-Driven Development (specify → plan → tasks → implement; spec como fonte de verdade) | Prática de indústria: GitHub Spec Kit, AWS Kiro, OpenSpec |
| Checklist de auditoria manual de 12 itens; níveis Fé/Improviso/Instrumentado/Regulado/Dirigido; distinção harness de dev × harness de runtime | Série Harness Engineering (Leandro J Martins) |
| Maturidade DevSecOps; práticas de software seguro (SAST, SCA, secret scanning, resposta a vulnerabilidade) mapeadas na D7 | OWASP DevSecOps Maturity Model (DSOMM) · NIST Secure Software Development Framework (SSDF), SP 800-218 |
