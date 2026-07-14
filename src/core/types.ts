// Vocabulário compartilhado do domínio. Mantido pequeno e sem dependências
// para evitar ciclos: tanto o RepoContext quanto os checks importam daqui.

export type Lang = "pt" | "en";

export type Profile = "built-by-ai" | "uses-ai" | "both" | "conventional";

export const PROFILES: Profile[] = ["built-by-ai", "uses-ai", "both", "conventional"];

export type DimensionId = "D1" | "D2" | "D3" | "D4" | "D5" | "D6";

export const DIMENSIONS: DimensionId[] = ["D1", "D2", "D3", "D4", "D5", "D6"];

/** Opções resolvidas da linha de comando, propagadas por toda a execução. */
export interface RunOptions {
  /** Raiz absoluta do repositório auditado (resolvida a partir de --path). */
  path: string;
  /** Perfil vindo de --profile; undefined → perguntar no wizard. */
  profile?: Profile;
  lang: Lang;
  color: boolean;
  /** --json: exporta harness-score.json sem prompt. */
  json: boolean;
  /** --out <dir>: diretório de saída dos relatórios. */
  out?: string;
  /** --ci (v0.2): headless, sem prompts. Carregado desde já, default false. */
  ci: boolean;
}
