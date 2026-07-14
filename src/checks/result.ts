import type { DimensionId } from "../core/types.js";
import type { CheckKind, CheckResult, Evidence, Seal } from "./types.js";

export const SEAL_BY_KIND: Record<CheckKind, Seal> = {
  evidence: "evidencia",
  proxy: "proxy",
  "self-report": "autorrelato",
};

/** Metadados mínimos de um check, usados pelos construtores de resultado. */
export interface CheckMeta {
  id: string;
  dimension: DimensionId;
  kind: CheckKind;
}

const DEFAULT_MAX = 2;

export function evidence(
  detailKey: string,
  kind: CheckKind,
  extra?: { file?: string; line?: number; params?: Record<string, string | number> },
): Evidence {
  return { detailKey, kind, ...extra };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Resultado medido: entra no denominador. Anexa R-<id> quando houver lacuna. */
export function measured(
  meta: CheckMeta,
  args: {
    points: number;
    max?: number;
    evidences?: Evidence[];
    seal?: Seal;
    recommendationId?: string;
    summaryKey?: string;
    summaryParams?: Record<string, string | number>;
  },
): CheckResult {
  const max = args.max ?? DEFAULT_MAX;
  const points = clamp(args.points, 0, max);
  const hasGap = points < max;
  return {
    checkId: meta.id,
    dimension: meta.dimension,
    status: "measured",
    points,
    max,
    seal: args.seal ?? SEAL_BY_KIND[meta.kind],
    evidences: args.evidences ?? [],
    recommendationId: hasGap ? (args.recommendationId ?? `R-${meta.id}`) : undefined,
    summaryKey: args.summaryKey,
    summaryParams: args.summaryParams,
  };
}

/** Fora do denominador: não pôde ser medido (nunca zero punitivo). */
export function notApplicable(
  meta: CheckMeta,
  detailKey: string,
  params?: Record<string, string | number>,
): CheckResult {
  return {
    checkId: meta.id,
    dimension: meta.dimension,
    status: "not-applicable",
    points: 0,
    max: DEFAULT_MAX,
    seal: SEAL_BY_KIND[meta.kind],
    evidences: [evidence(detailKey, meta.kind, params ? { params } : undefined)],
  };
}

/** Perfil convencional sem artefato de IA: lacuna a preparar (pre-flight). */
export function notPrepared(
  meta: CheckMeta,
  detailKey: string,
  params?: Record<string, string | number>,
): CheckResult {
  return {
    checkId: meta.id,
    dimension: meta.dimension,
    status: "not-prepared",
    points: 0,
    max: DEFAULT_MAX,
    seal: SEAL_BY_KIND[meta.kind],
    evidences: [evidence(detailKey, meta.kind, params ? { params } : undefined)],
    recommendationId: `R-${meta.id}`,
    summaryKey: detailKey,
    summaryParams: params,
  };
}
