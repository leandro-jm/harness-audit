import { parseArgs } from "node:util";
import { VERSION } from "./version.js";
import { resolveOptions } from "./app/options.js";
import { setLang, t } from "./i18n/index.js";
import { loadRepoContext } from "./context/repo-context.js";
import { describeDetection } from "./context/summary.js";
import { runChecks } from "./app/run-checks.js";

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
  const { values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      path: { type: "string" },
      profile: { type: "string" },
      json: { type: "boolean", default: false },
      out: { type: "string" },
      color: { type: "boolean", default: true },
      lang: { type: "string" },
      version: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });

  if (values.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }
  if (values.help) {
    process.stdout.write(HELP);
    return 0;
  }

  const options = resolveOptions(values);
  setLang(options.lang);

  const ctx = await loadRepoContext(options);
  if (!ctx.git.isRepo) {
    process.stderr.write(t("detect.noGit", { path: ctx.root }) + "\n");
    return 2;
  }

  // M1: imprime a detecção. Fluxo interativo completo entra no M6.
  process.stdout.write(`harness-audit v${VERSION}\n`);
  for (const line of describeDetection(ctx)) {
    process.stdout.write(line + "\n");
  }

  // M2: roda os checks disponíveis e imprime resultados crus (temporário).
  const results = await runChecks(ctx);
  process.stdout.write("\nChecks:\n");
  for (const r of results) {
    process.stdout.write(
      `  ${r.checkId} [${r.status}] ${r.points}/${r.max} · ${t(`seal.${r.seal}`)}` +
        (r.recommendationId ? ` → ${r.recommendationId}` : "") +
        "\n",
    );
  }
  return 0;
}

main(process.argv.slice(2))
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Erro: ${msg}\n`);
    process.exit(2);
  });
