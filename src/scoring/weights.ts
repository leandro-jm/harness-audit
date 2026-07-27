import type { DimensionId, Profile } from "../core/types.js";

/**
 * Presets FIXOS e versionados de peso por dimensão na média global (PRD §14.2).
 * NÃO são editáveis pelo usuário: peso na mão viraria métrica de vaidade e
 * quebraria a comparabilidade entre repositórios. Mudanças aqui exigem bump de
 * schemaVersion.
 *
 * `built-by-ai` é uniforme (baseline). Os demais perfis dão mais peso às
 * dimensões que mais importam para o seu risco:
 *   - `uses-ai`: Guardrails (D4) e Segurança (D7) — IA em runtime eleva o risco.
 *   - `both`: mesma ênfase, mais suave.
 *   - `conventional`: Segurança (D7) e Sensores (D3) — o que já vale sem IA.
 */
const WEIGHTS: Record<Profile, Partial<Record<DimensionId, number>>> = {
  "built-by-ai": {},
  "uses-ai": { D4: 1.5, D7: 1.5 },
  both: { D4: 1.25, D7: 1.25 },
  conventional: { D7: 1.5, D3: 1.25 },
};

/** Peso da dimensão na média global para o perfil (default 1). */
export function dimensionWeight(profile: Profile | undefined, dim: DimensionId): number {
  if (profile == null) return 1;
  return WEIGHTS[profile]?.[dim] ?? 1;
}
