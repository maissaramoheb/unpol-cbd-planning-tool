import type { CbdCell, PlanningIndicator, ResultActivity, UnpolProjectData } from '../types';
import { emptyResultsPlan, structuredIndicators } from './resultsPlanning';
import { APP_VERSION } from './version';

export type OutputKind = 'logframe' | 'monitoring' | 'workplan';
export interface OutputTable { title: string; columns: string[]; widths: number[]; rows: string[][] }
export interface OutputSection { title: string; notes: string[]; tables: OutputTable[] }
export interface PlanningOutput {
  kind: OutputKind; title: string; context: string; status: string; version: string;
  metadata: string[]; notice: string; sections: OutputSection[];
}
export const OUTPUT_TITLES: Record<OutputKind, string> = {
  logframe: 'Logical Framework Matrix', monitoring: 'Monitoring & Evaluation Matrix', workplan: 'Implementation Workplan'
};
export const COMPLETENESS_NOTICE = 'Completeness reflects information recorded in the planning workspace. Missing entries do not imply that the issue was assessed and found unnecessary.';
const recorded = (text?: string) => text?.trim() ? text : 'Not recorded';
const title = (key: string) => key.split('|').join(' × ');
const levelName = { individual: 'Individual', organizational: 'Organizational', environment: 'Enabling environment' };
const lines = (values: string[], empty = 'Not recorded') => values.length ? values.join('\n') : empty;

export function activityDescription(cell: CbdCell, activity: ResultActivity): string {
  return lines([
    ...(activity.interventionLevel ? [`${levelName[activity.interventionLevel]} intervention: ${recorded(cell[activity.interventionLevel])}`] : []),
    ...(activity.statement.trim() ? [activity.statement] : [])
  ]);
}

/** A read-only projection. No schema changes, normalization writes or inferred results. */
export function buildPlanningOutput(data: UnpolProjectData, kind: OutputKind, priorityKey?: string): PlanningOutput {
  const entries = Object.entries(data.customCells).filter(([key]) => !priorityKey || key === priorityKey);
  const actor = (id: string | null | undefined) => data.stakeholders.find(s => s.id === id)?.name || 'Not assigned';
  const actors = (ids: string[]) => lines(ids.map(actor), 'Not assigned');
  const sections: OutputSection[] = [];
  const measurement: string[][] = [], monitoring: string[][] = [], delivery: string[][] = [], conditions: string[][] = [];
  for (const [key, cell] of entries) {
    const p = cell.resultsPlan ?? emptyResultsPlan();
    const indicators = structuredIndicators(cell);
    const priority = title(key);
    const outputName = (id: string) => {
      const o = p.outputs.find(o => o.id === id);
      return o ? `${o.reference}: ${recorded(o.statement)}` : 'Not assigned';
    };
    const linkedResult = (i: PlanningIndicator) => {
      if (i.resultLevel === 'Intended Result / Outcome' && i.linkedRecordId === key) return `Intended Result / Outcome: ${recorded(cell.planningObjective)}`;
      if (i.resultLevel === 'Output' && i.linkedRecordId) return outputName(i.linkedRecordId);
      const a = i.resultLevel === 'Activity / Process' && p.activities.find(a => a.id === i.linkedRecordId);
      return a ? `${a.reference}: ${activityDescription(cell, a)}` : 'Not assigned';
    };
    const assumptionText = lines(p.assumptions.map(a => `${a.importance}: ${recorded(a.statement)}\nReview: ${recorded(a.reviewNote)}`));
    const ownership = [
      `Counterpart owner: ${actor(p.ownership.counterpartActorId)}. Status: ${p.ownership.status}.`,
      `Ownership note: ${recorded(p.ownership.note)}`,
      `Sustainability: ${lines(p.sustainability.map(s => `${s.dimension}: ${recorded(s.requirement)}`))}`
    ];
    const risk = `Priority-level risk: ${recorded(cell.risks)}\nMitigation: ${recorded(p.riskManagement.mitigation)}\nResponsible actor: ${actor(p.riskManagement.responsibleActorId)}\nReview: ${recorded(p.riskManagement.reviewNote)}`;
    if (kind === 'logframe') {
      const rows: string[][] = [];
      const addResult = (label: string, selected: PlanningIndicator[]) => {
        if (!selected.length) rows.push([label, 'No linked indicator recorded', 'Not recorded', 'Not recorded', 'Not recorded', 'See priority-level assumptions below']);
        selected.forEach(i => rows.push([label, recorded(i.statement), recorded(i.baseline), recorded(i.target), recorded(i.verification), 'See priority-level assumptions below']));
      };
      addResult(`Intended Result / Outcome\n${recorded(cell.planningObjective)}`, indicators.filter(i => i.resultLevel === 'Intended Result / Outcome' && i.linkedRecordId === key));
      p.outputs.forEach(o => addResult(`${o.reference}\n${recorded(o.statement)}${o.note ? `\nNote: ${o.note}` : ''}`, indicators.filter(i => i.resultLevel === 'Output' && i.linkedRecordId === o.id)));
      const other = indicators.filter(i => i.resultLevel === 'Activity / Process' || linkedResult(i) === 'Not assigned');
      sections.push({ title: priority, notes: [], tables: [{ title: 'Results hierarchy', columns: ['Results Logic', 'Indicator', 'Baseline', 'Target', 'Verification', 'Assumptions'], widths: [24, 20, 13, 15, 17, 11], rows }] });
      const notes = [
        ...(!p.outputs.length ? ['No outputs have been recorded for this priority.'] : []),
        `Priority-level assumptions (not row-specific):\n${assumptionText}`,
        ...p.outputs.map(o => `Key activities for ${o.reference}:\n${lines(p.activities.filter(a => a.outputIds.includes(o.id)).map(a => `${a.reference}: ${activityDescription(cell, a)}`), 'No linked activities recorded')}`),
        ...ownership
      ];
      sections.push({ title: `${priority} — Supporting considerations`, notes, tables: other.length ? [{ title: 'Activity / Process and unassigned indicators', columns: ['Result level', 'Linked result', 'Indicator', 'Baseline', 'Target', 'Verification'], widths: [12, 24, 24, 12, 12, 16], rows: other.map(i => [i.resultLevel, linkedResult(i), recorded(i.statement), recorded(i.baseline), recorded(i.target), recorded(i.verification)]) }] : [] });
    }
    indicators.forEach((i, index) => {
      // Exact statements and structural result references identify the same record across table bands.
      const identity = [priority, `Indicator ${index + 1}\n${recorded(i.statement)}`];
      const linked = linkedResult(i);
      measurement.push([...identity, linked.startsWith(i.resultLevel) ? linked : `${i.resultLevel}\n${linked}`, recorded(i.baseline), recorded(i.target), recorded(i.verification)]);
      monitoring.push([...identity, i.frequency, actor(i.responsibleActorId), `Disaggregation: ${recorded(i.disaggregation)}\nNotes: ${recorded(i.note)}`]);
    });
    const dependency = (id: string) => {
      const d = p.dependencies.find(d => d.id === id);
      if (!d) return 'Not assigned';
      const target = d.linkedPriorityKey && data.customCells[d.linkedPriorityKey];
      const linked = d.type === 'Stakeholder action' ? actor(d.linkedRecordId) : target ? `${title(d.linkedPriorityKey!)}${d.type === 'Activity' ? ` / ${target.resultsPlan?.activities.find(a => a.id === d.linkedRecordId)?.reference || 'Not assigned'}` : ''}` : '';
      return `${d.type} — ${d.status}: ${recorded(d.statement)}${linked ? `\nLinked to: ${linked}` : ''}`;
    };
    const resource = (id: string) => {
      const r = p.resources.find(r => r.id === id);
      return r ? `${r.category} — ${r.availability}: ${recorded(r.statement)}` : 'Not assigned';
    };
    p.activities.forEach(a => {
      const identity = `${priority}\n${a.reference}`;
      delivery.push([identity, cell.implementationPhase || 'Not assigned', lines(a.outputIds.map(outputName), 'Not assigned'), activityDescription(cell, a), actor(a.implementingActorId), actors(a.supportingActorIds)]);
      conditions.push([identity, `Activity timeframe: ${recorded(a.timeframe)}\nActivity milestone: ${recorded(a.milestone)}\nPriority milestone / timeframe: ${recorded(cell.milestoneTimeframe)}`, lines(a.dependencyIds.map(dependency)), lines(a.resourceIds.map(resource)), risk]);
    });
    if (kind === 'workplan') sections.push({ title: `${priority} — Accountability and supporting conditions`, tables: [], notes: [
      `Priority Lead / Accountable Actor: ${actor(cell.leadStakeholderId)}. Priority supporting actors: ${actors(cell.supportingStakeholderIds || [])}`,
      `Recorded phase: ${cell.implementationPhase || 'Not assigned'}. Priority milestone / timeframe: ${recorded(cell.milestoneTimeframe)}`,
      `Recorded sequencing rationale: ${recorded(cell.sequencing)}`,
      ...(!p.activities.length ? ['No structured activities have been recorded for this priority. Existing interventions are not converted into activities automatically.'] : []),
      ...(!p.activities.length ? [risk] : []),
      ...p.dependencies.filter(d => !p.activities.some(a => a.dependencyIds.includes(d.id))).map(d => `Dependency not linked to an activity:\n${dependency(d.id)}`),
      ...p.resources.filter(r => !p.activities.some(a => a.resourceIds.includes(r.id))).map(r => `Resource not linked to an activity:\n${resource(r.id)}`),
      ...ownership
    ] });
  }
  if (kind === 'monitoring') sections.push({ title: 'Indicator register', notes: measurement.length ? ['The two table bands describe the same indicators: measurement, then monitoring arrangements. Match by priority and indicator number. Indicator numbers show the current workspace order, not permanent record IDs.'] : ['No indicators have been recorded in the selected scope.'], tables: measurement.length ? [
    { title: 'Measurement', columns: ['CBD Priority', 'Indicator', 'Result level and linked result', 'Baseline', 'Target', 'Verification source'], widths: [15, 23, 23, 12, 12, 15], rows: measurement },
    { title: 'Monitoring arrangements', columns: ['CBD Priority', 'Indicator', 'Frequency', 'Responsible actor', 'Disaggregation / Notes'], widths: [17, 28, 12, 18, 25], rows: monitoring }
  ] : [] });
  if (kind === 'workplan') sections.unshift({ title: 'Activity register', notes: delivery.length ? ['Delivery and implementation conditions are paired by CBD priority and the recorded ACT reference. Risks and phases belong to the priority, not a separate activity risk register or schedule.'] : ['No structured activities have been recorded in the selected scope.'], tables: delivery.length ? [
    { title: 'Delivery', columns: ['Priority / Activity ref', 'Phase', 'Output', 'Activity / intervention', 'Implementing Lead', 'Supporting actors'], widths: [15, 7, 19, 30, 15, 14], rows: delivery },
    { title: 'Implementation conditions', columns: ['Priority / Activity ref', 'Timeframe / Milestone', 'Dependencies', 'Resources / Requirements', 'Priority risk / mitigation'], widths: [15, 19, 21, 20, 25], rows: conditions }
  ] : [] });
  if (!entries.length) sections.splice(0, sections.length, { title: 'Planning scope', notes: ['No configured CBD priorities in this scope. Record planning information in the workspace before generating a populated output.'], tables: [] });
  return { kind, title: OUTPUT_TITLES[kind], status: 'UNOFFICIAL — DRAFT FOR REVIEW', version: APP_VERSION,
    context: `${recorded(data.profile.countryName)} · ${recorded(data.profile.missionName)}`,
    metadata: [`Prepared by: ${data.profile.analystName || 'Participant / Team'}`, `Assessment date: ${recorded(data.profile.assessmentDate)}`, `Scope: ${priorityKey ? title(priorityKey) : 'All CBD Priorities'}`, 'Planning-support prototype. This output is not an official UN assessment, recommendation or approved template.', ...(data.profile.templateId === 'fictional-carana-demo' ? ['CARANA is a fictional UN peacekeeping training and demonstration context.'] : [])],
    notice: COMPLETENESS_NOTICE, sections };
}

const escapeMarkdown = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\/g, '\\\\').replace(/([|`*_\[\]#])/g, '\\$1').replace(/\r?\n/g, '<br>');
export function planningOutputMarkdown(model: PlanningOutput): string {
  return [`# ${model.title}`, model.status, escapeMarkdown(model.context), ...model.metadata.map(escapeMarkdown), `Application version: ${model.version}`, model.notice,
    ...model.sections.flatMap(s => [`## ${escapeMarkdown(s.title)}`, ...s.notes.map(escapeMarkdown), ...s.tables.flatMap(t => [`### ${escapeMarkdown(t.title)}`, `| ${t.columns.map(escapeMarkdown).join(' | ')} |\n| ${t.columns.map(() => '---').join(' | ')} |\n${t.rows.map(r => `| ${r.map(escapeMarkdown).join(' | ')} |`).join('\n')}`])])
  ].join('\n\n');
}
