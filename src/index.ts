// API programática (usada por testes e pelo modo org).
// Reexporta a partir dos módulos internos conforme forem sendo construídos.
export { VERSION, NAME } from "./version.js";
export { loadRepoContext, type RepoContext } from "./context/repo-context.js";
export { runAudit, type AuditResult } from "./app/run-audit.js";
export { computeScore } from "./scoring/engine.js";
export { auditRepos, buildOrgJson, type OrgRow } from "./app/org.js";
export type { Score } from "./scoring/types.js";
