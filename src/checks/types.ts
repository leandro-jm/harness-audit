import type { DimensionId, Profile } from "../core/types.js";
import type { RepoContext } from "../context/repo-context.js";

export type CheckKind = "evidence" | "proxy" | "self-report";

/** Selo de origem exibido na UI/relatório (rótulo pt-BR). */
export type Seal = "evidencia" | "proxy" | "autorrelato";

/**
 * measured      → entra no denominador do score.
 * not-applicable→ fora do denominador (stack não suportada, histórico insuficiente,
 *                 autorrelato pulado). Nunca vira zero punitivo (PRD §7.5).
 * not-prepared  → perfil convencional sem o artefato de IA: leitura "pre-flight",
 *                 fora do denominador, mostrado como lacuna a preparar.
 */
export type CheckStatus = "measured" | "not-applicable" | "not-prepared";

/** Uma evidência concreta encontrada (ou a razão de N/A). */
export interface Evidence {
  /** Caminho relativo ao repositório, quando aplicável. */
  file?: string;
  line?: number;
  /** Chave de mensagem i18n do detalhe. */
  detailKey: string;
  params?: Record<string, string | number>;
  /** Origem desta evidência específica. */
  kind: CheckKind;
}

export interface CheckResult {
  checkId: string;
  dimension: DimensionId;
  status: CheckStatus;
  points: number;
  max: number;
  seal: Seal;
  evidences: Evidence[];
  /** Presente quando há lacuna (points < max) ou not-prepared. Ex.: "R-1.4". */
  recommendationId?: string;
  /** Resumo de uma linha (i18n) para top-lacunas e relatório. */
  summaryKey?: string;
  summaryParams?: Record<string, string | number>;
}

/** Contrato único de um check. Novos checks entram sem tocar o core (PRD §9). */
export interface Check {
  id: string;
  dimension: DimensionId;
  kind: CheckKind;
  /** Perfis em que este check roda. */
  profiles: Profile[];
  /** Peso relativo dentro da dimensão (default 1). */
  weight: number;
  titleKey: string;
  run(ctx: RepoContext): Promise<CheckResult> | CheckResult;
}
