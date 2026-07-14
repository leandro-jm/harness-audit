import { PROFILES } from "../../core/types.js";
import type { Check } from "../types.js";
import { evidence, measured, type CheckMeta } from "../result.js";
import { DEVCONTAINER_GLOBS, DOCKER_GLOBS } from "../patterns.js";

const META: CheckMeta = { id: "4.1", dimension: "D4", kind: "evidence" };

/**
 * 4.1 · Execução isolada disponível.
 * devcontainer/gitpod → 2 (ambiente reproduzível declarado) · só Dockerfile/
 * compose → 1 · nada → 0.
 */
export const check41: Check = {
  ...META,
  profiles: PROFILES,
  weight: 1,
  titleKey: "check.4.1.title",
  run(ctx) {
    const devcontainer = ctx.files.find(DEVCONTAINER_GLOBS);
    const docker = ctx.files.find(DOCKER_GLOBS);

    let points = 0;
    const evidences = [];
    if (devcontainer.length > 0) {
      points = 2;
      evidences.push(
        evidence("check.4.1.devcontainer", "evidence", {
          file: devcontainer[0],
          params: { file: devcontainer[0]! },
        }),
      );
    } else if (docker.length > 0) {
      points = 1;
      evidences.push(
        evidence("check.4.1.docker", "evidence", { file: docker[0], params: { file: docker[0]! } }),
      );
    } else {
      evidences.push(evidence("check.4.1.none", "evidence"));
    }

    return measured(META, {
      points,
      evidences,
      summaryKey: points < 2 ? "check.4.1.weak" : undefined,
    });
  },
};
