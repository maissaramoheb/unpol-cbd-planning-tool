import {
  CbdCell,
  EvidenceNote,
  MissionProfile,
  PestelsItem,
  PriorityBrief,
  Stakeholder,
  StakeholderPosition,
  UnpolProjectData
} from '../types';
import { PESTELS_KEYS } from '../data/pestelsCategories';

export interface ProjectDataValidationResult {
  data: UnpolProjectData | null;
  error: string | null;
}

const CURRENT_PROJECT_VERSION = 'v0.3.0';
const STAKEHOLDER_POSITIONS = new Set<StakeholderPosition>([
  'Enabler',
  'Persuadable',
  'Blocker',
  'Spoiler risk',
  'Neutral / unknown'
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

  return hasStringFields(value, [
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

function isStakeholder(value: unknown): value is Stakeholder {
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
    version: CURRENT_PROJECT_VERSION,
    pestels: Object.fromEntries(
      Object.entries(data.pestels).map(([key, item]) => [
        key,
        { ...item, evidenceNotes: item.evidenceNotes ?? [] }
      ])
    ),
    stakeholders: data.stakeholders.map((stakeholder) => ({
      ...stakeholder,
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
