import {
  CbdCell,
  EvidenceNote,
  MissionProfile,
  PestelsItem,
  PriorityBrief,
  StakeholderPosition,
  UnpolProjectData
} from '../types';
import { PESTELS_KEYS } from '../data/pestelsCategories';
import type { MissionCoverageScope, MissionSourceCategory } from '../types/explorer';
import { APP_VERSION } from './version';

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
  'selected-starter',
  'training',
  'custom'
]);

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
    isOptionalRating(value.feasibility) &&
    isOptionalRating(value.riskRating) &&
    isOptionalRating(value.stakeholderSupport) &&
    hasValidEvidenceNotes(value.evidenceNotes)
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

function normalizeProjectData(data: UnpolProjectData): UnpolProjectData {
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
    customCells: Object.fromEntries(
      Object.entries(data.customCells).map(([key, cell]) => [
        key,
        {
          ...cell,
          feasibility: cell.feasibility ?? 3,
          riskRating: cell.riskRating ?? 3,
          stakeholderSupport: cell.stakeholderSupport ?? 3,
          evidenceNotes: cell.evidenceNotes ?? []
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

  if (!isString(value.version)) {
    return { data: null, error: 'Project data is missing a valid version label.' };
  }

  return {
    data: normalizeProjectData(value as unknown as UnpolProjectData),
    error: null
  };
}
