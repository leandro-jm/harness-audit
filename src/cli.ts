import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { VERSION } from "./version.js";
import { resolveOptions } from "./app/options.js";
import { loadConfig, mergeConfig } from "./app/config.js";
import { setLang, t } from "./i18n/index.js";
import { setColorEnabled } from "./util/colors.js";
import { runWizard, finishWizard } from "./app/wizard.js";
import { runHeadless } from "./app/headless.js";
import { runOrg } from "./app/org.js";
import { runExplain } from "./app/explain.js";
import { runHistory } from "./app/history.js";

const HELP = `harness-audit v${VERSION}
Auditoria de SDD e Harness Engineering. 100% local · somente leitura.

Uso:
  harness-audit [opções]
  harness-audit org <caminhos|glob>   Ranqueia vários repositórios locais
  harness-audit checks [id]           Lista/detalha os checks e suas fontes

Opções:
  --path <dir>       Auditar subdiretório (monorepo)
  --profile <perfil> built-by-ai | uses-ai | both | conventional
  --ci               Headless, sem prompts (para pipelines)
  --gate             Falha (exit 1) se o score ficar abaixo do mínimo
  --min <n>          Limiar do gate (0–4, default 2,0)
  --baseline <file>  Comparar com um harness-score.json anterior (local)
  --history          Evolução do score pelos harness-score.json commitados
  --format <fmt>     Saída: terminal (default) | github | sarif
  --badge            Gerar harness-badge.svg (commitável)
  --github           Ler branch protection via gh (opt-in, única exceção ao zero-rede)
  --json             Exportar harness-score.json sem prompt
  --out <dir>        Diretório de saída dos relatórios
  --lang <pt|en>     Idioma da saída (default pt)
  --no-color         Terminal sem cores
  --version          Mostrar versão
  --help             Mostrar esta ajuda
`;

// Saída canalizada e fechada cedo (ex.: `| head`) não deve travar nem quebrar.
process.stdout.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EPIPE") process.exit(0);
});

async function main(argv: string[]): Promise<number> {
  // parseArgs não trata `--no-color` nativamente; removemos e sinalizamos aqui.
  const noColor = argv.includes("--no-color");
  const cleanArgv = argv.filter((a) => a !== "--no-color");

  const { values, positionals } = parseArgs({
    args: cleanArgv,
    allowPositionals: true,
    options: {
      path: { type: "string" },
      profile: { type: "string" },
      ci: { type: "boolean", default: false },
      gate: { type: "boolean", default: false },
      min: { type: "string" },
      baseline: { type: "string" },
      format: { type: "string" },
      badge: { type: "boolean", default: false },
      github: { type: "boolean", default: false },
      history: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      out: { type: "string" },
      lang: { type: "string" },
      version: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  const color = !noColor;

  if (values.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }
  if (values.help) {
    process.stdout.write(HELP);
    return 0;
  }

  // Config de projeto (.harnessrc): defaults de flag; a CLI sempre vence.
  const configRoot = resolve(values.path ?? process.cwd());
  const merged = mergeConfig(values, loadConfig(configRoot));
  const options = resolveOptions({ ...merged, color });
  setLang(options.lang);
  setColorEnabled(options.color);

  // Subcomando `org <caminhos|glob>`: ranqueia vários repositórios locais.
  if (positionals[0] === "org") {
    return runOrg(positionals.slice(1), options);
  }

  // Subcomando `checks [id]`: lista/detalha os checks (transparência).
  if (positionals[0] === "checks") {
    return runExplain(positionals[1]);
  }

  // --history: evolução do score a partir dos harness-score.json commitados.
  if (options.history) {
    return runHistory(options);
  }

  // Caminho não-interativo: flags de CI/saída de máquina rodam sem prompts.
  const machineFormat = options.format != null && options.format !== "terminal";
  if (
    options.ci ||
    options.gate ||
    options.json ||
    options.out ||
    options.baseline ||
    options.badge ||
    machineFormat
  ) {
    return runHeadless(options);
  }

  // Ctrl+C fora dos prompts do @clack (que já tratam via isCancel): saída limpa.
  process.on("SIGINT", () => {
    process.stdout.write("\n");
    process.exit(0);
  });

  const outcome = await runWizard(options);

  if (outcome === "no-git") {
    process.stderr.write(t("detect.noGit", { path: options.path }) + "\n");
    return 2;
  }
  if (outcome === "cancelled") {
    return 0; // saída limpa, nada escrito
  }

  // O wizard já tratou a exportação consentida (exportStep); só encerra.
  finishWizard();
  return 0;
}

main(process.argv.slice(2))
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Erro: ${msg}\n`);
    process.exit(2);
  });
