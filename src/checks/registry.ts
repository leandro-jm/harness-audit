import type { Profile } from "../core/types.js";
import type { Check } from "./types.js";
import { check11 } from "./d1-spec/1.1.js";
import { check12 } from "./d1-spec/1.2.js";
import { check13 } from "./d1-spec/1.3.js";
import { check14 } from "./d1-spec/1.4.js";
import { check15 } from "./d1-spec/1.5.js";
import { check21 } from "./d2-guides/2.1.js";
import { check22 } from "./d2-guides/2.2.js";
import { check23 } from "./d2-guides/2.3.js";
import { check24 } from "./d2-guides/2.4.js";
import { check31 } from "./d3-sensors/3.1.js";
import { check32 } from "./d3-sensors/3.2.js";
import { check33 } from "./d3-sensors/3.3.js";
import { check34 } from "./d3-sensors/3.4.js";
import { check35 } from "./d3-sensors/3.5.js";
import { check36 } from "./d3-sensors/3.6.js";
import { check41 } from "./d4-guardrails/4.1.js";
import { check42 } from "./d4-guardrails/4.2.js";
import { check43 } from "./d4-guardrails/4.3.js";
import { check44 } from "./d4-guardrails/4.4.js";
import { check51 } from "./d5-memory/5.1.js";
import { check52 } from "./d5-memory/5.2.js";
import { check53 } from "./d5-memory/5.3.js";
import { check61 } from "./d6-steering/6.1.js";
import { check62 } from "./d6-steering/6.2.js";
import { check63 } from "./d6-steering/6.3.js";
import { check64 } from "./d6-steering/6.4.js";

/**
 * Catálogo de todos os checks (PRD §7.4). Ponto de extensão único: novos checks
 * (inclusive a trilha de runtime harness da v1.0) entram aqui sem tocar o core.
 */
export const ALL_CHECKS: Check[] = [
  check11, check12, check13, check14, check15,
  check21, check22, check23, check24,
  check31, check32, check33, check34, check35, check36,
  check41, check42, check43, check44,
  check51, check52, check53,
  check61, check62, check63, check64,
];

/** Checks aplicáveis a um perfil. */
export function forProfile(profile: Profile): Check[] {
  return ALL_CHECKS.filter((c) => c.profiles.includes(profile));
}

const TITLE_BY_ID = new Map(ALL_CHECKS.map((c) => [c.id, c.titleKey]));

/** Chave i18n do título de um check (para relatórios/lacunas). */
export function checkTitleKey(checkId: string): string | undefined {
  return TITLE_BY_ID.get(checkId);
}
