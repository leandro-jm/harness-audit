import { resolve } from "node:path";
import { PROFILES, type Profile, type RunOptions } from "../core/types.js";

/** Valores crus de flags (saída do parseArgs). */
export interface RawFlags {
  path?: string;
  profile?: string;
  json?: boolean;
  out?: string;
  color?: boolean;
  ci?: boolean;
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
  };
}

function normalizeProfile(value: string | undefined): Profile | undefined {
  if (value == null) return undefined;
  if ((PROFILES as string[]).includes(value)) return value as Profile;
  throw new Error(
    `Perfil inválido: "${value}". Use um de: ${PROFILES.join(", ")}.`,
  );
}
