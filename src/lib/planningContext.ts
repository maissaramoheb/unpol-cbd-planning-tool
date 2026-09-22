import { CANONICAL_PLANNING_CONTEXTS } from '../data/planningContexts';
import { PlanningContext } from '../types/explorer';
import { UnpolProjectData } from '../types';

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

/**
 * Pure helper to check whether a project workspace contains meaningful analyst work.
 * Does NOT flag freshly initialized workspaces (where findings are empty, stakeholders are empty, etc.).
 */
export function hasMeaningfulWork(data: UnpolProjectData | null | undefined): boolean {
  if (!data) return false;

  // 1. Check PESTEL-S findings
  if (data.pestels) {
    const hasPestelFinding = Object.values(data.pestels).some(
      (item) => typeof item.finding === 'string' && item.finding.trim() !== ''
    );
    if (hasPestelFinding) return true;
  }

  // 2. Check stakeholders
  if (Array.isArray(data.stakeholders) && data.stakeholders.length > 0) {
    return true;
  }

  // 3. Check CBD custom cells
  if (data.customCells && Object.keys(data.customCells).length > 0) {
    return true;
  }

  // 4. Check SWOT / TOWS analysis synthesis
  if (data.analysisSynthesis) {
    if (data.analysisSynthesis.swotFindings && data.analysisSynthesis.swotFindings.length > 0) {
      return true;
    }
    if (data.analysisSynthesis.strategicOptions && data.analysisSynthesis.strategicOptions.length > 0) {
      return true;
    }
  }

  // 5. Check Interdependencies
  if (Array.isArray(data.interdependencies) && data.interdependencies.length > 0) {
    return true;
  }

  // 6. Check Priority Brief
  if (data.priorityBrief) {
    if (data.priorityBrief.topPriorities && data.priorityBrief.topPriorities.length > 0) return true;
    if (data.priorityBrief.quickWins && data.priorityBrief.quickWins.length > 0) return true;
    if (data.priorityBrief.sensitiveReforms && data.priorityBrief.sensitiveReforms.length > 0) return true;
    if (data.priorityBrief.longerTermReforms && data.priorityBrief.longerTermReforms.length > 0) return true;
    if (data.priorityBrief.risksAssumptions && data.priorityBrief.risksAssumptions.length > 0) return true;
    if (typeof data.priorityBrief.sequencingRecommendation === 'string' && data.priorityBrief.sequencingRecommendation.trim() !== '') {
      return true;
    }
  }

  return false;
}
