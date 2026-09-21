import type { ExecutiveBriefSelection, ExecutiveReference, UnpolProjectData } from '../types';
import { existingEvidence } from './interdependencies';

export const EXECUTIVE_LIMIT_MESSAGE = 'Executive Brief is limited to three items in this section. Remove one existing selection first.';
export const EXECUTIVE_FIT_MESSAGE = 'Executive Brief exceeds the recommended one-page limit. Reduce selections or shorten the underlying planning text.';
export const emptyExecutiveSelection = (): ExecutiveBriefSelection => ({ primaryPriorityKey: null, capacityGapKeys: [], evidenceIds: [], interventions: [], criticalItems: [], immediateNextSteps: [] });
export const executiveRefKey = (ref: ExecutiveReference) => JSON.stringify([ref.priorityKey, ref.kind, ref.id ?? null]);
export interface ExecutiveItem { key: string; label: string; text: string; reference?: ExecutiveReference; evidenceId?: string }
const levelNames = { individual: 'Individual', organizational: 'Organizational', environment: 'Enabling Environment' };

/** Candidates are available for explicit selection only; their order never selects a record. */
export function executiveCandidates(data: UnpolProjectData) {
  const actor = (id: string | null | undefined) => data.stakeholders.find(s => s.id === id)?.name;
  const priorities = Object.entries(data.customCells).filter(([, c]) => c.capacityProblem.trim()).map(([key, c]) => ({ key, label: key.split('|').join(' × '), text: c.capacityProblem }));
  const interventions: ExecutiveItem[] = [], criticalItems: ExecutiveItem[] = [], immediateNextSteps: ExecutiveItem[] = [];
  const add = (list: ExecutiveItem[], reference: ExecutiveReference, label: string, text: string) => { if (text.trim()) list.push({ key: executiveRefKey(reference), reference, label, text }); };
  for (const [key, c] of Object.entries(data.customCells)) {
    if (!c.capacityProblem.trim()) continue;
    for (const kind of ['individual', 'organizational', 'environment'] as const) add(interventions, { priorityKey: key, kind }, levelNames[kind], c[kind]);
    const p = c.resultsPlan;
    if (c.risks.trim()) add(criticalItems, { priorityKey: key, kind: 'risk' }, 'Risk', c.risks + (p?.riskManagement.mitigation.trim() ? ` Mitigation: ${p.riskManagement.mitigation}` : ''));
    p?.assumptions.forEach(a => add(criticalItems, { priorityKey: key, kind: 'assumption', id: a.id }, 'Assumption', a.statement));
    const phase = c.implementationPhase ? ` · ${c.implementationPhase}` : '';
    add(immediateNextSteps, { priorityKey: key, kind: 'priorityMilestone' }, `Priority milestone${phase}`, c.milestoneTimeframe);
    p?.activities.forEach(a => {
      add(immediateNextSteps, { priorityKey: key, kind: 'activity', id: a.id }, `Activity${phase}`, a.statement.trim() ? a.statement + (actor(a.implementingActorId) ? ` Lead: ${actor(a.implementingActorId)}.` : '') + (a.timeframe.trim() ? ` Timing: ${a.timeframe}` : '') : '');
      add(immediateNextSteps, { priorityKey: key, kind: 'activityMilestone', id: a.id }, `Activity milestone${phase}`, a.milestone);
    });
    p?.dependencies.filter(d => d.status !== 'Met').forEach(d => add(immediateNextSteps, { priorityKey: key, kind: 'dependency', id: d.id }, `Dependency · ${d.status}${phase}`, d.statement));
  }
  const evidence = existingEvidence(data).map(e => ({ key: e.id, evidenceId: e.id, label: e.sourceTitle, text: e.comment.trim() || `${e.sourceType} · ${e.dateVerified || 'Review date not recorded'}` }));
  return { priorities, evidence, interventions, criticalItems, immediateNextSteps };
}

export function validExecutiveSelection(value: unknown): value is ExecutiveBriefSelection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const s = value as Record<string, unknown>;
  if (Object.keys(s).sort().join() !== Object.keys(emptyExecutiveSelection()).sort().join()) return false;
  if (s.primaryPriorityKey !== null && (typeof s.primaryPriorityKey !== 'string' || !s.primaryPriorityKey.trim())) return false;
  for (const key of ['capacityGapKeys', 'evidenceIds']) {
    const items = s[key];
    if (!Array.isArray(items) || items.length > 3 || items.some(x => typeof x !== 'string' || !x.trim()) || new Set(items).size !== items.length) return false;
  }
  for (const [key, kinds] of Object.entries({ interventions: ['individual', 'organizational', 'environment'], criticalItems: ['risk', 'assumption'], immediateNextSteps: ['activity', 'activityMilestone', 'priorityMilestone', 'dependency'] })) {
    const items = s[key];
    if (!Array.isArray(items) || items.length > 3) return false;
    for (const r of items) {
      if (!r || typeof r !== 'object' || typeof r.priorityKey !== 'string' || !r.priorityKey.trim() || !kinds.includes(r.kind)) return false;
      const needsId = ['assumption', 'activity', 'activityMilestone', 'dependency'].includes(r.kind);
      if (Object.keys(r).sort().join() !== (needsId ? ['id', 'kind', 'priorityKey'] : ['kind', 'priorityKey']).sort().join()) return false;
      if (needsId && (typeof r.id !== 'string' || !r.id.trim())) return false;
    }
    if (new Set(items.map(executiveRefKey)).size !== items.length) return false;
  }
  return true;
}

export function normalizeExecutiveReferences(data: UnpolProjectData): UnpolProjectData {
  const s = data.executiveBriefSelection ?? emptyExecutiveSelection();
  const c = executiveCandidates(data);
  const validPriority = (key: string) => c.priorities.some(p => p.key === key);
  const keep = (refs: ExecutiveReference[], candidates: ExecutiveItem[]) => refs.filter(r => candidates.some(x => x.key === executiveRefKey(r)));
  return { ...data, executiveBriefSelection: { primaryPriorityKey: s.primaryPriorityKey && validPriority(s.primaryPriorityKey) ? s.primaryPriorityKey : null,
    capacityGapKeys: s.capacityGapKeys.filter(validPriority), evidenceIds: s.evidenceIds.filter(id => c.evidence.some(e => e.key === id)),
    interventions: keep(s.interventions, c.interventions), criticalItems: keep(s.criticalItems, c.criticalItems), immediateNextSteps: keep(s.immediateNextSteps, c.immediateNextSteps) } };
}

export function buildExecutiveBriefModel(data: UnpolProjectData) {
  const selection = normalizeExecutiveReferences(data).executiveBriefSelection!;
  const c = executiveCandidates(data);
  const primary = selection.primaryPriorityKey ? data.customCells[selection.primaryPriorityKey] : undefined;
  const actor = (id: string | null | undefined) => data.stakeholders.find(s => s.id === id)?.name || 'Not recorded.';
  const resolve = (refs: ExecutiveReference[], candidates: ExecutiveItem[]) => refs.flatMap(r => { const item = candidates.find(i => i.key === executiveRefKey(r)); return item ? [item] : []; });
  const model = {
    title: 'Executive CBD Brief', status: 'UNOFFICIAL — DRAFT FOR REVIEW',
    context: data.profile.missionName || data.profile.countryName || 'Context not recorded', date: data.profile.assessmentDate || 'Date not recorded',
    primaryPriorityKey: selection.primaryPriorityKey, primaryProblem: primary?.capacityProblem || 'Primary management problem not selected.',
    evidence: selection.evidenceIds.flatMap(id => c.evidence.filter(e => e.key === id)),
    ownership: { leadStakeholderId: primary?.leadStakeholderId ?? null, counterpartActorId: primary?.resultsPlan?.ownership.counterpartActorId ?? null, lead: actor(primary?.leadStakeholderId), counterpart: actor(primary?.resultsPlan?.ownership.counterpartActorId), status: primary?.resultsPlan?.ownership.status || 'Not recorded.' },
    capacityGaps: selection.capacityGapKeys.flatMap(key => c.priorities.filter(p => p.key === key)),
    interventions: resolve(selection.interventions, c.interventions), expectedResult: primary?.planningObjective.trim() || 'Not yet recorded.',
    criticalItems: resolve(selection.criticalItems, c.criticalItems), immediateNextSteps: resolve(selection.immediateNextSteps, c.immediateNextSteps),
    notice: 'Planning support only. Consultation and selection do not imply approval, funding or authorization.'
  };
  const sections = executiveSections(model);
  // Conservative physical-page estimate at the fixed readable type size; never truncates content.
  const estimatedLines = sections.reduce((sum, s) => sum + 2 + s.lines.reduce((n, line) => n + line.split('\n').reduce((v, part) => v + Math.max(1, Math.ceil(part.length / 100)), 0), 0), 0);
  const exceedsPage = estimatedLines > 52 || model.context.length > 180;
  const cautions = [!primary && 'No primary management problem selected.', primary && !primary.planningObjective.trim() && 'Primary problem has no expected result.', !model.evidence.length && 'Executive Brief has no evidence selected.', (!primary?.leadStakeholderId || !primary?.resultsPlan?.ownership.counterpartActorId) && 'Ownership is not recorded.', !model.immediateNextSteps.length && 'No immediate next steps selected.', exceedsPage && EXECUTIVE_FIT_MESSAGE].filter((x): x is string => Boolean(x));
  return { ...model, sections, cautions, pageFit: { estimatedLines, exceedsPage } };
}
type CoreModel = { primaryProblem: string; evidence: ExecutiveItem[]; ownership: { lead: string; counterpart: string; status: string }; capacityGaps: { text: string }[]; interventions: ExecutiveItem[]; expectedResult: string; criticalItems: ExecutiveItem[]; immediateNextSteps: ExecutiveItem[] };
export function executiveSections(m: CoreModel) {
  const items = (values: ExecutiveItem[], empty: string) => values.length ? values.map(x => `${x.label}: ${x.text}`) : [empty];
  return [
    { title: 'Management Problem', lines: [m.primaryProblem] },
    { title: 'Evidence', lines: items(m.evidence, 'No evidence selected for executive presentation.') },
    { title: 'Ownership', lines: [`Accountable lead: ${m.ownership.lead}`, `Counterpart owner: ${m.ownership.counterpart}`, `Ownership status: ${m.ownership.status}`] },
    { title: 'Priority Capacity Gaps', lines: m.capacityGaps.length ? m.capacityGaps.map(x => x.text) : ['No capacity gaps selected.'] },
    { title: 'Selected Interventions', lines: items(m.interventions, 'No interventions selected.') },
    { title: 'Expected Result', lines: [m.expectedResult] },
    { title: 'Critical Risks / Assumptions', lines: items(m.criticalItems, 'No risks or assumptions selected.') },
    { title: 'Immediate Next Steps', lines: items(m.immediateNextSteps, 'No immediate next steps selected.') }
  ];
}
export type ExecutiveBriefModel = ReturnType<typeof buildExecutiveBriefModel>;
export function executiveBriefMarkdown(m: ExecutiveBriefModel) {
  const escape = (s: string) => s.replace(/([\\`*_{}\[\]<>#|])/g, '\\$1');
  return `# ${m.title}\n\n${m.status}\n\n${escape(m.context)} · ${escape(m.date)}\n\n` + m.sections.map(s => `## ${s.title}\n\n${s.lines.map(line => `- ${escape(line)}`).join('\n')}\n`).join('\n') + `\n${m.notice}\n`;
}
