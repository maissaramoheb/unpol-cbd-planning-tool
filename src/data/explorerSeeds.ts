import { CANONICAL_PLANNING_CONTEXTS } from './planningContexts';
import { MissionExplorerEntry, PlanningContext } from '../types/explorer';

export const PEACEKEEPING_REFERENCE_NOTICE =
  'Official reference coverage reflects the active UN peacekeeping operations roster reviewed in June 2026.';

export const EXPLORER_DISCLAIMER =
  'Planning Context Explorer data provides reference context and guidance prompts for planning exercises. It does not replace independent mandate verification, field assessment, or official UN reporting.';

/**
 * Adapter converting canonical PlanningContext v2 records into legacy MissionExplorerEntry
 * format for backward compatibility with the current Explorer UI components.
 */
export function planningContextToExplorerEntry(ctx: PlanningContext): MissionExplorerEntry {
  const isFictional = ctx.operationalStatus === 'fictional';
  const primarySource = ctx.provenance.sources[0];

  return {
    id: ctx.id,
    country: ctx.identity.countryArea,
    iso3: ctx.identity.iso3 ?? '',
    region: ctx.identity.region,
    coordinates: ctx.geography ? { x: 50, y: 50 } : { x: 0, y: 0 },
    missionName: ctx.identity.missionName,
    missionAcronym: ctx.identity.missionAcronym,
    missionType: ctx.identity.missionType,
    sourceCategory: ctx.identity.sourceCategory,
    coverageScope: ctx.provenance.coverageScope,
    status: isFictional
      ? 'template'
      : ctx.verificationStatus === 'review-required'
      ? 'verification-required'
      : 'active',
    isFictionalScenario: isFictional,
    isOfficial: false,
    sourceDate: primarySource?.publicationDate ?? null,
    profileLastReviewed: ctx.provenance.profileLastReviewed,
    sourceUrl: primarySource?.url ?? null,
    sourceNote: ctx.provenance.limitations.join(' ') || (primarySource ? `${primarySource.title}.` : ''),
    disclaimer: EXPLORER_DISCLAIMER,
    hostStatePoliceInstitution: ctx.reference.hostStatePolice,
    planningPurpose: ctx.scenarioNarrative?.planningPurpose ?? '[PROMPT] Define a verified planning purpose...',
    planningThemes: ctx.reference.planningThemes,
    starterProfile: {
      mandateEnvironment:
        ctx.scenarioNarrative?.mandateEnvironment ??
        ctx.planningPrompts.stage1Guidance.mandateEnvironmentPrompt ??
        ctx.reference.mandateSummary,
      conflictContext:
        ctx.scenarioNarrative?.conflictContext ??
        ctx.planningPrompts.stage1Guidance.conflictContextPrompt ??
        '',
      planningPurpose:
        ctx.scenarioNarrative?.planningPurpose ??
        ctx.planningPrompts.stage1Guidance.planningPurposePrompt ??
        ''
    },
    starterPestelsPrompts: ctx.planningPrompts.pestelsPrompts,
    starterStakeholderPrompts: ctx.planningPrompts.stakeholderPrompts,
    suggestedStakeholderCategories: ctx.planningPrompts.suggestedStakeholderCategories
  };
}

export const defaultExplorerSeeds: MissionExplorerEntry[] =
  CANONICAL_PLANNING_CONTEXTS.map(planningContextToExplorerEntry);
