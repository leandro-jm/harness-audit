import { resolve } from "node:path";
import {
  PROFILES,
  OUTPUT_FORMATS,
  type OutputFormat,
  type Profile,
  type RunOptions,
} from "../core/types.js";

/** Valores crus de flags (saída do parseArgs). */
export interface RawFlags {
  path?: string;
  profile?: string;
  json?: boolean;
  out?: string;
  color?: boolean;
  ci?: boolean;
  gate?: boolean;
  min?: string;
  baseline?: string;
  format?: string;
  badge?: boolean;
  github?: boolean;
  history?: boolean;
  lang?: string;
}

/** Normaliza as flags cruas em RunOptions, validando o perfil. */
export function resolveOptions(flags: RawFlags): RunOptions {
  const profile = normalizeProfile(flags.profile);
  const noColorEnv = process.env.NO_COLOR != null && process.env.NO_COLOR !== "";
  return {
    path: resolve(flags.path ?? process.cwd()),
    profile,
    lang: flags.lang === "en" ? "en" : "pt",
    color: flags.color !== false && !noColorEnv && Boolean(process.stdout.isTTY),
    json: Boolean(flags.json),
    out: flags.out,
    ci: Boolean(flags.ci),
    gate: Boolean(flags.gate),
    min: normalizeMin(flags.min),
    baseline: flags.baseline,
    format: normalizeFormat(flags.format),
    badge: Boolean(flags.badge),
    github: Boolean(flags.github),
    history: Boolean(flags.history),
  };
}

function normalizeFormat(value: string | undefined): OutputFormat | undefined {
  if (value == null) return undefined;
  if ((OUTPUT_FORMATS as string[]).includes(value)) return value as OutputFormat;
  throw new Error(`--format inválido: "${value}". Use: ${OUTPUT_FORMATS.join(", ")}.`);
}

/** Aceita limiar em pt-BR ("2,0") ou en ("2.0"); ignora valor inválido. */
function normalizeMin(value: string | undefined): number | undefined {
  if (value == null) return undefined;
  const n = Number(value.replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 4) {
    throw new Error(`--min inválido: "${value}". Use um número entre 0 e 4.`);
  }
  return n;
}

function normalizeProfile(value: string | undefined): Profile | undefined {
  if (value == null) return undefined;
  if ((PROFILES as string[]).includes(value)) return value as Profile;
  throw new Error(
    `Perfil inválido: "${value}". Use um de: ${PROFILES.join(", ")}.`,
  );
}
