import type { CbdCell, PlanningIndicator, ResultsPlan, UnpolProjectData } from '../types';

export const LEVELS = ['individual', 'organizational', 'environment'] as const;
export const RESULT_LEVELS = ['Not assigned', 'Intended Result / Outcome', 'Output', 'Activity / Process'] as const;
export const FREQUENCIES = ['Not assigned', 'One-time', 'Weekly', 'Monthly', 'Quarterly', 'Semi-annual', 'Annual', 'At milestone', 'Other'] as const;
export const IMPORTANCE = ['Not assessed', 'Critical', 'Important', 'Contextual'] as const;
export const DEPENDENCY_TYPES = ['Activity', 'CBD priority', 'Policy approval', 'Stakeholder action', 'External condition', 'Other'] as const;
export const DEPENDENCY_STATUS = ['Not assessed', 'Required', 'In progress', 'Met', 'Uncertain'] as const;
export const RESOURCE_CATEGORIES = ['Human Resources', 'Financial', 'Logistics / Equipment', 'Technical', 'Training / Expertise', 'Policy / Administrative', 'Other'] as const;
export const AVAILABILITY = ['Unknown', 'Available', 'Partially available', 'Not available'] as const;
export const OWNERSHIP_STATUS = ['Not yet assessed', 'Not consulted', 'Consulted', 'Supports', 'Supports with conditions', 'Concerns / resistance identified', 'Not applicable'] as const;
export const SUSTAINABILITY_DIMENSIONS = ['Institutional responsibility', 'Leadership', 'Policy / SOP', 'Staffing', 'Budget / financing', 'Equipment / logistics', 'Training architecture', 'Knowledge / skills retention', 'Oversight / accountability', 'Data / monitoring system', 'Partner coordination', 'Other'] as const;

export function emptyResultsPlan(): ResultsPlan {
  return { schemaVersion: 1, outputs: [], activities: [], assumptions: [], changeLogic: { interventionLevels: [], activityIds: [], because: '', assumptionIds: [] }, dependencies: [], resources: [], riskManagement: { mitigation: '', responsibleActorId: null, reviewNote: '' }, ownership: { counterpartActorId: null, status: 'Not yet assessed', note: '' }, sustainability: [] };
}
export function createIndicator(id: string, statement = ''): PlanningIndicator {
  return { id, statement, resultLevel: 'Not assigned', linkedRecordId: null, baseline: '', target: '', verification: '', frequency: 'Not assigned', responsibleActorId: null, disaggregation: '', note: '' };
}
export const indicatorText = (indicator: string | PlanningIndicator): string => typeof indicator === 'string' ? indicator : indicator.statement;
export const indicatorTexts = (cell: CbdCell): string[] => cell.indicators.map(indicatorText);
export function structuredIndicators(cell: CbdCell): PlanningIndicator[] {
  const used = new Set(cell.indicators.filter((i): i is PlanningIndicator => typeof i !== 'string').map(i => i.id));
  return cell.indicators.map((item, index) => {
    if (typeof item !== 'string') return item;
    let id = `legacy-indicator:${cell.key}:${index + 1}`;
    while (used.has(id)) id += ':legacy';
    used.add(id);
    return createIndicator(id, item);
  });
}
export function nextReference(prefix: string, records: { reference: string }[]): string {
  return `${prefix}-${String(1 + Math.max(0, ...records.map(r => Number(r.reference.split('-').at(-1)) || 0))).padStart(2, '0')}`;
}

// Validate imported structures before normalizing references. Invalid payloads are rejected atomically.
type RecordValue = Record<string, unknown>;
const object = (v: unknown): v is RecordValue => typeof v === 'object' && v !== null && !Array.isArray(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');
const fields = (v: RecordValue, names: string[]) => names.every(n => typeof v[n] === 'string');
const nullable = (v: unknown) => v === null || typeof v === 'string';
const oneOf = (v: unknown, values: readonly string[]) => typeof v === 'string' && values.includes(v);
const records = (v: unknown, check: (r: RecordValue) => boolean): boolean => Array.isArray(v) && v.every(r => object(r) && typeof r.id === 'string' && r.id.length > 0 && check(r)) && new Set(v.map(r => r.id)).size === v.length;

export function validIndicators(v: unknown): boolean {
  if (!Array.isArray(v)) return false;
  const structured = v.filter(i => typeof i !== 'string');
  return records(structured, i => fields(i, ['statement', 'baseline', 'target', 'verification', 'disaggregation', 'note']) && oneOf(i.resultLevel, RESULT_LEVELS) && oneOf(i.frequency, FREQUENCIES) && nullable(i.linkedRecordId) && nullable(i.responsibleActorId));
}
export function validResultsPlan(v: unknown): boolean {
  if (v === undefined) return true;
  if (!object(v) || v.schemaVersion !== 1) return false;
  return records(v.outputs, r => fields(r, ['reference', 'statement', 'note']) && strings(r.interventionLevels) && r.interventionLevels.every(l => oneOf(l, LEVELS))) &&
    records(v.activities, r => fields(r, ['reference', 'statement', 'timeframe', 'milestone']) && (r.interventionLevel === null || oneOf(r.interventionLevel, LEVELS)) && nullable(r.implementingActorId) && ['outputIds', 'supportingActorIds', 'dependencyIds', 'resourceIds'].every(k => strings(r[k]))) &&
    records(v.assumptions, r => fields(r, ['statement', 'reviewNote']) && oneOf(r.importance, IMPORTANCE)) &&
    records(v.dependencies, r => fields(r, ['statement']) && oneOf(r.type, DEPENDENCY_TYPES) && oneOf(r.status, DEPENDENCY_STATUS) && nullable(r.linkedPriorityKey) && nullable(r.linkedRecordId)) &&
    records(v.resources, r => fields(r, ['statement']) && oneOf(r.category, RESOURCE_CATEGORIES) && oneOf(r.availability, AVAILABILITY)) &&
    records(v.sustainability, r => fields(r, ['requirement']) && oneOf(r.dimension, SUSTAINABILITY_DIMENSIONS)) &&
    object(v.changeLogic) && fields(v.changeLogic, ['because']) && strings(v.changeLogic.interventionLevels) && v.changeLogic.interventionLevels.every(l => oneOf(l, LEVELS)) && strings(v.changeLogic.activityIds) && strings(v.changeLogic.assumptionIds) &&
    object(v.riskManagement) && fields(v.riskManagement, ['mitigation', 'reviewNote']) && nullable(v.riskManagement.responsibleActorId) &&
    object(v.ownership) && fields(v.ownership, ['note']) && oneOf(v.ownership.status, OWNERSHIP_STATUS) && nullable(v.ownership.counterpartActorId);
}

export function normalizeResultsReferences(data: UnpolProjectData): UnpolProjectData {
  const actors = new Set(data.stakeholders.map(s => s.id));
  const actor = (id: string | null) => id && actors.has(id) ? id : null;
  return { ...data, customCells: Object.fromEntries(Object.entries(data.customCells).map(([key, original]) => {
    const cell = { ...original, key,
      leadStakeholderId: actor(original.leadStakeholderId),
      supportingStakeholderIds: (original.supportingStakeholderIds ?? []).filter(id => actors.has(id) && id !== original.leadStakeholderId)
    };
    const p = cell.resultsPlan;
    const outputs = new Set(p?.outputs.map(o => o.id));
    const activities = new Set(p?.activities.map(a => a.id));
    const assumptions = new Set(p?.assumptions.map(a => a.id));
    const dependencies = new Set(p?.dependencies.map(d => d.id));
    const resources = new Set(p?.resources.map(r => r.id));
    const keep = (ids: string[], valid: Set<string>) => [...new Set(ids.filter(id => valid.has(id)))];
    const indicators = structuredIndicators(cell).map(i => ({ ...i, responsibleActorId: actor(i.responsibleActorId), linkedRecordId: i.resultLevel === 'Intended Result / Outcome' ? key : i.resultLevel === 'Output' && i.linkedRecordId && outputs.has(i.linkedRecordId) ? i.linkedRecordId : i.resultLevel === 'Activity / Process' && i.linkedRecordId && activities.has(i.linkedRecordId) ? i.linkedRecordId : null }));
    if (!p) return [key, { ...cell, indicators }];
    const resultsPlan: ResultsPlan = {
      ...p,
      activities: p.activities.map(a => ({ ...a, outputIds: keep(a.outputIds, outputs), implementingActorId: actor(a.implementingActorId), supportingActorIds: keep(a.supportingActorIds, actors).filter(id => id !== a.implementingActorId), dependencyIds: keep(a.dependencyIds, dependencies), resourceIds: keep(a.resourceIds, resources) })),
      changeLogic: { ...p.changeLogic, activityIds: keep(p.changeLogic.activityIds, activities), assumptionIds: keep(p.changeLogic.assumptionIds, assumptions) },
      dependencies: p.dependencies.map(d => {
        const target = d.linkedPriorityKey ? data.customCells[d.linkedPriorityKey] : undefined;
        const validTarget = d.type === 'Activity' || d.type === 'CBD priority';
        const linkedPriorityKey = validTarget && target ? d.linkedPriorityKey : null;
        const linkedRecordId = d.type === 'Activity' && target?.resultsPlan?.activities.some(a => a.id === d.linkedRecordId) ? d.linkedRecordId : d.type === 'Stakeholder action' ? actor(d.linkedRecordId) : null;
        const lost = (d.linkedPriorityKey !== null && linkedPriorityKey === null) || (d.linkedRecordId !== null && linkedRecordId === null);
        return { ...d, linkedPriorityKey, linkedRecordId, status: lost ? 'Not assessed' : d.status };
      }),
      ownership: { ...p.ownership, counterpartActorId: actor(p.ownership.counterpartActorId), status: p.ownership.counterpartActorId && !actors.has(p.ownership.counterpartActorId) ? 'Not yet assessed' : p.ownership.status },
      riskManagement: { ...p.riskManagement, responsibleActorId: actor(p.riskManagement.responsibleActorId) }
    };
    return [key, { ...cell, indicators, resultsPlan }];
  })) };
}

export function resultsCautions(cell: CbdCell): string[] {
  const p = cell.resultsPlan ?? emptyResultsPlan();
  const indicators = structuredIndicators(cell);
  return [
    cell.planningObjective.trim() && !indicators.some(i => i.resultLevel === 'Intended Result / Outcome' && i.statement.trim()) ? 'Intended result has no assigned indicator.' : '',
    indicators.some(i => i.statement.trim() && (!i.baseline.trim() || !i.target.trim())) ? 'Some indicators have no baseline or target.' : '',
    p.activities.some(a => !a.implementingActorId) ? 'Some activities have no implementing actor.' : '',
    p.assumptions.some(a => a.importance === 'Critical' && !a.reviewNote.trim()) ? 'A critical assumption has no review note.' : '',
    !p.ownership.counterpartActorId && p.ownership.status !== 'Not applicable' ? 'Counterpart owner is not recorded.' : '',
    !p.sustainability.some(s => s.requirement.trim()) ? 'Sustainability requirements are not recorded.' : '',
    p.dependencies.some(d => d.status === 'Required' || d.status === 'Uncertain' || d.status === 'Not assessed') ? 'Dependencies require resolution or assessment.' : ''
  ].filter(Boolean);
}
export function resultsCompleteness(cell: CbdCell): Array<{ label: string; status: string }> {
  const p = cell.resultsPlan ?? emptyResultsPlan();
  const indicators = structuredIndicators(cell);
  const state = (some: boolean, complete = some) => complete ? 'Recorded' : some ? 'Partially recorded' : 'Not recorded';
  return [
    { label: 'Objective', status: state(Boolean(cell.planningObjective.trim())) },
    { label: 'Outputs', status: state(p.outputs.length > 0, p.outputs.length > 0 && p.outputs.every(o => Boolean(o.statement.trim()))) },
    { label: 'Measurement', status: state(indicators.length > 0, indicators.length > 0 && indicators.every(i => Boolean(i.statement.trim() && i.baseline.trim() && i.target.trim() && i.verification.trim() && i.responsibleActorId && i.frequency !== 'Not assigned'))) },
    { label: 'Implementation', status: state(p.activities.length > 0, p.activities.length > 0 && p.activities.every(a => Boolean((a.statement.trim() || (a.interventionLevel && cell[a.interventionLevel].trim())) && a.implementingActorId && (a.timeframe.trim() || cell.milestoneTimeframe.trim())))) },
    { label: 'Ownership', status: state(Boolean(p.ownership.counterpartActorId || p.ownership.note.trim()), Boolean(p.ownership.counterpartActorId && p.ownership.note.trim() && p.ownership.status !== 'Not yet assessed') || p.ownership.status === 'Not applicable') },
    { label: 'Resources', status: state(p.resources.length > 0, p.resources.length > 0 && p.resources.every(r => Boolean(r.statement.trim()) && r.availability !== 'Unknown')) },
    { label: 'Sustainability', status: state(p.sustainability.length > 0, p.sustainability.length > 0 && p.sustainability.every(s => Boolean(s.requirement.trim()))) }
  ];
}
