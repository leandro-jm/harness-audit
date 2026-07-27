import type { RepoContext } from "../context/repo-context.js";
import type { SelfReportAnswers } from "./types.js";
import { SPEC_GLOBS, TASKS_GLOBS, GUIDE_GLOBS, MANIFEST_GLOBS } from "../checks/patterns.js";

export interface QuestionOption {
  value: string;
  labelKey: string;
}

export interface SelfReportQuestion {
  /** Check correspondente (para rastreio). */
  checkId: string;
  messageKey: string;
  options: QuestionOption[];
  /** Só pergunta quando faz sentido no repo (evita perguntas irrelevantes). */
  isRelevant(ctx: RepoContext): boolean;
  /** Grava a resposta no objeto de respostas. */
  apply(answers: SelfReportAnswers, value: string): void;
}

const isAiProfile = (ctx: RepoContext): boolean => ctx.profile !== "conventional";

/**
 * Perguntas de autorrelato, na ordem do mock (PRD §6.1). O wizard pergunta no
 * máximo 6 (regra de UX §6.2); irrelevantes são puladas.
 */
export const SELF_REPORT_QUESTIONS: SelfReportQuestion[] = [
  {
    checkId: "6.3",
    messageKey: "q.fixFirst",
    options: [
      { value: "code", labelKey: "q.fixFirst.code" },
      { value: "prompt", labelKey: "q.fixFirst.prompt" },
      { value: "guide-or-sensor", labelKey: "q.fixFirst.guide" },
    ],
    isRelevant: isAiProfile,
    apply: (a, v) => (a.fixFirst = v as SelfReportAnswers["fixFirst"]),
  },
  {
    checkId: "6.4",
    messageKey: "q.harnessOwner",
    options: [
      { value: "yes-backlog", labelKey: "q.harnessOwner.backlog" },
      { value: "informal", labelKey: "q.harnessOwner.informal" },
      { value: "none", labelKey: "q.harnessOwner.none" },
    ],
    isRelevant: isAiProfile,
    apply: (a, v) => (a.harnessOwner = v as SelfReportAnswers["harnessOwner"]),
  },
  {
    checkId: "3.6",
    messageKey: "q.sensorsBlockMerge",
    options: [
      { value: "block", labelKey: "q.sensorsBlockMerge.block" },
      { value: "inform", labelKey: "q.sensorsBlockMerge.inform" },
      { value: "unknown", labelKey: "q.sensorsBlockMerge.unknown" },
    ],
    isRelevant: (ctx) => ctx.ci.provider !== "none",
    apply: (a, v) => (a.sensorsBlockMerge = v as SelfReportAnswers["sensorsBlockMerge"]),
  },
  {
    checkId: "5.3",
    messageKey: "q.learningsToGuide",
    options: [
      { value: "yes", labelKey: "q.learningsToGuide.yes" },
      { value: "sometimes", labelKey: "q.learningsToGuide.sometimes" },
      { value: "no", labelKey: "q.learningsToGuide.no" },
    ],
    isRelevant: (ctx) => ctx.files.exists(GUIDE_GLOBS),
    apply: (a, v) => (a.learningsToGuide = v as SelfReportAnswers["learningsToGuide"]),
  },
  {
    checkId: "1.5",
    messageKey: "q.tasksFromSpec",
    options: [
      { value: "yes", labelKey: "q.tasksFromSpec.yes" },
      { value: "partial", labelKey: "q.tasksFromSpec.partial" },
      { value: "no", labelKey: "q.tasksFromSpec.no" },
    ],
    // Só pergunta se há specs mas nenhum rastro de tarefas (senão vira evidência).
    isRelevant: (ctx) => ctx.files.exists(SPEC_GLOBS) && !ctx.files.exists(TASKS_GLOBS),
    apply: (a, v) => (a.tasksFromSpec = v as SelfReportAnswers["tasksFromSpec"]),
  },
  {
    // 7.7 — cross-perfil (segurança vale para todos). Única pergunta nova da D7.
    checkId: "7.7",
    messageKey: "q.vulnToRule",
    options: [
      { value: "yes", labelKey: "q.vulnToRule.yes" },
      { value: "sometimes", labelKey: "q.vulnToRule.sometimes" },
      { value: "no", labelKey: "q.vulnToRule.no" },
    ],
    // Só pergunta em repo com dependências (onde vuln de terceiros faz sentido).
    isRelevant: (ctx) => ctx.files.exists(MANIFEST_GLOBS),
    apply: (a, v) => (a.vulnToRule = v as SelfReportAnswers["vulnToRule"]),
  },
];

const MAX_QUESTIONS = 6; // regra de UX §6.2

/** Perguntas relevantes ao contexto, respeitando o teto de 6. */
export function relevantQuestions(ctx: RepoContext): SelfReportQuestion[] {
  return SELF_REPORT_QUESTIONS.filter((q) => q.isRelevant(ctx)).slice(0, MAX_QUESTIONS);
}
