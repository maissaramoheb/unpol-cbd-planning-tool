import type { EvidenceNote, UnpolProjectData } from '../types';
import type { WorkflowStage } from './workflow';
import { isValidInterdependency } from './interdependencies';

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
  const recorded = new Map<string, TraceRelation>();
  const link = (from: InspectorEntityRef, to: InspectorEntityRef, relationType: string, label: string) => {
    const relation = { from: traceKey(from), to: traceKey(to), relationType, label };
    if (byKey.has(relation.from) && byKey.has(relation.to)) recorded.set(JSON.stringify([relation.from, relation.to, relationType]), relation);
  };
  const evidenceById = new Map<string, TraceEntity[]>();
  entities.filter(entity => entity.ref.type === 'evidence').forEach(entity => {
    const existing = evidenceById.get(entity.ref.id) ?? [];
    evidenceById.set(entity.ref.id, [...existing, entity]);
    const owner = byKey.get(entity.ref.owner!);
    if (owner) link(entity.ref, owner.ref, 'evidence', 'Recorded evidence for');
  });
  // Older source references contain bare note IDs. Ambiguous IDs are not guessed.
  const evidenceRef = (id: string) => evidenceById.get(id)?.length === 1 ? evidenceById.get(id)![0].ref : null;
  const evidenceLink = (id: string, to: InspectorEntityRef) => {
    const from = evidenceRef(id);
    if (from) link(from, to, 'evidence', 'Recorded evidence for');
  };
  const validInterdependencies = new Set(data.interdependencies.filter(item => isValidInterdependency(data, item)).map(item => item.id));
  data.interdependencies.filter(item => validInterdependencies.has(item.id)).forEach(item => {
    const ref: InspectorEntityRef = { type: 'interdependency', id: item.id };
    if (item.sourceFindingId) link({ type: 'pestels', id: item.sourceFindingId }, ref, 'source-finding', 'Source finding referenced by');
    // Target is recorded as a role, not a new causal edge between the findings.
    if (item.targetFindingId) link({ type: 'pestels', id: item.targetFindingId }, ref, 'target-finding', 'Target finding referenced by');
    item.evidenceIds.forEach(id => evidenceLink(id, ref));
  });
  data.analysisSynthesis.swotFindings.forEach(item => {
    const to: InspectorEntityRef = { type: 'swot', id: item.id };
    item.sourceReferences.forEach(source => {
      if (source.type === 'evidence') { evidenceLink(source.id, to); return; }
      if (source.type === 'interdependency' && !validInterdependencies.has(source.id)) return;
      link({ type: source.type, id: source.id }, to, 'source', 'Recorded source for');
    });
  });
  data.analysisSynthesis.strategicOptions.forEach(option => option.swotFindingIds.forEach(id => link({ type: 'swot', id }, { type: 'option', id: option.id }, 'contributes', 'Contributes to')));
  Object.entries(data.customCells).forEach(([key, cell]) => {
    const priority = priorityRef(key);
    const local = (type: TraceEntityType, id: string): InspectorEntityRef => ({ type, id, owner: key });
    const actor = (id: string | null, to: InspectorEntityRef, role: string, label: string) => { if (id) link({ type: 'stakeholder', id }, to, role, label); };
    cell.drivers.forEach(id => { const item = data.pestels[id]; if (item) link({ type: 'pestels', id: item.id }, priority, 'driver', 'Recorded diagnostic driver for'); });
    (cell.strategicOptionIds ?? []).forEach(id => link({ type: 'option', id }, priority, 'informs', 'Informs'));
    cell.stakeholders.forEach(id => actor(id, priority, 'linked-stakeholder', 'Linked stakeholder for'));
    actor(cell.leadStakeholderId, priority, 'lead-actor', 'Recorded lead for');
    cell.supportingStakeholderIds.forEach(id => actor(id, priority, 'supporting-actor', 'Recorded supporting actor for'));
    const plan = cell.resultsPlan;
    plan?.outputs.forEach(item => link(priority, local('output', item.id), 'contains-output', 'Has recorded output'));
    plan?.activities.forEach(item => {
      const activity = local('activity', item.id);
      link(priority, activity, 'contains-activity', 'Has recorded activity');
      item.outputIds.forEach(id => link(activity, local('output', id), 'output-link', 'Linked to output'));
      actor(item.implementingActorId, activity, 'implementing-actor', 'Recorded implementing actor for');
      item.supportingActorIds.forEach(id => actor(id, activity, 'supporting-actor', 'Recorded supporting actor for'));
      item.dependencyIds.forEach(id => link(local('dependency', id), activity, 'requires-dependency', 'Recorded dependency for'));
      item.resourceIds.forEach(id => link(local('resource', id), activity, 'uses-resource', 'Recorded resource for'));
    });
    plan?.assumptions.forEach(item => link(priority, local('assumption', item.id), 'contains-assumption', 'Has recorded assumption'));
    plan?.resources.forEach(item => link(priority, local('resource', item.id), 'contains-resource', 'Has recorded resource requirement'));
    plan?.dependencies.forEach(item => {
      const dependency = local('dependency', item.id);
      link(priority, dependency, 'contains-dependency', 'Has recorded dependency');
      if (item.type === 'CBD priority' && item.linkedPriorityKey) link(priorityRef(item.linkedPriorityKey), dependency, 'dependency-priority', 'Priority referenced by dependency');
      if (item.type === 'Activity' && item.linkedPriorityKey && item.linkedRecordId) link({ type: 'activity', owner: item.linkedPriorityKey, id: item.linkedRecordId }, dependency, 'dependency-activity', 'Activity referenced by dependency');
      if (item.type === 'Stakeholder action') actor(item.linkedRecordId, dependency, 'dependency-actor', 'Stakeholder action referenced by dependency');
    });
    if (plan) {
      actor(plan.ownership.counterpartActorId, priority, 'counterpart-owner', 'Recorded counterpart owner for');
      actor(plan.riskManagement.responsibleActorId, priority, 'risk-owner', 'Recorded risk responsibility for');
    }
    cell.indicators.forEach(item => {
      if (typeof item === 'string') return;
      const indicator = local('indicator', item.id);
      link(priority, indicator, 'contains-indicator', 'Has recorded indicator');
      if (item.resultLevel === 'Intended Result / Outcome' && item.linkedRecordId === key) link(priority, indicator, 'measures', 'Assigned outcome indicator');
      if (item.resultLevel === 'Output' && item.linkedRecordId) link(local('output', item.linkedRecordId), indicator, 'measures', 'Assigned output indicator');
      if (item.resultLevel === 'Activity / Process' && item.linkedRecordId) link(local('activity', item.linkedRecordId), indicator, 'measures', 'Assigned activity indicator');
      actor(item.responsibleActorId, indicator, 'indicator-actor', 'Recorded measurement responsibility for');
    });
  });
  const relations = [...recorded.values()].sort((a, b) => compare(JSON.stringify([a.from, a.to, a.relationType]), JSON.stringify([b.from, b.to, b.relationType])));
  const upstream = new Map<string, TraceRelation[]>();
  const downstream = new Map<string, TraceRelation[]>();
  relations.forEach(relation => {
    upstream.set(relation.to, [...(upstream.get(relation.to) ?? []), relation]);
    downstream.set(relation.from, [...(downstream.get(relation.from) ?? []), relation]);
  });
  return { entities, byKey, relations, upstream, downstream };
}

export const getEntity = (index: TraceabilityIndex, ref: InspectorEntityRef) => index.byKey.get(traceKey(ref)) ?? null;
export const getUpstream = (index: TraceabilityIndex, ref: InspectorEntityRef) => index.upstream.get(traceKey(ref)) ?? [];
export const getDownstream = (index: TraceabilityIndex, ref: InspectorEntityRef) => index.downstream.get(traceKey(ref)) ?? [];

export interface RecordedReasoningPath {
  entities: TraceEntity[];
  relations: TraceRelation[];
  upstreamStop: 'end' | 'limit' | 'cycle';
  downstreamStop: 'end' | 'limit' | 'cycle';
}

/** Display one recorded route. Ordering chooses navigation context, never analytical priority. */
export function getRecordedReasoningPath(index: TraceabilityIndex, ref: InspectorEntityRef): RecordedReasoningPath {
  const selected = getEntity(index, ref);
  if (!selected) return { entities: [], relations: [], upstreamStop: 'end', downstreamStop: 'end' };
  const reasoningTypes = new Set<TraceEntityType>(['evidence', 'pestels', 'swot', 'option', 'priority', 'output']);
  type Route = { entities: TraceEntity[]; relations: TraceRelation[]; stop: RecordedReasoningPath['upstreamStop'] };
  const walk = (start: TraceEntity, direction: 'upstream' | 'downstream', depth: number, excluded: Set<string>): Route => {
    const pending: Route[] = [{ entities: [start], relations: [], stop: 'end' }];
    let best = pending[0];
    let bestContext = -1;
    let bestExtraSteps = Infinity;
    // Fixed depth and visit budgets keep branching/cyclic projects cheap to inspect.
    for (let visit = 0; visit < pending.length && visit < 128; visit++) {
      const route = pending[visit];
      const last = route.entities[route.entities.length - 1];
      const recorded = direction === 'upstream' ? index.upstream.get(last.key) ?? [] : index.downstream.get(last.key) ?? [];
      const candidates = recorded.filter(relation => index.byKey.has(direction === 'upstream' ? relation.from : relation.to));
      const available = candidates.filter(relation => {
        const key = direction === 'upstream' ? relation.from : relation.to;
        return !excluded.has(key) && !route.entities.some(entity => entity.key === key);
      }).sort((a, b) => compare(JSON.stringify([a.from, a.to, a.relationType]), JSON.stringify([b.from, b.to, b.relationType])));
      route.stop = !candidates.length ? 'end' : !available.length ? 'cycle' : route.relations.length >= depth || pending.length >= 128 ? 'limit' : 'end';
      const terminal = route.stop !== 'end' || !available.length;
      const context = new Set(route.entities.filter(entity => reasoningTypes.has(entity.ref.type)).map(entity => entity.ref.type)).size;
      const extraSteps = route.entities.filter(entity => !reasoningTypes.has(entity.ref.type)).length;
      // Prefer an explicit source/synthesis/result spine, then its continuation.
      // Stable candidate ordering breaks ties without using text or ratings.
      if (terminal && (context > bestContext || context === bestContext && (extraSteps < bestExtraSteps || extraSteps === bestExtraSteps && route.relations.length > best.relations.length))) {
        best = route;
        bestContext = context;
        bestExtraSteps = extraSteps;
      }
      if (terminal) continue;
      available.slice(0, 128 - pending.length).forEach(relation => {
        const next = index.byKey.get(direction === 'upstream' ? relation.from : relation.to)!;
        pending.push({ entities: [...route.entities, next], relations: [...route.relations, relation], stop: 'end' });
      });
    }
    return best;
  };
  const upstream = walk(selected, 'upstream', 4, new Set());
  const downstream = walk(selected, 'downstream', 8 - upstream.relations.length, new Set(upstream.entities.slice(1).map(entity => entity.key)));
  return {
    entities: [...upstream.entities.slice(1).reverse(), ...downstream.entities],
    relations: [...upstream.relations].reverse().concat(downstream.relations),
    upstreamStop: upstream.stop,
    downstreamStop: downstream.stop
  };
}

/** Walk only recorded incoming links; visited keys bound cycles and deduplicate notes. */
export function getEvidenceConnections(index: TraceabilityIndex, ref: InspectorEntityRef): { direct: TraceEntity[]; upstream: TraceEntity[] } {
  const key = traceKey(ref);
  const directKeys = new Set(getUpstream(index, ref).filter(relation => relation.relationType === 'evidence').map(relation => relation.from));
  if (ref.type === 'evidence' && index.byKey.has(key)) directKeys.add(key);
  const visited = new Set([key]);
  const pending = [key];
  const upstreamKeys = new Set<string>();
  for (let position = 0; position < pending.length; position++) {
    (index.upstream.get(pending[position]) ?? []).forEach(relation => {
      if (visited.has(relation.from)) return;
      visited.add(relation.from);
      const source = index.byKey.get(relation.from);
      if (source?.ref.type === 'evidence') { if (!directKeys.has(source.key)) upstreamKeys.add(source.key); }
      else pending.push(relation.from);
    });
  }
  const resolve = (keys: Set<string>) => [...keys].sort(compare).map(key => index.byKey.get(key)!).filter(Boolean);
  return { direct: resolve(directKeys), upstream: resolve(upstreamKeys) };
}
