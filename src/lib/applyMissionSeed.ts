import { UnpolProjectData, MissionProfile, PestelsItem, Stakeholder, CbdCell } from '../types';
import { MissionExplorerEntry, PlanningContext } from '../types/explorer';
import { defaultPestelsData } from '../data/pestelsCategories';
import { emptyPriorityBrief } from './storage';
import { APP_VERSION } from './version';
import { EMPTY_ANALYSIS_SYNTHESIS } from './analysisSynthesis';
import { resolvePlanningContext } from './planningContext';

/**
 * Initializes an UnpolProjectData workspace from a canonical PlanningContext v2.
 *
 * Core Governing Rule:
 * PLANNING CONTEXT ≠ ANALYST ANALYSIS
 *
 * - Real-world contexts: Prefills reference identity, mandate summary, and host-state institution;
 *   leaves conflictContext, planningPurpose, PESTEL findings, stakeholders, SWOT/TOWS, CBD cells,
 *   and results completely blank for the analyst.
 * - Fictional contexts: Prefills Stage 1 scenario narrative facts, but all analytical stages
 *   (PESTEL findings, evaluated stakeholders, SWOT, CBD matrix, results) remain blank.
 * - Technical baseline ratings: impact=3, urgency=3, confidence=1, relevance=3.
 */
export function initializeFromContext(context: PlanningContext): UnpolProjectData {
  const isFictional = context.operationalStatus === 'fictional' || Boolean(context.scenarioNarrative);
  const primarySource = context.provenance.sources[0];

  const profile: MissionProfile = {
    countryName: context.identity.countryArea,
    missionName: context.identity.missionAcronym
      ? `${context.identity.missionAcronym} - ${context.identity.missionName}`
      : context.identity.missionName,
    region: context.identity.region,
    mandateEnvironment: isFictional
      ? (context.scenarioNarrative?.mandateEnvironment ?? '')
      : context.reference.mandateSummary.text,
    hostStatePolice: context.reference.hostStatePolice.text,
    conflictContext: isFictional
      ? (context.scenarioNarrative?.conflictContext ?? '')
      : '',
    planningPurpose: isFictional
      ? (context.scenarioNarrative?.planningPurpose ?? '')
      : '',
    assessmentDate: new Date().toISOString().split('T')[0],
    analystName: '',
    templateId: context.id,
    sourceCategory: context.identity.sourceCategory,
    coverageScope: context.provenance.coverageScope,
    sourceUrl: primarySource?.url ?? null,
    sourceDate: primarySource?.publicationDate ?? null,
    profileLastReviewed: context.provenance.profileLastReviewed
  };

  // Technical baseline ratings (impact=3, urgency=3, confidence=1, relevance=3)
  // All analyst finding/why/sequencing strings start empty
  const pestels = JSON.parse(JSON.stringify(defaultPestelsData)) as Record<string, PestelsItem>;
  Object.keys(pestels).forEach((key) => {
    const item = pestels[key];
    item.finding = '';
    item.why = '';
    item.sequencing = '';
    item.rating = {
      impact: 3,
      urgency: 3,
      confidence: 1,
      relevance: 3
    };
    item.evidenceNotes = [];
  });

  // Stakeholders: strictly empty array
  const stakeholders: Stakeholder[] = [];

  // CBD matrix: strictly empty record
  const customCells: Record<string, CbdCell> = {};

  return {
    profile,
    pestels,
    stakeholders,
    customCells,
    interdependencies: [],
    priorityBrief: {
      ...JSON.parse(JSON.stringify(emptyPriorityBrief)),
      topPriorities: [],
      quickWins: [],
      sensitiveReforms: [],
      longerTermReforms: [],
      risksAssumptions: [],
      sequencingRecommendation: ''
    },
    analysisSynthesis: JSON.parse(JSON.stringify(EMPTY_ANALYSIS_SYNTHESIS)),
    version: APP_VERSION
  };
}

/**
 * Backward compatibility wrapper for current UI components (e.g. AppShell).
 */
export function applyMissionSeed(entry: MissionExplorerEntry): UnpolProjectData {
  const context = resolvePlanningContext(entry.id);
  if (context) {
    return initializeFromContext(context);
  }

  // Fallback for custom or unmapped entries
  const fallbackContext: PlanningContext = {
    schemaVersion: 2,
    id: entry.id,
    legacyIds: [],
    identity: {
      countryArea: entry.country,
      iso3: entry.iso3 || null,
      region: entry.region,
      missionName: entry.missionName,
      missionAcronym: entry.missionAcronym,
      missionType: entry.missionType,
      sourceCategory: entry.sourceCategory
    },
    operationalStatus: entry.isFictionalScenario ? 'fictional' : 'active',
    verificationStatus: entry.isFictionalScenario ? 'training-only' : 'review-required',
    provenance: {
      sources: entry.sourceUrl
        ? [
            {
              id: `src-${entry.id}`,
              title: entry.sourceNote || entry.missionName,
              organization: 'UN',
              sourceType: 'official-portal',
              url: entry.sourceUrl,
              publicationDate: entry.sourceDate,
              reviewedDate: entry.profileLastReviewed,
              supports: ['mandateSummary']
            }
          ]
        : [],
      profileLastReviewed: entry.profileLastReviewed,
      coverageScope: entry.coverageScope,
      limitations: entry.sourceNote ? [entry.sourceNote] : []
    },
    reference: {
      mandateSummary: {
        text: entry.starterProfile?.mandateEnvironment || '',
        sourceIds: entry.sourceUrl ? [`src-${entry.id}`] : []
      },
      policeRelevance: {
        text: '',
        sourceIds: []
      },
      hostStatePolice: {
        text: entry.hostStatePoliceInstitution || '',
        sourceIds: []
      },
      planningThemes: entry.planningThemes || []
    },
    planningPrompts: {
      stage1Guidance: {
        mandateEnvironmentPrompt: entry.starterProfile?.mandateEnvironment,
        conflictContextPrompt: entry.starterProfile?.conflictContext,
        planningPurposePrompt: entry.starterProfile?.planningPurpose
      },
      pestelsPrompts: entry.starterPestelsPrompts || {},
      stakeholderPrompts: entry.starterStakeholderPrompts || [],
      suggestedStakeholderCategories: entry.suggestedStakeholderCategories || []
    },
    ...(entry.isFictionalScenario
      ? {
          scenarioNarrative: {
            mandateEnvironment: entry.starterProfile?.mandateEnvironment,
            conflictContext: entry.starterProfile?.conflictContext,
            planningPurpose: entry.starterProfile?.planningPurpose
          }
        }
      : {})
  };

  return initializeFromContext(fallbackContext);
}
