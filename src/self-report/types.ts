/**
 * Respostas das perguntas de autorrelato (rotuladas [autorrelato] na UI).
 * Em --ci (v0.2) `answered` é false e cada resposta fica undefined → o check
 * correspondente sai do denominador (não vira zero).
 */
export interface SelfReportAnswers {
  answered: boolean;
  /** 1.5 — existe rastro de plan/tasks derivando da spec? */
  tasksFromSpec?: "yes" | "partial" | "no";
  /** 3.6 — sensores bloqueiam merge (branch protection)? */
  sensorsBlockMerge?: "block" | "inform" | "unknown";
  /** 5.3 — erro novo vira regra nova no guia? */
  learningsToGuide?: "yes" | "sometimes" | "no";
  /** 6.3 — pergunta-assinatura: o que o time conserta primeiro? */
  fixFirst?: "code" | "prompt" | "guide-or-sensor";
  /** 6.4 — harness tem dono com backlog? */
  harnessOwner?: "yes-backlog" | "informal" | "none";
  /** 7.7 — vuln nova vira regra/sensor da classe inteira? */
  vulnToRule?: "yes" | "sometimes" | "no";
}

export const EMPTY_SELF_REPORT: SelfReportAnswers = { answered: false };
