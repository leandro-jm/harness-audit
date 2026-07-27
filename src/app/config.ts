import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { RawFlags } from "./options.js";

/**
 * Config de projeto (.harnessrc.json / harness.config.json). DELIBERADAMENTE
 * restrita a defaults de flags — profile, gate, min, lang, out. NÃO permite
 * ignorar checks nem mexer em pontos: isso viraria métrica de vaidade e
 * quebraria a comparabilidade (PRD §5, honestidade de medição). As flags de CLI
 * sempre sobrepõem a config.
 */
export interface HarnessConfig {
  profile?: string;
  min?: number;
  lang?: string;
  gate?: boolean;
  out?: string;
}

const CONFIG_FILES = [".harnessrc.json", "harness.config.json", ".harnessrc"];

export function loadConfig(root: string): HarnessConfig {
  for (const file of CONFIG_FILES) {
    let raw: string;
    try {
      raw = readFileSync(join(root, file), "utf8");
    } catch {
      continue;
    }
    try {
      return pickAllowed(JSON.parse(raw) as Record<string, unknown>);
    } catch {
      return {};
    }
  }
  return {};
}

function pickAllowed(j: Record<string, unknown>): HarnessConfig {
  const out: HarnessConfig = {};
  if (typeof j.profile === "string") out.profile = j.profile;
  if (typeof j.lang === "string") out.lang = j.lang;
  if (typeof j.out === "string") out.out = j.out;
  if (typeof j.gate === "boolean") out.gate = j.gate;
  if (typeof j.min === "number") out.min = j.min;
  return out;
}

/** Aplica a config como defaults; as flags de CLI (quando presentes) vencem. */
export function mergeConfig(flags: RawFlags, config: HarnessConfig): RawFlags {
  return {
    ...flags,
    profile: flags.profile ?? config.profile,
    lang: flags.lang ?? config.lang,
    out: flags.out ?? config.out,
    min: flags.min ?? (config.min != null ? String(config.min) : undefined),
    gate: Boolean(flags.gate) || Boolean(config.gate),
  };
}
