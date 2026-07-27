import type { Lang } from "../core/types.js";
import { ptBR } from "./pt-BR.js";
import { enUS } from "./en-US.js";

export type Messages = Record<string, string>;

// v0.1 ships apenas pt-BR; en-US (v0.2) entra aqui como outro dicionário.
const DICTS: Record<Lang, Messages> = {
  pt: ptBR,
  en: enUS,
};

let current: Lang = "pt";

export function setLang(lang: Lang): void {
  current = lang;
}

/**
 * Resolve uma chave de mensagem no idioma atual, interpolando {param}.
 * Chave ausente cai de volta para a própria chave (nunca quebra a UI).
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = DICTS[current] ?? ptBR;
  let out = dict[key] ?? ptBR[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      out = out.split(`{${k}}`).join(String(v));
    }
  }
  return out;
}
