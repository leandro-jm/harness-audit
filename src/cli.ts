import { parseArgs } from "node:util";
import { VERSION } from "./version.js";
import { resolveOptions } from "./app/options.js";
import { setLang, t } from "./i18n/index.js";
import { setColorEnabled } from "./util/colors.js";
import { runWizard, finishWizard } from "./app/wizard.js";
import { runHeadless } from "./app/headless.js";

const HELP = `harness-audit v${VERSION}
Auditoria de SDD e Harness Engineering. 100% local · somente leitura.

Uso:
  harness-audit [opções]

Opções:
  --path <dir>       Auditar subdiretório (monorepo)
  --profile <perfil> built-by-ai | uses-ai | both | conventional
  --json             Exportar harness-score.json sem prompt
  --out <dir>        Diretório de saída dos relatórios
  --no-color         Terminal sem cores
  --version          Mostrar versão
  --help             Mostrar esta ajuda
`;

async function main(argv: string[]): Promise<number> {
  // parseArgs não trata `--no-color` nativamente; removemos e sinalizamos aqui.
  const noColor = argv.includes("--no-color");
  const cleanArgv = argv.filter((a) => a !== "--no-color");

  const { values } = parseArgs({
    args: cleanArgv,
    allowPositionals: true,
    options: {
      path: { type: "string" },
      profile: { type: "string" },
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

  const options = resolveOptions({ ...values, color });
  setLang(options.lang);
  setColorEnabled(options.color);

  // Caminho não-interativo: --json / --out exportam direto, sem prompts.
  if (options.json || options.out) {
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

  // Exportação de relatórios entra no M7. Por ora encerra o wizard.
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
