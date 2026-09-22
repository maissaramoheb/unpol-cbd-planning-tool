import { CANONICAL_PLANNING_CONTEXTS } from '../data/planningContexts';
import { defaultMissionTemplates } from '../data/defaultMissionTemplates';
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
 * Compares Stage 1 profile fields against baseline prompts/narratives.
 */
export function hasMeaningfulWork(data: UnpolProjectData | null | undefined): boolean {
  if (!data) return false;

  // 0. Check Stage 1 Mission Profile edits
  if (data.profile) {
    const profile = data.profile;

    // Analyst name entered
    if (typeof profile.analystName === 'string' && profile.analystName.trim() !== '' && profile.analystName.trim() !== 'Participant / Team') {
      return true;
    }

    const context = resolvePlanningContext(profile.templateId);
    if (context) {
      const isFictional = context.operationalStatus === 'fictional' || Boolean(context.scenarioNarrative);
      const baselineMandate = isFictional
        ? (context.scenarioNarrative?.mandateEnvironment ?? '')
        : context.reference.mandateSummary.text;
      const baselineHostPolice = context.reference.hostStatePolice.text;
      const baselineConflict = isFictional
        ? (context.scenarioNarrative?.conflictContext ?? '')
        : '';
      const baselinePurpose = isFictional
        ? (context.scenarioNarrative?.planningPurpose ?? '')
        : '';

      if ((profile.mandateEnvironment ?? '').trim() !== baselineMandate.trim()) {
        return true;
      }
      if ((profile.hostStatePolice ?? '').trim() !== baselineHostPolice.trim()) {
        return true;
      }
      if ((profile.conflictContext ?? '').trim() !== baselineConflict.trim()) {
        return true;
      }
      if ((profile.planningPurpose ?? '').trim() !== baselinePurpose.trim()) {
        return true;
      }
    } else {
      // For blank or legacy/unknown templates, check against default template baselines or placeholder prefixes
      const defaultTemplate = defaultMissionTemplates.find((t) => t.id === profile.templateId);
      if (defaultTemplate) {
        if ((profile.mandateEnvironment ?? '').trim() !== defaultTemplate.profileDefaults.mandateEnvironment.trim()) {
          return true;
        }
        if ((profile.hostStatePolice ?? '').trim() !== defaultTemplate.profileDefaults.hostStatePolice.trim()) {
          return true;
        }
        if ((profile.conflictContext ?? '').trim() !== defaultTemplate.profileDefaults.conflictContext.trim()) {
          return true;
        }
        if ((profile.planningPurpose ?? '').trim() !== defaultTemplate.profileDefaults.planningPurpose.trim()) {
          return true;
        }
      } else {
        // Unknown / unmapped context: conservative detection
        if (profile.planningPurpose && profile.planningPurpose.trim() !== '' && !profile.planningPurpose.startsWith('[PROMPT]')) {
          return true;
        }
        if (profile.conflictContext && profile.conflictContext.trim() !== '' && !profile.conflictContext.startsWith('[ASSUMPTION TO TEST]')) {
          return true;
        }
        if (profile.mandateEnvironment && profile.mandateEnvironment.trim() !== '' && !profile.mandateEnvironment.startsWith('[PROMPT]') && profile.mandateEnvironment !== '...') {
          return true;
        }
        if (profile.hostStatePolice && profile.hostStatePolice.trim() !== '' && !profile.hostStatePolice.includes('to verify')) {
          return true;
        }
      }
    }
  }

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
