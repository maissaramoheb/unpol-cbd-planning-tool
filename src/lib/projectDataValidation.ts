import {
  CbdCell,
  AnalysisSourceReference,
  AnalysisSynthesis,
  EvidenceNote,
  MissionProfile,
  PestelsItem,
  PriorityBrief,
  StakeholderPosition,
  StrategicOption,
  SwotFinding,
  UnpolProjectData
} from '../types';
import { PESTELS_KEYS } from '../data/pestelsCategories';
import type { MissionCoverageScope, MissionSourceCategory } from '../types/explorer';
import { APP_VERSION } from './version';
import { collectValidSourceKeys, EMPTY_ANALYSIS_SYNTHESIS, sourceReferenceKey } from './analysisSynthesis';

export interface ProjectDataValidationResult {
  data: UnpolProjectData | null;
  error: string | null;
}

const STAKEHOLDER_POSITIONS = new Set<StakeholderPosition>([
  'Enabler',
  'Persuadable',
  'Blocker',
  'Spoiler risk',
  'Neutral / unknown'
]);
const RATING_LEVELS = new Set(['High', 'Medium', 'Low']);
const LEGACY_RATING_LEVELS = new Set(['High', 'Medium', 'Low', 'Variable']);
const CAPACITY_LEVELS = new Set(['High', 'Medium', 'Low', 'Variable']);
const MISSION_SOURCE_CATEGORIES = new Set<MissionSourceCategory>([
  'Current UN Peacekeeping Operation',
  'Special Political Mission',
  'Regional Political Presence',
  'Peacebuilding / Support Context',
  'Fictional Training Scenario',
  'Custom User Context'
]);
const MISSION_COVERAGE_SCOPES = new Set<MissionCoverageScope>([
  'current-peacekeeping-reference',
  'selected-starter',
  'training',
  'custom'
]);
const SWOT_CATEGORIES = new Set(['Strength', 'Weakness', 'Opportunity', 'Threat']);
const STRATEGIC_OPTION_TYPES = new Set(['SO', 'ST', 'WO', 'WT']);
const ANALYSIS_SOURCE_TYPES = new Set(['pestels', 'evidence', 'stakeholder', 'profile']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isRating(value: unknown): value is number {
  return Number.isFinite(value) && Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}

function hasStringFields(value: Record<string, unknown>, fields: string[]): boolean {
  return fields.every((field) => isString(value[field]));
}

function isEvidenceNote(value: unknown): value is EvidenceNote {
  if (!isRecord(value)) return false;

  return (
    hasStringFields(value, ['id', 'sourceTitle', 'sourceType', 'dateVerified', 'comment']) &&
    isRating(value.confidenceLevel)
  );
}

function hasValidEvidenceNotes(value: unknown): boolean {
  return value === undefined || (Array.isArray(value) && value.every(isEvidenceNote));
}

function isMissionProfile(value: unknown): value is MissionProfile {
  if (!isRecord(value)) return false;

  const hasCoreFields = hasStringFields(value, [
    'countryName',
    'missionName',
    'region',
    'mandateEnvironment',
    'hostStatePolice',
    'conflictContext',
    'planningPurpose',
    'assessmentDate',
    'analystName',
    'templateId'
  ]);

  const hasValidSourceCategory =
    value.sourceCategory === undefined ||
    value.sourceCategory === null ||
    MISSION_SOURCE_CATEGORIES.has(value.sourceCategory as MissionSourceCategory);
  const hasValidCoverageScope =
    value.coverageScope === undefined ||
    value.coverageScope === null ||
    MISSION_COVERAGE_SCOPES.has(value.coverageScope as MissionCoverageScope);
  const hasValidOptionalMetadata = ['sourceUrl', 'sourceDate', 'profileLastReviewed'].every(
    (field) => value[field] === undefined || value[field] === null || isString(value[field])
  );

  return hasCoreFields && hasValidSourceCategory && hasValidCoverageScope && hasValidOptionalMetadata;
}

function isPestelsItem(value: unknown): value is PestelsItem {
  if (!isRecord(value) || !isRecord(value.rating)) return false;

  return (
    hasStringFields(value, ['id', 'name', 'definition', 'finding', 'why', 'sequencing']) &&
    isStringArray(value.cbdAreas) &&
    isStringArray(value.dimensions) &&
    isStringArray(value.stakeholders) &&
    isRating(value.rating.impact) &&
    isRating(value.rating.urgency) &&
    isRating(value.rating.confidence) &&
    isRating(value.rating.relevance) &&
    hasValidEvidenceNotes(value.evidenceNotes)
  );
}

function isStakeholder(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return (
    hasStringFields(value, [
      'id',
      'name',
      'category',
      'role',
      'authority',
      'influence',
      'position',
      'legitimacy',
      'relevance',
      'capacity',
      'risk',
      'entry',
      'engagement'
    ]) &&
    STAKEHOLDER_POSITIONS.has(value.position as StakeholderPosition) &&
    RATING_LEVELS.has(value.influence as string) &&
    LEGACY_RATING_LEVELS.has(value.legitimacy as string) &&
    RATING_LEVELS.has(value.relevance as string) &&
    CAPACITY_LEVELS.has(value.capacity as string) &&
    isStringArray(value.cbdAreas) &&
    (value.isCustom === undefined || typeof value.isCustom === 'boolean') &&
    hasValidEvidenceNotes(value.evidenceNotes)
  );
}

function isOptionalRating(value: unknown): boolean {
  return value === undefined || isRating(value);
}

function isCbdCell(value: unknown): value is CbdCell {
  if (!isRecord(value)) return false;

  return (
    hasStringFields(value, [
      'key',
      'why',
      'individual',
      'organizational',
      'environment',
      'risks',
      'sequencing',
      'result',
      'engagement'
    ]) &&
    isStringArray(value.indicators) &&
    isStringArray(value.drivers) &&
    isStringArray(value.stakeholders) &&
    isRating(value.confidence) &&
    isRating(value.priorityScore) &&
    isOptionalRating(value.impact) &&
    isOptionalRating(value.urgency) &&
    isOptionalRating(value.feasibility) &&
    isOptionalRating(value.riskRating) &&
    isOptionalRating(value.stakeholderSupport) &&
    isOptionalRating(value.mandateRelevance) &&
    hasValidEvidenceNotes(value.evidenceNotes) &&
    (value.capacityProblem === undefined || isString(value.capacityProblem)) &&
    (value.planningObjective === undefined || isString(value.planningObjective)) &&
    (value.leadStakeholderId === undefined || value.leadStakeholderId === null || isString(value.leadStakeholderId)) &&
    (value.supportingStakeholderIds === undefined || isStringArray(value.supportingStakeholderIds)) &&
    (value.strategicOptionIds === undefined || isStringArray(value.strategicOptionIds)) &&
    (value.implementationPhase === undefined || value.implementationPhase === null || ['NOW', 'NEXT', 'LATER'].includes(value.implementationPhase as string)) &&
    (value.milestoneTimeframe === undefined || isString(value.milestoneTimeframe))
  );
}

function isPriorityBrief(value: unknown): value is PriorityBrief {
  if (!isRecord(value)) return false;

  return (
    isStringArray(value.topPriorities) &&
    isStringArray(value.quickWins) &&
    isStringArray(value.sensitiveReforms) &&
    isStringArray(value.longerTermReforms) &&
    isStringArray(value.risksAssumptions) &&
    isString(value.sequencingRecommendation)
  );
}

function isAnalysisSourceReference(value: unknown): value is AnalysisSourceReference {
  return isRecord(value) &&
    ANALYSIS_SOURCE_TYPES.has(value.type as string) &&
    isString(value.id);
}

function isSwotFinding(value: unknown): value is SwotFinding {
  return isRecord(value) &&
    hasStringFields(value, ['id', 'reference', 'category', 'finding', 'cbdImplication', 'verificationNote']) &&
    SWOT_CATEGORIES.has(value.category as string) &&
    Array.isArray(value.sourceReferences) &&
    value.sourceReferences.every(isAnalysisSourceReference) &&
    (value.confidence === null || isRating(value.confidence));
}

function isStrategicOption(value: unknown): value is StrategicOption {
  return isRecord(value) &&
    hasStringFields(value, ['id', 'reference', 'type', 'option', 'planningNote']) &&
    STRATEGIC_OPTION_TYPES.has(value.type as string) &&
    isStringArray(value.swotFindingIds);
}

function isAnalysisSynthesis(value: unknown): value is AnalysisSynthesis {
  return isRecord(value) &&
    Array.isArray(value.swotFindings) && value.swotFindings.every(isSwotFinding) &&
    Array.isArray(value.strategicOptions) && value.strategicOptions.every(isStrategicOption);
}

function normalizeProjectData(data: UnpolProjectData): UnpolProjectData {
  const stakeholderIds = new Set(data.stakeholders.map(stakeholder => stakeholder.id));
  const synthesis = data.analysisSynthesis ?? EMPTY_ANALYSIS_SYNTHESIS;
  const findingIds = new Set(synthesis.swotFindings.map(item => item.id));
  const optionIds = new Set(synthesis.strategicOptions.map(item => item.id));
  const sourceKeys = collectValidSourceKeys(data);
  return {
    ...data,
    version: APP_VERSION,
    profile: {
      ...data.profile,
      sourceCategory: data.profile.sourceCategory ?? null,
      coverageScope: data.profile.coverageScope ?? null,
      sourceUrl: data.profile.sourceUrl ?? null,
      sourceDate: data.profile.sourceDate ?? null,
      profileLastReviewed: data.profile.profileLastReviewed ?? null
    },
    pestels: Object.fromEntries(
      Object.entries(data.pestels).map(([key, item]) => [
        key,
        { ...item, evidenceNotes: item.evidenceNotes ?? [] }
      ])
    ),
    stakeholders: data.stakeholders.map((stakeholder) => ({
      ...stakeholder,
      legitimacy: String(stakeholder.legitimacy) === 'Variable' ? 'Medium' : stakeholder.legitimacy,
      evidenceNotes: stakeholder.evidenceNotes ?? []
    })),
    analysisSynthesis: {
      swotFindings: synthesis.swotFindings.map(item => ({
        ...item,
        sourceReferences: item.sourceReferences.filter(reference => sourceKeys.has(sourceReferenceKey(reference)))
      })),
      strategicOptions: synthesis.strategicOptions.map(item => ({
        ...item,
        swotFindingIds: item.swotFindingIds.filter(id => findingIds.has(id))
      }))
    },
    customCells: Object.fromEntries(
      Object.entries(data.customCells).map(([key, cell]) => [
        key,
        {
          ...cell,
          impact: cell.impact ?? cell.priorityScore,
          urgency: cell.urgency ?? 3,
          feasibility: cell.feasibility ?? 3,
          riskRating: cell.riskRating ?? 3,
          stakeholderSupport: cell.stakeholderSupport ?? 3,
          mandateRelevance: cell.mandateRelevance ?? 3,
          evidenceNotes: cell.evidenceNotes ?? [],
          capacityProblem: cell.capacityProblem ?? '',
          planningObjective: cell.planningObjective ?? '',
          leadStakeholderId: cell.leadStakeholderId && stakeholderIds.has(cell.leadStakeholderId) ? cell.leadStakeholderId : null,
          supportingStakeholderIds: (cell.supportingStakeholderIds ?? []).filter(id => stakeholderIds.has(id) && id !== cell.leadStakeholderId),
          implementationPhase: cell.implementationPhase ?? null,
          milestoneTimeframe: cell.milestoneTimeframe ?? '',
          strategicOptionIds: (cell.strategicOptionIds ?? []).filter(id => optionIds.has(id))
        }
      ])
    )
  };
}

export function validateAndNormalizeProjectData(value: unknown): ProjectDataValidationResult {
  if (!isRecord(value)) {
    return { data: null, error: 'Project data must be a JSON object.' };
  }

  if (!isMissionProfile(value.profile)) {
    return { data: null, error: 'Project data contains an invalid mission profile.' };
  }

  if (!isRecord(value.pestels)) {
    return { data: null, error: 'Project data is missing the PESTEL-S record.' };
  }

  for (const key of PESTELS_KEYS) {
    if (!isPestelsItem(value.pestels[key])) {
      return { data: null, error: `Project data contains an invalid PESTEL-S "${key}" entry.` };
    }
  }

  if (!Array.isArray(value.stakeholders) || !value.stakeholders.every(isStakeholder)) {
    return { data: null, error: 'Project data contains an invalid stakeholder list.' };
  }

  if (
    !isRecord(value.customCells) ||
    !Object.values(value.customCells).every(isCbdCell)
  ) {
    return { data: null, error: 'Project data contains an invalid CBD matrix cell.' };
  }

  if (!isPriorityBrief(value.priorityBrief)) {
    return { data: null, error: 'Project data contains an invalid priority brief.' };
  }

  if (value.analysisSynthesis !== undefined && !isAnalysisSynthesis(value.analysisSynthesis)) {
    return { data: null, error: 'Project data contains invalid analysis synthesis data.' };
  }

  if (!isString(value.version)) {
    return { data: null, error: 'Project data is missing a valid version label.' };
  }

  return {
    data: normalizeProjectData({
      ...(value as unknown as UnpolProjectData),
      analysisSynthesis: (value.analysisSynthesis as AnalysisSynthesis | undefined) ?? EMPTY_ANALYSIS_SYNTHESIS
    }),
    error: null
  };
}
