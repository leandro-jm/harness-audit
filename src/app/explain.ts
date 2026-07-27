import { ALL_CHECKS } from "../checks/registry.js";
import { SEAL_BY_KIND } from "../checks/result.js";
import { DIMENSIONS, PROFILES } from "../core/types.js";
import { recommendationFor } from "../recommendations/catalog.js";
import { t } from "../i18n/index.js";
import { colors } from "../util/colors.js";

/**
 * `harness-audit checks [id]` — lista os checks (ou detalha um), com dimensão,
 * selo de origem e fonte conceitual. Transparência total: o que cada critério
 * mede e de onde vem o lastro (honestidade de medição, PRD §5).
 */
export function runExplain(checkId?: string): number {
  if (checkId) return explainOne(checkId);

  process.stdout.write(colors.bold(t("explain.title", { n: ALL_CHECKS.length })) + "\n");
  for (const dim of DIMENSIONS) {
    const checks = ALL_CHECKS.filter((c) => c.dimension === dim);
    if (checks.length === 0) continue;
    process.stdout.write("\n" + colors.bold(`${dim} ${t(`dim.${dim}`)}`) + "\n");
    for (const c of checks) {
      const seal = colors.dim(t(`seal.${SEAL_BY_KIND[c.kind]}`).padEnd(11));
      const scope =
        c.profiles.length < PROFILES.length ? colors.dim(` [${c.profiles.join(", ")}]`) : "";
      process.stdout.write(` ${c.id.padEnd(4)} ${seal} ${t(c.titleKey)}${scope}\n`);
    }
  }
  return 0;
}

function explainOne(id: string): number {
  const c = ALL_CHECKS.find((ch) => ch.id === id);
  if (!c) {
    process.stderr.write(t("explain.notFound", { id }) + "\n");
    return 2;
  }
  const rec = recommendationFor(id);
  const L: string[] = [];
  L.push(colors.bold(`${c.id} ${t(c.titleKey)}`));
  L.push(`${t("explain.dimension")}: ${c.dimension} ${t(`dim.${c.dimension}`)}`);
  L.push(`${t("explain.kind")}: ${t(`seal.${SEAL_BY_KIND[c.kind]}`)}`);
  const scope = c.profiles.length < PROFILES.length ? c.profiles.join(", ") : t("explain.profilesAll");
  L.push(`${t("explain.profiles")}: ${scope}`);
  if (rec) {
    L.push(`${t("explain.source")}: ${t(`source.${rec.source}`)}`);
    L.push(`${t("explain.recommendation")}: ${t(rec.textKey)}`);
  }
  process.stdout.write(L.join("\n") + "\n");
  return 0;
}
