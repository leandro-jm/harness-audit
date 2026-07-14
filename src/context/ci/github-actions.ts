import { parse as parseYaml } from "yaml";
import type { FileIndex } from "../file-index.js";
import { classifySensors, type CiModel, type CiStep } from "./ci-model.js";

/**
 * Parse completo de GitHub Actions (v0.1): lê todos os workflows, achata
 * jobs→steps e detecta o gatilho pull_request.
 */
export function parseGithubActions(files: FileIndex, workflowFiles: string[]): CiModel {
  const steps: CiStep[] = [];
  let runsOnPullRequest = false;

  for (const wf of workflowFiles) {
    const raw = files.read(wf);
    if (raw == null) continue;
    let doc: unknown;
    try {
      doc = parseYaml(raw);
    } catch {
      continue;
    }
    if (doc == null || typeof doc !== "object") continue;
    const workflow = doc as Record<string, unknown>;

    // O campo `on` vira `true` (boolean) quando o YAML tem a chave `on:` sem valor
    // aninhado, porque YAML 1.1 interpreta "on" como booleano. `yaml` expõe ambos.
    const onField = workflow["on"] ?? workflow[true as unknown as string];
    if (triggersPullRequest(onField)) runsOnPullRequest = true;

    const jobs = workflow.jobs;
    if (jobs == null || typeof jobs !== "object") continue;
    for (const [jobName, jobRaw] of Object.entries(jobs as Record<string, unknown>)) {
      if (jobRaw == null || typeof jobRaw !== "object") continue;
      const job = jobRaw as Record<string, unknown>;
      const jobSteps = job.steps;
      if (!Array.isArray(jobSteps)) continue;
      for (const stepRaw of jobSteps) {
        if (stepRaw == null || typeof stepRaw !== "object") continue;
        const step = stepRaw as Record<string, unknown>;
        steps.push({
          workflow: wf,
          job: jobName,
          name: typeof step.name === "string" ? step.name : undefined,
          run: typeof step.run === "string" ? step.run : undefined,
          uses: typeof step.uses === "string" ? step.uses : undefined,
        });
      }
    }
  }

  return {
    provider: "github-actions",
    fullyParsed: true,
    workflowFiles,
    runsOnPullRequest,
    steps,
    ...classifySensors(steps),
  };
}

function triggersPullRequest(onField: unknown): boolean {
  if (onField == null) return false;
  if (typeof onField === "string") return onField === "pull_request";
  if (Array.isArray(onField)) return onField.includes("pull_request");
  if (typeof onField === "object") {
    return Object.prototype.hasOwnProperty.call(onField, "pull_request");
  }
  return false;
}
