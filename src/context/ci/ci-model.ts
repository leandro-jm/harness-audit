export type CiProvider = "github-actions" | "gitlab" | "azure" | "jenkins" | "none";

/** Um passo de CI achatado (a partir dos jobs/steps do provedor). */
export interface CiStep {
  workflow: string;
  job: string;
  name?: string;
  run?: string;
  uses?: string;
}

export interface CiModel {
  provider: CiProvider;
  /** v0.1: só GitHub Actions é parseado por completo. */
  fullyParsed: boolean;
  workflowFiles: string[];
  runsOnPullRequest: boolean;
  steps: CiStep[];
  hasLint: boolean;
  hasTypecheck: boolean;
  hasTest: boolean;
}

export const EMPTY_CI: CiModel = {
  provider: "none",
  fullyParsed: false,
  workflowFiles: [],
  runsOnPullRequest: false,
  steps: [],
  hasLint: false,
  hasTypecheck: false,
  hasTest: false,
};

// Classificadores de sensor: casam a string de comando (run) ou a action (uses).
const LINT_RE = /\beslint\b|\bbiome\b|\bruff\b|\bstandardjs?\b|(?:run|pnpm|yarn|npm)\s+lint|prettier\s+(?:--check|-c)\b|\blint\b/i;
const TYPECHECK_RE = /\btsc\b|\bvue-tsc\b|\btype-?check\b|\bmypy\b|\bpyright\b|--noEmit/i;
const TEST_RE = /\bvitest\b|\bjest\b|\bplaywright\b|\bmocha\b|\bcypress\b|\bpytest\b|\bgo\s+test\b|(?:run|pnpm|yarn|npm)\s+test|npm\s+t\b|\btest\b/i;

const LINT_USES = /super-linter|reviewdog|megalinter|ruff-action|eslint/i;
const TYPECHECK_USES = /pyright/i;
const TEST_USES = /playwright|cypress-io|vitest/i;

function stepMatches(step: CiStep, runRe: RegExp, usesRe: RegExp): boolean {
  if (step.run && runRe.test(step.run)) return true;
  if (step.uses && usesRe.test(step.uses)) return true;
  return false;
}

/** Deriva hasLint/hasTypecheck/hasTest a partir dos passos. */
export function classifySensors(steps: CiStep[]): {
  hasLint: boolean;
  hasTypecheck: boolean;
  hasTest: boolean;
} {
  return {
    hasLint: steps.some((s) => stepMatches(s, LINT_RE, LINT_USES)),
    hasTypecheck: steps.some((s) => stepMatches(s, TYPECHECK_RE, TYPECHECK_USES)),
    hasTest: steps.some((s) => stepMatches(s, TEST_RE, TEST_USES)),
  };
}
