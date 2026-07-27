import { spawnSync } from "node:child_process";

/**
 * Leitura opcional e OPT-IN de branch protection via `gh` (--github). É a única
 * exceção ao "zero rede" do produto (SECURITY.md): não roda código do repo,
 * apenas consulta a API do GitHub usando o `gh` já autenticado do usuário.
 * Degrada para null (→ autorrelato) se o `gh` faltar, não estiver autenticado
 * ou a chamada falhar — nunca quebra a auditoria.
 */
export interface GithubProtection {
  /** true se a branch tem regra de proteção configurada. */
  protectionExists: boolean;
  /** true se há required status checks (sensores bloqueiam o merge). */
  blocksMerge: boolean;
  /** true se exige pull request review. */
  requiresReview: boolean;
}

function hasGh(cwd: string): boolean {
  const v = spawnSync("gh", ["--version"], { cwd, encoding: "utf8", timeout: 5_000 });
  return !v.error && v.status === 0;
}

export function loadGithubProtection(branch: string, cwd: string): GithubProtection | null {
  if (!branch || !hasGh(cwd)) return null;
  const res = spawnSync(
    "gh",
    ["api", `repos/{owner}/{repo}/branches/${branch}/protection`],
    { cwd, encoding: "utf8", timeout: 10_000 },
  );
  if (res.error) return null;

  if (res.status === 0) {
    try {
      const j = JSON.parse(res.stdout) as Record<string, unknown>;
      return {
        protectionExists: true,
        blocksMerge: j.required_status_checks != null,
        requiresReview: j.required_pull_request_reviews != null,
      };
    } catch {
      return null;
    }
  }

  // 404 / "not protected" = repo alcançado, sem proteção → evidência de que não bloqueia.
  const err = `${res.stderr ?? ""}${res.stdout ?? ""}`;
  if (/404|not found|not protected|branch not protected/i.test(err)) {
    return { protectionExists: false, blocksMerge: false, requiresReview: false };
  }
  // Auth/erro de rede/outro → desconhecido (cai para autorrelato).
  return null;
}
