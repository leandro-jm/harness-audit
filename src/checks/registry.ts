import type { Profile } from "../core/types.js";
import type { Check } from "./types.js";
import { check21 } from "./d2-guides/2.1.js";
import { check31 } from "./d3-sensors/3.1.js";

/**
 * Catálogo de todos os checks. Ponto de extensão único: novos checks (inclusive
 * a trilha de runtime harness da v1.0) entram aqui sem tocar o core.
 * Ordenado por dimensão/ID para leitura estável.
 */
export const ALL_CHECKS: Check[] = [
  // D2
  check21,
  // D3
  check31,
];

/** Checks aplicáveis a um perfil. */
export function forProfile(profile: Profile): Check[] {
  return ALL_CHECKS.filter((c) => c.profiles.includes(profile));
}
