import { parseArgs } from "node:util";
import { VERSION } from "./version.js";

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

  // Fluxo interativo completo entra no M6 (app/wizard.ts).
  process.stdout.write(`harness-audit v${VERSION} — scaffold pronto.\n`);
  return 0;
}

main(process.argv.slice(2))
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    process.stderr.write(`Erro inesperado: ${String(err)}\n`);
    process.exit(2);
  });
