import type { EvidenceNote, UnpolProjectData } from '../types';
import type { WorkflowStage } from './workflow';

export type TraceEntityType = 'profile' | 'pestels' | 'stakeholder' | 'interdependency' | 'swot' | 'option' | 'priority' | 'evidence' | 'output' | 'activity' | 'indicator' | 'assumption' | 'dependency' | 'resource';
export interface InspectorEntityRef { type: TraceEntityType; id: string; owner?: string }
export interface TraceEntity {
  ref: InspectorEntityRef;
  key: string;
  typeLabel: string;
  title: string;
  reference?: string;
  stage: WorkflowStage;
  details: Array<{ label: string; value: string }>;
  evidence?: EvidenceNote;
}
export interface TraceRelation { from: string; to: string; relationType: string; label: string }
export interface TraceabilityIndex {
  entities: TraceEntity[];
  relations: TraceRelation[];
  byKey: ReadonlyMap<string, TraceEntity>;
  upstream: ReadonlyMap<string, TraceRelation[]>;
  downstream: ReadonlyMap<string, TraceRelation[]>;
}

// Composite UI identities reuse stored IDs; nothing is written back to project data.
export const traceKey = (ref: InspectorEntityRef): string => JSON.stringify([ref.type, ref.owner ?? '', ref.id]);
export const priorityRef = (key: string): InspectorEntityRef => ({ type: 'priority', id: key });
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

export function buildTraceabilityIndex(data: UnpolProjectData): TraceabilityIndex {
  const entities: TraceEntity[] = [];
  const add = (ref: InspectorEntityRef, typeLabel: string, title: string, stage: WorkflowStage, fields: Record<string, unknown>, reference?: string, evidence?: EvidenceNote) => {
    const details = Object.entries(fields).map(([label, value]) => ({ label, value: Array.isArray(value) ? value.join(', ') : value == null || value === '' ? 'Not recorded' : String(value) }));
    entities.push({ ref, key: traceKey(ref), typeLabel, title, stage, details, reference, evidence });
  };
  const notes = (ref: InspectorEntityRef, stage: WorkflowStage, evidence?: EvidenceNote[]) => evidence?.forEach(note => add(
    { type: 'evidence', id: note.id, owner: traceKey(ref) }, 'Evidence note', note.sourceTitle || 'Untitled evidence', stage,
    { 'Source type': note.sourceType, 'Verified date': note.dateVerified, 'Confidence': `${note.confidenceLevel}/5`, 'Recorded note': note.comment }, undefined, note
  ));
  const profileFields = ['countryName', 'missionName', 'region', 'mandateEnvironment', 'hostStatePolice', 'conflictContext', 'planningPurpose'] as const;
  profileFields.forEach(id => add({ type: 'profile', id }, 'Planning context', id.replace(/([A-Z])/g, ' $1'), 1, { 'Recorded context': data.profile[id] }));
  Object.values(data.pestels).forEach(item => {
    const ref: InspectorEntityRef = { type: 'pestels', id: item.id };
    add(ref, 'PESTEL-S finding', item.name, 2, { 'Finding': item.finding, 'Why it matters': item.why, 'CBD areas': item.cbdAreas, 'Analytical lenses': item.dimensions, 'Impact': `${item.rating.impact}/5`, 'Urgency': `${item.rating.urgency}/5`, 'Relevance': `${item.rating.relevance}/5`, 'Evidence confidence': `${item.rating.confidence}/5`, 'Sequencing note': item.sequencing });
    notes(ref, 2, item.evidenceNotes);
  });
  data.stakeholders.forEach(item => {
    const ref: InspectorEntityRef = { type: 'stakeholder', id: item.id };
    add(ref, 'Stakeholder', item.name, 3, { 'Category': item.category, 'Role': item.role, 'Authority': item.authority, 'Position': item.position, 'Influence': item.influence, 'Legitimacy': item.legitimacy, 'Relevance': item.relevance, 'Capacity': item.capacity, 'Risk': item.risk, 'Engagement': item.engagement });
    notes(ref, 3, item.evidenceNotes);
  });
  data.interdependencies.forEach(item => add({ type: 'interdependency', id: item.id }, 'Interdependency', item.relationship || 'Untitled relationship', 2,
    { 'CBD implication': item.cbdImplication, 'Effect on CBD': item.effectOnCbd, 'Planning significance': item.planningSignificance, 'Analyst judgement': item.analyticalNote, 'Key insight': item.isKeyInsight ? 'Yes' : 'No' }, item.reference));
  data.analysisSynthesis.swotFindings.forEach(item => add({ type: 'swot', id: item.id }, 'SWOT finding', item.finding || 'Untitled finding', 4,
    { 'Category': item.category, 'CBD implication': item.cbdImplication, 'Confidence': item.confidence == null ? null : `${item.confidence}/5`, 'Verification note': item.verificationNote }, item.reference));
  data.analysisSynthesis.strategicOptions.forEach(item => add({ type: 'option', id: item.id }, 'Strategic option', item.option || 'Untitled option', 4,
    { 'Combination': item.type, 'Planning note': item.planningNote }, item.reference));
  Object.entries(data.customCells).forEach(([key, cell]) => {
    const ref = priorityRef(key);
    add(ref, 'CBD priority', key.replace('|', ' × '), 5, { 'Capacity problem': cell.capacityProblem, 'Objective': cell.planningObjective, 'Assessment': cell.why, 'Individual response': cell.individual, 'Organizational response': cell.organizational, 'Enabling environment': cell.environment, 'Evidence confidence': `${cell.confidence}/5`, 'Phase': cell.implementationPhase, 'Milestone': cell.milestoneTimeframe, 'Risks': cell.risks });
    notes(ref, 5, cell.evidenceNotes);
    cell.resultsPlan?.outputs.forEach(item => add({ type: 'output', id: item.id, owner: key }, 'Output', item.statement || 'Untitled output', 7, { 'Intervention levels': item.interventionLevels, 'Note': item.note }, item.reference));
    cell.resultsPlan?.activities.forEach(item => add({ type: 'activity', id: item.id, owner: key }, 'Activity', item.statement || 'Untitled activity', 7, { 'Intervention level': item.interventionLevel, 'Timeframe': item.timeframe, 'Milestone': item.milestone }, item.reference));
    cell.indicators.forEach(item => { if (typeof item !== 'string') add({ type: 'indicator', id: item.id, owner: key }, 'Indicator', item.statement || 'Untitled indicator', 7, { 'Result level': item.resultLevel, 'Baseline': item.baseline, 'Target': item.target, 'Verification': item.verification, 'Frequency': item.frequency, 'Disaggregation': item.disaggregation, 'Note': item.note }); });
    cell.resultsPlan?.assumptions.forEach(item => add({ type: 'assumption', id: item.id, owner: key }, 'Assumption', item.statement || 'Untitled assumption', 7, { 'Importance': item.importance, 'Review note': item.reviewNote }));
    cell.resultsPlan?.dependencies.forEach(item => add({ type: 'dependency', id: item.id, owner: key }, 'Dependency', item.statement || 'Untitled dependency', 7, { 'Type': item.type, 'Status': item.status }));
    cell.resultsPlan?.resources.forEach(item => add({ type: 'resource', id: item.id, owner: key }, 'Resource requirement', item.statement || 'Untitled resource', 7, { 'Category': item.category, 'Availability': item.availability }));
  });
  entities.sort((a, b) => compare(a.key, b.key));
  const byKey = new Map(entities.map(entity => [entity.key, entity]));
  return { entities, byKey, relations: [], upstream: new Map(), downstream: new Map() };
}

export const getEntity = (index: TraceabilityIndex, ref: InspectorEntityRef) => index.byKey.get(traceKey(ref)) ?? null;
export const getUpstream = (index: TraceabilityIndex, ref: InspectorEntityRef) => index.upstream.get(traceKey(ref)) ?? [];
export const getDownstream = (index: TraceabilityIndex, ref: InspectorEntityRef) => index.downstream.get(traceKey(ref)) ?? [];
