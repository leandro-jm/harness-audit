import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, notApplicable, type CheckMeta } from "../result.js";
import { LOCKFILE_GLOBS, MANIFEST_GLOBS, SBOM_GLOBS } from "../patterns.js";
import { hasUnpinnedDeps } from "../shared/security.js";

const META: CheckMeta = { id: "7.4", dimension: "D7", kind: "evidence" };

/**
 * 7.4 · Higiene de supply chain (NIST SSDF PS.3). Lockfile commitado + integridade
 * de pinning; bônus por SBOM. 0 = sem lockfile · 1 = lockfile · 2 = lockfile +
 * pinning íntegro (ou SBOM). N/A se não há manifesto de dependência.
 */
export const check74: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.7.4.title",
  run(ctx) {
    if (!ctx.files.exists(MANIFEST_GLOBS)) {
      return notApplicable(META, "check.7.4.noManifest");
    }

    const lockfile = ctx.files.find(LOCKFILE_GLOBS)[0];
    if (!lockfile) {
      return measured(META, {
        points: 0,
        evidences: [evidence("check.7.4.noLockfile", "evidence")],
        summaryKey: "check.7.4.noLockfile",
      });
    }

    const sbom = ctx.files.find(SBOM_GLOBS)[0];
    const unpinned = hasUnpinnedDeps(ctx);

    if (sbom || !unpinned) {
      const evidences = [evidence("check.7.4.lockfile", "evidence", { file: lockfile, params: { file: lockfile } })];
      if (sbom) evidences.push(evidence("check.7.4.sbom", "evidence", { file: sbom, params: { file: sbom } }));
      else evidences.push(evidence("check.7.4.pinned", "evidence"));
      return measured(META, { points: 2, evidences });
    }

    return measured(META, {
      points: 1,
      evidences: [
        evidence("check.7.4.lockfile", "evidence", { file: lockfile, params: { file: lockfile } }),
        evidence("check.7.4.unpinned", "evidence"),
      ],
      summaryKey: "check.7.4.unpinned",
    });
  },
};
