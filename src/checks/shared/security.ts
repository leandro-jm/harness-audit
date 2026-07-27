import type { RepoContext } from "../../context/repo-context.js";
import type { CiStep } from "../../context/ci/ci-model.js";

/**
 * Detectores de sensores de segurança em CI (D7). Como o resto do produto,
 * são 100% estáticos: casam a string de comando (`run`) ou a action (`uses`)
 * dos passos já parseados — nunca executam nada. Só GitHub Actions é parseado
 * por completo (PRD §12), então em outros provedores `steps` vem vazio.
 */

const SAST_RUN = /\bsemgrep\b|\bnjsscan\b|\bbandit\b|\bcodeql\b|\bsnyk\s+code\b/i;
const SAST_USES = /codeql-action|semgrep|njsscan|bandit|snyk/i;

const AUDIT_RUN =
  /\b(?:npm|pnpm|yarn)\s+audit\b|\bosv-scanner\b|\btrivy\b|\bsnyk\s+test\b|\bpip-audit\b|\bgovulncheck\b/i;
const AUDIT_USES = /osv-scanner|trivy-action|snyk\/actions|aquasecurity|pypa\/gh-action-pip-audit/i;

const SECRET_RUN = /\bgitleaks\b|\btrufflehog\b|\bdetect-secrets\b|\bsecretlint\b/i;
const SECRET_USES = /gitleaks|trufflehog|secretlint|detect-secrets/i;

function anyStep(steps: CiStep[], runRe: RegExp, usesRe: RegExp): boolean {
  return steps.some((s) => (s.run != null && runRe.test(s.run)) || (s.uses != null && usesRe.test(s.uses)));
}

export function hasSastInCi(ctx: RepoContext): boolean {
  return anyStep(ctx.ci.steps, SAST_RUN, SAST_USES);
}

export function hasAuditInCi(ctx: RepoContext): boolean {
  return anyStep(ctx.ci.steps, AUDIT_RUN, AUDIT_USES);
}

export function hasSecretScanInCi(ctx: RepoContext): boolean {
  return anyStep(ctx.ci.steps, SECRET_RUN, SECRET_USES);
}

/** Algum sensor de segurança (SAST, SCA/audit ou secret scan) roda no CI. */
export function hasSecuritySensorInCi(ctx: RepoContext): boolean {
  return hasSastInCi(ctx) || hasAuditInCi(ctx) || hasSecretScanInCi(ctx);
}

/** Algum manifesto de dependência traz `git+`/URL não pinada (mina a integridade). */
const UNPINNED_RE = /["']?(?:git\+|https?:\/\/|github:|file:)/i;

export function hasUnpinnedDeps(ctx: RepoContext): boolean {
  const deps = { ...(ctx.pkg?.dependencies ?? {}), ...(ctx.pkg?.devDependencies ?? {}) };
  return Object.values(deps).some((v) => UNPINNED_RE.test(v));
}
