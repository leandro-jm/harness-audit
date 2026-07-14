import { t } from "../i18n/index.js";
import { colors } from "../util/colors.js";
import { bar, formatScore, formatPercent } from "../util/format.js";
import type { MaturityLevel, Score, DimensionScore } from "../scoring/types.js";
import { topGaps, type Gap } from "../scoring/gaps.js";
import { checkTitleKey } from "../checks/registry.js";

const RULE = "═".repeat(56);
const DIM_LABEL_WIDTH = 20;

/** Monta o relatório de terminal (box de score, barras por dimensão, top-3 lacunas). */
export function renderTerminalReport(score: Score): string {
  const lines: string[] = [];

  lines.push(colors.dim(RULE));
  lines.push(
    ` ${colors.bold(t("report.scoreLabel"))}: ${paintLevel(score.level, formatScore(score.global))}` +
      ` / 4 · ${t("report.level")}: ${paintLevel(score.level, t(`level.${score.level}`).toUpperCase())}`,
  );
  lines.push(` ${colors.dim(t("report.confidence", { pct: formatPercent(score.confidence) }))}`);
  lines.push(colors.dim(RULE));
  lines.push("");

  for (const dim of score.dimensions) {
    lines.push(renderDimLine(dim));
  }
  lines.push("");

  const allResults = score.dimensions.flatMap((d) => d.results);
  const gaps = topGaps(allResults, 3);
  if (gaps.length > 0) {
    lines.push(colors.bold(t("report.topGaps", { n: gaps.length })));
    gaps.forEach((g, i) => {
      lines.push(` ${i + 1}. ${gapSummary(g)} ${colors.cyan(`→ ${g.recommendationId}`)}`);
    });
  } else {
    lines.push(colors.green(t("report.noGaps")));
  }

  return lines.join("\n");
}

function renderDimLine(dim: DimensionScore): string {
  const label = `${dim.dimension} ${t(`dim.${dim.dimension}`)}`.padEnd(DIM_LABEL_WIDTH);
  if (dim.score === null) {
    return ` ${colors.dim(label)} ${colors.dim(bar(0, 4))}  ${colors.dim(t("report.dimNa"))}`;
  }
  const b = paintLevel(levelForScore(dim.score), bar(dim.score, 4));
  const value = formatScore(dim.score);
  const seals = dim.seals.length
    ? colors.dim(`[${dim.seals.map((s) => t(`seal.${s}`)).join("+")}]`)
    : "";
  return ` ${label} ${b}  ${value}   ${seals}`;
}

function gapSummary(g: Gap): string {
  const r = g.result;
  if (r.summaryKey) return t(r.summaryKey, r.summaryParams);
  const titleKey = checkTitleKey(r.checkId);
  return titleKey ? t(titleKey) : r.checkId;
}

/** Mapeia um score 0..4 para a mesma banda usada no nível global (p/ colorir a barra). */
function levelForScore(score: number): MaturityLevel {
  if (score >= 3.8) return "dirigido";
  if (score >= 3.0) return "regulado";
  if (score >= 2.0) return "instrumentado";
  if (score >= 1.0) return "improviso";
  return "fe";
}

function paintLevel(level: MaturityLevel, text: string): string {
  switch (level) {
    case "fe":
    case "improviso":
      return colors.red(text);
    case "instrumentado":
      return colors.yellow(text);
    default:
      return colors.green(text);
  }
}
