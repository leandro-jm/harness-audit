import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { t } from "../i18n/index.js";
import { colors } from "../util/colors.js";
import { formatScore } from "../util/format.js";
import { SCHEMA_VERSION } from "./json.js";
import type { Score } from "../scoring/types.js";

/** Recorte de um `harness-score.json` anterior, para comparação local (zero rede). */
export interface Baseline {
  schemaVersion: string;
  global: number;
  dimensions: Array<{ id: string; score: number | null }>;
}

export interface DimDelta {
  id: string;
  current: number | null;
  baseline: number | null;
  delta: number | null;
}

export interface DiffResult {
  globalCurrent: number;
  globalBaseline: number;
  globalDelta: number;
  /** true quando os major do schema divergem (score absoluto não comparável). */
  schemaMismatch: boolean;
  baselineSchema: string;
  dims: DimDelta[];
}

/** Lê e valida um baseline de disco. Retorna null se ausente/ilegível/inválido. */
export function loadBaseline(file: string): Baseline | null {
  try {
    const raw = readFileSync(resolve(file), "utf8");
    const j = JSON.parse(raw) as Record<string, unknown>;
    const score = j.score as { global?: unknown; dimensions?: unknown } | undefined;
    if (score == null || typeof score.global !== "number" || !Array.isArray(score.dimensions)) {
      return null;
    }
    return {
      schemaVersion: typeof j.schemaVersion === "string" ? j.schemaVersion : "0",
      global: score.global,
      dimensions: (score.dimensions as Array<Record<string, unknown>>).map((d) => ({
        id: String(d.id),
        score: typeof d.score === "number" ? d.score : null,
      })),
    };
  } catch {
    return null;
  }
}

function majorOf(version: string): string {
  return version.split(".")[0] ?? "0";
}

export function computeDiff(current: Score, baseline: Baseline): DiffResult {
  const baseById = new Map(baseline.dimensions.map((d) => [d.id, d.score]));
  const dims: DimDelta[] = current.dimensions.map((d) => {
    const base = baseById.get(d.dimension) ?? null;
    const delta = d.score != null && base != null ? d.score - base : null;
    return { id: d.dimension, current: d.score, baseline: base, delta };
  });
  return {
    globalCurrent: current.global,
    globalBaseline: baseline.global,
    globalDelta: current.global - baseline.global,
    schemaMismatch: majorOf(baseline.schemaVersion) !== majorOf(SCHEMA_VERSION),
    baselineSchema: baseline.schemaVersion,
    dims,
  };
}

/** Formata um delta com sinal em pt-BR ("+0,3", "−0,2", "0,0"). */
function fmtDelta(n: number | null): string {
  if (n == null) return "—";
  const rounded = Math.round(n * 10) / 10;
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "";
  return sign + Math.abs(rounded).toFixed(1).replace(".", ",");
}

function paintDelta(n: number | null, text: string): string {
  if (n == null || Math.abs(n) < 0.05) return colors.dim(text);
  return n > 0 ? colors.green(text) : colors.red(text);
}

/** Renderiza a seção de comparação com o baseline (terminal). */
export function renderDiff(diff: DiffResult): string {
  const L: string[] = [];
  L.push(colors.bold(t("diff.title")));
  if (diff.schemaMismatch) {
    L.push(
      colors.yellow(
        t("diff.schemaMismatch", { baseline: diff.baselineSchema, current: SCHEMA_VERSION }),
      ),
    );
  }
  L.push(
    " " +
      t("diff.global", {
        current: formatScore(diff.globalCurrent),
        delta: paintDelta(diff.globalDelta, fmtDelta(diff.globalDelta)),
        baseline: formatScore(diff.globalBaseline),
      }),
  );
  for (const d of diff.dims) {
    const cur = d.current == null ? t("report.dimNa") : formatScore(d.current);
    L.push(`  ${d.id} ${cur} ${paintDelta(d.delta, `(${fmtDelta(d.delta)})`)}`);
  }
  return L.join("\n");
}
