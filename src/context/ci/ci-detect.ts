import type { FileIndex } from "../file-index.js";
import { EMPTY_CI, type CiModel, type CiProvider } from "./ci-model.js";
import { parseGithubActions } from "./github-actions.js";

/**
 * Detecta o provedor de CI e, quando for GitHub Actions, faz o parse completo.
 * Outros provedores são detectados mas marcados como parcialmente parseados (v0.1).
 */
export function detectCi(files: FileIndex): CiModel {
  const workflows = files.find([".github/workflows/*.yml", ".github/workflows/*.yaml"]);
  if (workflows.length > 0) {
    return parseGithubActions(files, workflows);
  }

  const other = detectOtherProvider(files);
  if (other === "none") return EMPTY_CI;

  // Detectado mas sem parse completo na v0.1 (arquitetura de adapter, PRD §12).
  return { ...EMPTY_CI, provider: other, fullyParsed: false };
}

function detectOtherProvider(files: FileIndex): CiProvider {
  if (files.exists([".gitlab-ci.yml", ".gitlab-ci.yaml"])) return "gitlab";
  if (files.exists(["azure-pipelines.yml", "azure-pipelines.yaml", ".azure-pipelines.yml"]))
    return "azure";
  if (files.exists(["Jenkinsfile", "**/Jenkinsfile"])) return "jenkins";
  return "none";
}
