import { CANONICAL_PLANNING_CONTEXTS } from '../data/planningContexts';
import { PlanningContext } from '../types/explorer';

const CONTEXT_BY_ID = new Map<string, PlanningContext>();
const CONTEXT_BY_ALIAS = new Map<string, PlanningContext>();

CANONICAL_PLANNING_CONTEXTS.forEach((context) => {
  CONTEXT_BY_ID.set(context.id, context);
  context.legacyIds.forEach((alias) => {
    CONTEXT_BY_ALIAS.set(alias, context);
  });
});

/**
 * Resolves a PlanningContext by canonical ID or known legacy alias.
 * Returns null for unknown, empty, or unmapped IDs without throwing.
 */
export function resolvePlanningContext(idOrAlias: string | null | undefined): PlanningContext | null {
  if (!idOrAlias) return null;
  const direct = CONTEXT_BY_ID.get(idOrAlias);
  if (direct) return direct;
  const aliased = CONTEXT_BY_ALIAS.get(idOrAlias);
  if (aliased) return aliased;
  return null;
}

/**
 * Returns all 18 canonical PlanningContext records.
 */
export function getAllPlanningContexts(): PlanningContext[] {
  return CANONICAL_PLANNING_CONTEXTS;
}

/**
 * Pure helper to extract planning prompts and guidance from a context.
 */
export function getPlanningContextGuidance(context: PlanningContext) {
  return context.planningPrompts;
}
