import { t } from "../i18n/index.js";
import { VERSION } from "../version.js";
import type { RepoContext } from "../context/repo-context.js";
import type { AuditResult } from "../app/run-audit.js";
import type { CheckResult } from "../checks/types.js";
import type { DimensionScore } from "../scoring/types.js";
import { bar, formatScore, formatPercent, formatDateTimePtBR } from "../util/format.js";
import { topGaps } from "../scoring/gaps.js";
import { recommendationFor } from "../recommendations/catalog.js";

/** Gera o HARNESS-REPORT.md completo (humano). */
export function buildMarkdownReport(
  ctx: RepoContext,
  audit: AuditResult,
  generatedAt: Date,
): string {
  const { score } = audit;
  const L: string[] = [];

  L.push(`# Harness Report — ${ctx.git.repoName}`);
  L.push("");
  L.push(
    `Gerado por harness-audit v${VERSION} em ${formatDateTimePtBR(generatedAt)} · ` +
      `perfil: ${t(`profile.${ctx.profile}`)}`,
  );
  L.push("");
  L.push(`> ${t("app.privacy")}`);
  L.push("");

  // Resumo
  L.push("## Resumo");
  L.push("");
  L.push(
    `**Harness Score: ${formatScore(score.global)} / 4 · ${t(`level.${score.level}`)}** — ` +
      `confiança ${formatPercent(score.confidence)} baseada em evidência.`,
  );
  L.push("");
  L.push("| Dimensão | Score | Barra | Origem |");
  L.push("|---|---|---|---|");
  for (const d of score.dimensions) {
    const value = d.score === null ? t("report.dimNa") : formatScore(d.score);
    const b = d.score === null ? bar(0, 4) : bar(d.score, 4);
    const seals = d.seals.length ? d.seals.map((s) => t(`seal.${s}`)).join("+") : "—";
    L.push(`| ${d.dimension} ${t(`dim.${d.dimension}`)} | ${value} | \`${b}\` | ${seals} |`);
  }
  L.push("");

  // Top lacunas
  const allResults = score.dimensions.flatMap((d) => d.results);
  const gaps = topGaps(allResults, 3);
  if (gaps.length > 0) {
    L.push(`## ${t("report.topGaps", { n: gaps.length })}`);
    L.push("");
    gaps.forEach((g, i) => {
      const summary = g.result.summaryKey
        ? t(g.result.summaryKey, g.result.summaryParams)
        : t(`check.${g.result.checkId}.title`);
      L.push(`${i + 1}. ${summary} — **${g.recommendationId}**`);
    });
    L.push("");
  }

  // Detalhe por dimensão
  L.push("## Detalhe por dimensão");
  L.push("");
  for (const d of score.dimensions) {
    L.push(renderDimensionSection(d));
  }

  // Método / limites
  L.push("## Método e limites");
  L.push("");
  L.push(
    "Cada resultado carrega um selo de origem: **evidência** (lido do repo), " +
      "**proxy** (inferido de padrões do histórico) e **autorrelato** (respondido na sessão). " +
      "Proxies e autorrelato entram no score mas rebaixam a confiança. Checks não aplicáveis " +
      "(stack não suportada, histórico insuficiente, autorrelato não respondido) saem do " +
      "denominador — nunca contam como zero.",
  );
  L.push("");
  L.push(
    "Nesta versão, \"PRs\" são aproximados por commits e o parsing completo de CI cobre apenas " +
      "GitHub Actions.",
  );
  L.push("");

  // Fontes conceituais
  L.push("## Fontes conceituais");
  L.push("");
  L.push("- **Böckeler** · *Harness Engineering* (martinfowler.com / Thoughtworks)");
  L.push("- **CoALA** · taxonomia de memória de agente (arXiv:2309.02427)");
  L.push("- **Spec-Driven Development** · Spec Kit, AWS Kiro, OpenSpec");
  L.push("");

  return L.join("\n");
}

function renderDimensionSection(d: DimensionScore): string {
  const L: string[] = [];
  const value = d.score === null ? t("report.dimNa") : `${formatScore(d.score)}/4`;
  L.push(`### ${d.dimension} ${t(`dim.${d.dimension}`)} — ${value}`);
  L.push("");
  for (const r of d.results) {
    L.push(renderCheck(r));
  }
  L.push("");
  return L.join("\n");
}

function renderCheck(r: CheckResult): string {
  const L: string[] = [];
  const title = t(`check.${r.checkId}.title`);
  const statusTag =
    r.status === "measured"
      ? `${r.points}/${r.max}`
      : r.status === "not-applicable"
        ? "n/d"
        : "não preparado";
  L.push(`- **${r.checkId}** ${title} · ${t(`seal.${r.seal}`)} · ${statusTag}`);
  for (const e of r.evidences) {
    const loc = e.file ? ` (\`${e.file}${e.line ? `:${e.line}` : ""}\`)` : "";
    L.push(`  - ${t(e.detailKey, e.params)}${loc}`);
  }
  if (r.recommendationId) {
    const rec = recommendationFor(r.checkId);
    if (rec) {
      L.push(`  - 💡 **${rec.id}** ${t(rec.textKey)} — _${t(`source.${rec.source}`)}_`);
    }
  }
  return L.join("\n");
}
