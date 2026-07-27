// Vocabulário compartilhado do domínio. Mantido pequeno e sem dependências
// para evitar ciclos: tanto o RepoContext quanto os checks importam daqui.

export type Lang = "pt" | "en";

export type Profile = "built-by-ai" | "uses-ai" | "both" | "conventional";

export const PROFILES: Profile[] = ["built-by-ai", "uses-ai", "both", "conventional"];

export type DimensionId = "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8";

export const DIMENSIONS: DimensionId[] = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"];

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
  /** --ci: headless, sem prompts (autorrelato sai do denominador). */
  ci: boolean;
  /** --gate: falha (exit 1) se o score global ficar abaixo do mínimo. */
  gate?: boolean;
  /** --min <n>: limiar do gate (default 2.0). Aceita "2,0" ou "2.0". */
  min?: number;
  /** --baseline <arquivo>: compara com um harness-score.json anterior (local). */
  baseline?: string;
  /** --format: saída para máquina (github = anotações de PR · sarif = code scanning). */
  format?: OutputFormat;
  /** --badge: gera um harness-badge.svg (commitável, sem rede). */
  badge?: boolean;
  /** --github: lê branch protection via `gh` (opt-in; única exceção ao zero-rede). */
  github?: boolean;
  /** --history: mostra a evolução do score a partir dos score.json commitados. */
  history?: boolean;
}

export type OutputFormat = "terminal" | "github" | "sarif";

export const OUTPUT_FORMATS: OutputFormat[] = ["terminal", "github", "sarif"];
