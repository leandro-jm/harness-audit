# Segurança

`harness-audit` foi desenhado para rodar com confiança dentro de repositórios corporativos.

## Garantias

- **Zero rede.** A ferramenta não faz nenhuma chamada de rede em qualquer modo. (A exceção `--github`, prevista para a v0.2, é explícita, opcional e usa apenas o `gh` já autenticado da sua máquina.)
- **Somente leitura.** A ferramenta só lê arquivos e histórico do git do repositório auditado. Nunca escreve nada no repositório sem consentimento explícito — apenas os relatórios que você escolher exportar ao final da sessão.
- **Nunca executa código do repositório.** Nenhum `npm install`, nenhum script, nenhum teste, nenhum hook é executado. A análise é 100% estática (leitura de arquivos + `git log`/`git rev-list`, que apenas leem o histórico).
- **Sem telemetria.** Nenhum dado sai da sua máquina. Se algum dia existir telemetria, será estritamente opt-in.
- **Open source (MIT).** Todo o comportamento é auditável no código.

## Reportar uma vulnerabilidade

Abra uma issue privada ou contate o mantenedor. Não abra issues públicas para vulnerabilidades ainda não corrigidas.
