import React, { useState } from 'react';
import type {
  CbdCell,
  UnpolProjectData,
  ResultsPlan,
  PlanningIndicator,
  ResultActivity,
  ResultOutput,
  ResultAssumption,
  ResultDependency,
  ResourceRequirement
} from '../types';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { StageLead } from './StageLead';
import {
  AVAILABILITY,
  DEPENDENCY_STATUS,
  DEPENDENCY_TYPES,
  FREQUENCIES,
  IMPORTANCE,
  LEVELS,
  OWNERSHIP_STATUS,
  RESOURCE_CATEGORIES,
  RESULT_LEVELS,
  SUSTAINABILITY_DIMENSIONS,
  createIndicator,
  emptyResultsPlan,
  nextReference,
  resultsCautions,
  resultsCompleteness,
  structuredIndicators
} from '../lib/resultsPlanning';
import {
  ChevronDown,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2
} from 'lucide-react';

type Option = { value: string; label: string };
const options = (values: readonly string[]): Option[] =>
  values.map(value => ({
    value,
    label:
      value === 'environment'
        ? 'Enabling Environment'
        : value.charAt(0).toUpperCase() + value.slice(1)
  }));

const Text = ({
  label,
  value,
  onChange,
  help,
  rows = 2
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
  rows?: number;
}) => (
  <TextArea
    rows={rows}
    label={label}
    value={value}
    onChange={e => onChange(e.target.value)}
    helperText={help}
  />
);

const Choice = ({
  label,
  value,
  items,
  onChange,
  help
}: {
  label: string;
  value: string | null;
  items: Option[];
  onChange: (v: string) => void;
  help?: string;
}) => (
  <Select
    label={label}
    value={value ?? ''}
    options={items}
    onChange={e => onChange(e.target.value)}
    helperText={help}
  />
);

function Multi({
  label,
  values,
  items,
  onChange
}: {
  label: string;
  values: string[];
  items: Option[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <fieldset className="min-w-0 rounded-md border border-border-default bg-surface-subtle/50 p-3.5">
      <legend className="px-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </legend>
      <div className="flex flex-wrap gap-x-4 gap-y-2.5 pt-1">
        {items.length ? (
          items.map(o => (
            <label
              key={o.value}
              className="flex min-w-0 items-center gap-2 text-xs text-text-primary cursor-pointer select-none"
            >
              <input
                type="checkbox"
                className="rounded border-border-default text-action-primary focus:ring-focus-ring w-3.5 h-3.5"
                checked={values.includes(o.value)}
                onChange={e =>
                  onChange(
                    e.target.checked
                      ? [...values, o.value]
                      : values.filter(v => v !== o.value)
                  )
                }
              />
              <span className="break-words">{o.label}</span>
            </label>
          ))
        ) : (
          <span className="text-xs text-text-muted italic">No records available to link.</span>
        )}
      </div>
    </fieldset>
  );
}

const COMPLETENESS_STYLE: Record<string, { dot: string; text: string; bg: string }> = {
  'Recorded': {
    dot: 'bg-emerald-600',
    text: 'text-emerald-800',
    bg: 'bg-emerald-50/40'
  },
  'Partially recorded': {
    dot: 'bg-amber-500',
    text: 'text-amber-800',
    bg: 'bg-amber-50/40'
  },
  'Not recorded': {
    dot: 'bg-slate-400',
    text: 'text-slate-600',
    bg: 'bg-surface-subtle'
  }
};

interface Props {
  data: UnpolProjectData;
  onUpdateCell: (key: string, cell: CbdCell) => void;
  onPrev: () => void;
  onExport: () => void;
}

export function ResultsImplementation({ data, onUpdateCell, onPrev, onExport }: Props) {
  const [selected, setSelected] = useState('');
  const keys = Object.keys(data.customCells);
  const key = keys.includes(selected) ? selected : keys[0];

  return (
    <div className="min-w-0 space-y-6 print:hidden">
      <StageLead stage={7} />

      {data.profile.missionName.includes('CARANA') && (
        <div className="rounded-md border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-xs font-medium text-amber-900 flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-700 shrink-0" />
          <span>
            FICTIONAL EXERCISE MATERIAL — baselines and planning judgements are illustrative, not verified assessments.
          </span>
        </div>
      )}

      {key ? (
        <div className="space-y-6">
          {/* Priority Context Header */}
          <div className="rounded-lg border border-border-strong bg-surface-raised p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-action-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                  CURRENT CBD PRIORITY
                </span>
                <span className="text-xs text-text-muted">Results Plan Context</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary truncate">
                {key.replace('|', ' × ')}
              </h2>
            </div>
            <div className="w-full md:w-80 shrink-0">
              <Choice
                label="Select CBD Priority"
                value={key}
                items={keys.map(k => ({ value: k, label: k.replace('|', ' × ') }))}
                onChange={setSelected}
              />
            </div>
          </div>

          <PriorityPlan
            key={key}
            data={data}
            cell={data.customCells[key]}
            onChange={cell => onUpdateCell(key, cell)}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border-default bg-surface-raised p-8 text-sm text-text-muted text-center">
          No configured CBD priorities. Record a priority in Stage 5 to begin its Results Plan.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-2">
        <Button variant="secondary" onClick={onPrev}>
          Back: Prioritization &amp; Sequencing
        </Button>
        <Button variant="primary" onClick={onExport}>
          Open Planning Brief
        </Button>
      </div>
    </div>
  );
}

function PriorityPlan({
  data,
  cell,
  onChange
}: {
  data: UnpolProjectData;
  cell: CbdCell;
  onChange: (cell: CbdCell) => void;
}) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    '7A': true,
    '7B': false,
    '7C': false,
    '7D': false
  });

  const [openedRecord, setOpenedRecord] = useState<Record<string, string | null>>({
    outputs: null,
    assumptions: null,
    indicators: null,
    activities: null,
    dependencies: null,
    resources: null,
    sustainability: null
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRecord = (group: string, recordId: string) => {
    setOpenedRecord(prev => ({
      ...prev,
      [group]: prev[group] === recordId ? null : recordId
    }));
  };

  const p = cell.resultsPlan ?? emptyResultsPlan();
  const indicators = structuredIndicators(cell);
  const update = (patch: Partial<CbdCell>) => onChange({ ...cell, ...patch });
  const plan = (patch: Partial<ResultsPlan>) => update({ resultsPlan: { ...p, ...patch } });
  const actors = [
    { value: '', label: 'Not assigned' },
    ...data.stakeholders.map(s => ({ value: s.id, label: s.name }))
  ];
  const refs = (records: { id: string; reference: string; statement: string }[]) =>
    records.map(r => ({
      value: r.id,
      label: r.reference + ': ' + (r.statement || 'Statement not recorded')
    }));
  const noLink = { value: '', label: 'Not linked' };
  const uid = () => crypto.randomUUID();
  const cautions = resultsCautions(cell);
  const completeness = resultsCompleteness(cell);
  const actorName = (id: string | null) =>
    actors.find(a => a.value === id)?.label || 'Not recorded';

  const confirmRemove = () =>
    confirm('Remove this record? Linked references will be cleared; other planning text will be retained.');

  return (
    <div className="min-w-0 space-y-6">
      {/* 3B. Completeness Strip */}
      <div className="rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
        <div className="px-4 py-2 bg-surface-subtle border-b border-border-default flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Results Readiness / Completeness Strip
          </span>
          <span className="text-[11px] text-text-muted font-normal">
            Descriptive status overview
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-border-default">
          {completeness.map(c => {
            const style = COMPLETENESS_STYLE[c.status] || COMPLETENESS_STYLE['Not recorded'];
            return (
              <div key={c.label} className={`p-3 flex flex-col gap-1 min-w-0 ${style.bg}`}>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-text-muted truncate">
                  {c.label}
                </dt>
                <dd className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} aria-hidden="true" />
                  <span className={`truncate ${style.text}`}>{c.status}</span>
                </dd>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3C. Planning Cautions */}
      {cautions.length > 0 && (
        <details className="group rounded-lg border border-amber-300 bg-amber-50/50 overflow-hidden">
          <summary className="cursor-pointer px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-amber-900 select-none hover:bg-amber-50/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span>Planning cautions ({cautions.length}) — optional review</span>
            </div>
            <ChevronDown
              size={14}
              className="text-amber-700 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <ul className="px-4 pb-3 pt-1.5 list-disc space-y-1 ps-8 text-xs text-amber-950/80 border-t border-amber-200/60 bg-amber-50/30">
            {cautions.map(c => (
              <li key={c} className="leading-relaxed">
                {c}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* ================================================== */}
      {/* 07A — RESULTS LOGIC */}
      {/* ================================================== */}
      <section className="min-w-0 rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
        <button
          type="button"
          aria-expanded={openSections['7A']}
          aria-controls="results-7A"
          onClick={() => toggleSection('7A')}
          className="flex w-full items-center justify-between gap-3 p-4 sm:p-5 text-start bg-surface-raised hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-action-primary border border-blue-200 shrink-0">
              07A
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                RESULTS LOGIC
              </h3>
              <p className="text-xs text-text-muted font-normal mt-0.5">
                Capacity problem, intended result, outputs, change logic, and assumptions
              </p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`text-text-muted transition-transform duration-200 shrink-0 ${
              openSections['7A'] ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          id="results-7A"
          hidden={!openSections['7A']}
          className="min-w-0 space-y-6 border-t border-border-default p-4 sm:p-6 bg-surface-base"
        >
          {/* 5A. Results Logic Spine */}
          <div className="rounded-lg border border-border-default bg-surface-subtle p-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
              Results Logic Chain
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 text-xs">
              <div className="flex-1 min-w-0 bg-surface-raised p-3 rounded-md border border-border-default flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  1. Capacity Problem / Gap
                </span>
                <p className="text-xs text-text-secondary line-clamp-2 italic">
                  {cell.capacityProblem?.trim() || 'Not recorded in Stage 5'}
                </p>
              </div>
              <span className="text-text-muted hidden md:inline font-bold self-center">→</span>
              <span className="text-text-muted md:hidden text-center font-bold">↓</span>
              <div className="flex-1 min-w-0 bg-blue-50/50 p-3 rounded-md border border-blue-200 flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-action-primary">
                  2. Intended Result / Objective
                </span>
                <p className="text-xs font-semibold text-text-primary line-clamp-2">
                  {cell.planningObjective?.trim() || 'Record planning objective below'}
                </p>
              </div>
              <span className="text-text-muted hidden md:inline font-bold self-center">→</span>
              <span className="text-text-muted md:hidden text-center font-bold">↓</span>
              <div className="flex-1 min-w-0 bg-surface-raised p-3 rounded-md border border-border-default flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  3. Concrete Outputs
                </span>
                <p className="text-xs font-semibold text-text-primary">
                  {p.outputs.length} {p.outputs.length === 1 ? 'output recorded' : 'outputs recorded'}
                </p>
              </div>
            </div>
          </div>

          {/* 5B. Capacity Problem (Read-only, inherited from Stage 5) */}
          <div className="rounded-lg border border-border-default bg-surface-subtle p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Capacity Problem / Gap
              </span>
              <Badge variant="slate" className="text-[10px]">
                Source: Stage 5
              </Badge>
            </div>
            <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
              {cell.capacityProblem || 'Not recorded in Stage 5.'}
            </p>
          </div>

          {/* 5C. Planning Objective / Intended Result (Shared with Stage 5) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="planning-objective"
                className="text-xs font-semibold text-text-secondary"
              >
                Planning Objective / Intended Result
              </label>
              <Badge variant="blue" className="text-[10px]">
                Shared with Stage 5
              </Badge>
            </div>
            <TextArea
              id="planning-objective"
              rows={2}
              value={cell.planningObjective}
              onChange={e => update({ planningObjective: e.target.value })}
              helperText="The same Planning Objective used in Stage 5; no separate outcome statement is created."
            />
          </div>

          {/* 5D. Outputs Registry */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-2">
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Outputs ({p.outputs.length})
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  An output is a concrete product, service, system, process or capability that the intervention delivers.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const record = {
                    id: uid(),
                    reference: nextReference('OUT', p.outputs),
                    statement: '',
                    interventionLevels: [],
                    note: ''
                  };
                  plan({ outputs: [...p.outputs, record] });
                  setOpenedRecord(prev => ({ ...prev, outputs: record.id }));
                }}
              >
                <Plus size={14} className="mr-1" />
                Add Output
              </Button>
            </div>

            {p.outputs.length === 0 && (
              <p className="text-xs text-text-muted italic py-2">
                No outputs recorded. Add only what is useful for this plan.
              </p>
            )}

            <div className="divide-y divide-border-default border border-border-default rounded-lg overflow-hidden">
              {p.outputs.map(o => {
                const isOpen = openedRecord.outputs === o.id;
                return (
                  <div key={o.id} className="min-w-0 bg-surface-raised">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={'record-' + o.id}
                      onClick={() => toggleRecord('outputs', o.id)}
                      className="w-full text-start p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
                    >
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                        <span className="font-mono text-xs font-bold text-action-primary shrink-0">
                          {o.reference}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {o.statement || 'New output'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {o.interventionLevels.map(lvl => (
                          <Badge key={lvl} variant="slate" className="text-[10px]">
                            {lvl === 'environment' ? 'Environment' : lvl}
                          </Badge>
                        ))}
                        <ChevronDown
                          size={14}
                          className={`text-text-muted transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      id={'record-' + o.id}
                      hidden={!isOpen}
                      className="space-y-4 border-t border-border-default p-4 sm:p-5 bg-surface-subtle/30"
                    >
                      <Text
                        label="Output statement"
                        value={o.statement}
                        onChange={statement =>
                          plan({
                            outputs: p.outputs.map(r =>
                              r.id === o.id ? { ...r, statement } : r
                            )
                          })
                        }
                      />
                      <Multi
                        label="Linked intervention levels"
                        values={o.interventionLevels}
                        items={options(LEVELS)}
                        onChange={v =>
                          plan({
                            outputs: p.outputs.map(r =>
                              r.id === o.id
                                ? { ...r, interventionLevels: v as ResultOutput['interventionLevels'] }
                                : r
                            )
                          })
                        }
                      />
                      <Text
                        label="Output planning note"
                        value={o.note}
                        onChange={note =>
                          plan({
                            outputs: p.outputs.map(r =>
                              r.id === o.id ? { ...r, note } : r
                            )
                          })
                        }
                      />
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          aria-label={'Remove ' + o.reference}
                          onClick={() => {
                            if (confirmRemove()) {
                              plan({ outputs: p.outputs.filter(r => r.id !== o.id) });
                            }
                          }}
                        >
                          <Trash2 size={13} className="mr-1" />
                          Remove Output
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5E. Change Logic (Optional Theory of Change) */}
          <details className="group rounded-lg border border-border-default bg-surface-subtle/40 overflow-hidden">
            <summary className="cursor-pointer px-4 py-3 flex items-center justify-between text-xs font-bold text-text-primary uppercase tracking-wider select-none hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
              <span>Change Logic (Optional Theory of Change Synthesis)</span>
              <ChevronDown
                size={14}
                className="text-text-muted transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="p-4 sm:p-5 space-y-4 border-t border-border-default bg-surface-raised">
              <p className="text-xs text-text-muted italic">
                Analyst-entered reasoning; these structural links do not validate a causal model.
              </p>
              <Multi
                label="IF — intervention levels"
                values={p.changeLogic.interventionLevels}
                items={options(LEVELS)}
                onChange={v =>
                  plan({
                    changeLogic: {
                      ...p.changeLogic,
                      interventionLevels: v as ResultsPlan['changeLogic']['interventionLevels']
                    }
                  })
                }
              />
              {p.changeLogic.interventionLevels.map(l => (
                <div key={l} className="p-2.5 rounded bg-surface-subtle text-xs text-text-secondary border border-border-default/60">
                  <span className="font-semibold capitalize text-text-primary">{l}:</span>{' '}
                  {cell[l] || 'Intervention not recorded.'}
                </div>
              ))}
              <Multi
                label="IF — detailed activities"
                values={p.changeLogic.activityIds}
                items={refs(p.activities)}
                onChange={activityIds =>
                  plan({ changeLogic: { ...p.changeLogic, activityIds } })
                }
              />
              <div className="p-3 rounded bg-blue-50/50 border border-blue-200 text-xs">
                <strong className="text-action-primary">THEN — intended result:</strong>{' '}
                <span className="text-text-primary">
                  {cell.planningObjective || 'Record the shared Planning Objective above.'}
                </span>
              </div>
              <Text
                label="BECAUSE — mechanism / rationale"
                value={p.changeLogic.because}
                onChange={because =>
                  plan({ changeLogic: { ...p.changeLogic, because } })
                }
              />
              <Multi
                label="PROVIDED THAT — assumptions"
                values={p.changeLogic.assumptionIds}
                items={p.assumptions.map((a, i) => ({
                  value: a.id,
                  label: 'Assumption ' + (i + 1) + ': ' + a.statement
                }))}
                onChange={assumptionIds =>
                  plan({ changeLogic: { ...p.changeLogic, assumptionIds } })
                }
              />
            </div>
          </details>

          {/* 5F. Assumptions Registry */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-2">
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Assumptions ({p.assumptions.length})
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  An assumption is a condition believed necessary for expected results, but not fully controlled by the intervention. Risks remain in section 7D.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const record = {
                    id: uid(),
                    statement: '',
                    importance: 'Not assessed' as const,
                    reviewNote: ''
                  };
                  plan({ assumptions: [...p.assumptions, record] });
                  setOpenedRecord(prev => ({ ...prev, assumptions: record.id }));
                }}
              >
                <Plus size={14} className="mr-1" />
                Add Assumption
              </Button>
            </div>

            {p.assumptions.length === 0 && (
              <p className="text-xs text-text-muted italic py-2">
                No assumptions recorded. Add only what is useful for this plan.
              </p>
            )}

            <div className="divide-y divide-border-default border border-border-default rounded-lg overflow-hidden">
              {p.assumptions.map((a, i) => {
                const isOpen = openedRecord.assumptions === a.id;
                const importanceVariant =
                  a.importance === 'Critical'
                    ? 'rose'
                    : a.importance === 'Important'
                    ? 'blue'
                    : 'slate';
                return (
                  <div key={a.id} className="min-w-0 bg-surface-raised">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={'record-' + a.id}
                      onClick={() => toggleRecord('assumptions', a.id)}
                      className="w-full text-start p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
                    >
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                        <span className="font-mono text-xs font-semibold text-text-secondary shrink-0">
                          Assumption {i + 1}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {a.statement || 'New assumption'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={importanceVariant} className="text-[10px]">
                          {a.importance}
                        </Badge>
                        <ChevronDown
                          size={14}
                          className={`text-text-muted transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      id={'record-' + a.id}
                      hidden={!isOpen}
                      className="space-y-4 border-t border-border-default p-4 sm:p-5 bg-surface-subtle/30"
                    >
                      <Text
                        label="Assumption statement"
                        value={a.statement}
                        onChange={statement =>
                          plan({
                            assumptions: p.assumptions.map(r =>
                              r.id === a.id ? { ...r, statement } : r
                            )
                          })
                        }
                      />
                      <Choice
                        label="Importance"
                        value={a.importance}
                        items={options(IMPORTANCE)}
                        onChange={v =>
                          plan({
                            assumptions: p.assumptions.map(r =>
                              r.id === a.id
                                ? { ...r, importance: v as ResultAssumption['importance'] }
                                : r
                            )
                          })
                        }
                      />
                      <Text
                        label="Verification / review note"
                        value={a.reviewNote}
                        onChange={reviewNote =>
                          plan({
                            assumptions: p.assumptions.map(r =>
                              r.id === a.id ? { ...r, reviewNote } : r
                            )
                          })
                        }
                      />
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          aria-label={'Remove Assumption ' + (i + 1)}
                          onClick={() => {
                            if (confirmRemove()) {
                              plan({
                                assumptions: p.assumptions.filter(r => r.id !== a.id)
                              });
                            }
                          }}
                        >
                          <Trash2 size={13} className="mr-1" />
                          Remove Assumption
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 07B — MEASUREMENT (M&E Workbench) */}
      {/* ================================================== */}
      <section className="min-w-0 rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
        <button
          type="button"
          aria-expanded={openSections['7B']}
          aria-controls="results-7B"
          onClick={() => toggleSection('7B')}
          className="flex w-full items-center justify-between gap-3 p-4 sm:p-5 text-start bg-surface-raised hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-action-primary border border-blue-200 shrink-0">
              07B
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                MEASUREMENT
              </h3>
              <p className="text-xs text-text-muted font-normal mt-0.5">
                M&amp;E framework, indicators, baseline, target, verification, and measurement responsibilities
              </p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`text-text-muted transition-transform duration-200 shrink-0 ${
              openSections['7B'] ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          id="results-7B"
          hidden={!openSections['7B']}
          className="min-w-0 space-y-6 border-t border-border-default p-4 sm:p-6 bg-surface-base"
        >
          <p className="text-xs text-text-muted">
            These are the same indicators shown in Stage 5 and the Planning Brief, extended with optional measurement details. Baselines and targets may be qualitative or quantitative.
          </p>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-2">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Indicators ({indicators.length})
              </h4>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const record = createIndicator(uid());
                  update({ indicators: [...indicators, record] });
                  setOpenedRecord(prev => ({ ...prev, indicators: record.id }));
                }}
              >
                <Plus size={14} className="mr-1" />
                Add Indicator
              </Button>
            </div>

            {indicators.length === 0 && (
              <p className="text-xs text-text-muted italic py-2">
                No indicators recorded. Add only what is useful for this plan.
              </p>
            )}

            <div className="divide-y divide-border-default border border-border-default rounded-lg overflow-hidden">
              {indicators.map((i, n) => {
                const isOpen = openedRecord.indicators === i.id;
                const levelVariant =
                  i.resultLevel === 'Intended Result / Outcome'
                    ? 'blue'
                    : i.resultLevel === 'Output'
                    ? 'teal'
                    : 'slate';

                return (
                  <div key={i.id} className="min-w-0 bg-surface-raised">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={'record-' + i.id}
                      onClick={() => toggleRecord('indicators', i.id)}
                      className="w-full text-start p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
                    >
                      <div className="flex items-start md:items-center gap-2.5 min-w-0 flex-1">
                        <span className="font-mono text-xs font-semibold text-text-secondary shrink-0">
                          Indicator {n + 1}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {i.statement || 'New indicator'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5 shrink-0 text-xs">
                        <Badge variant={levelVariant} className="text-[10px]">
                          {i.resultLevel}
                        </Badge>
                        <div className="hidden lg:flex items-center gap-1 font-mono text-[11px] text-text-muted bg-surface-subtle px-2 py-0.5 rounded border border-border-default/60">
                          <span className="truncate max-w-[80px]">{i.baseline || '—'}</span>
                          <span>→</span>
                          <span className="truncate max-w-[80px] font-medium text-text-secondary">
                            {i.target || '—'}
                          </span>
                        </div>
                        {i.responsibleActorId && (
                          <span className="hidden sm:inline text-[11px] text-text-secondary font-medium">
                            {actorName(i.responsibleActorId)}
                          </span>
                        )}
                        <ChevronDown
                          size={14}
                          className={`text-text-muted transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      id={'record-' + i.id}
                      hidden={!isOpen}
                      className="space-y-5 border-t border-border-default p-4 sm:p-5 bg-surface-subtle/30"
                    >
                      {/* Sub-panel 1: Definition */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          1. Measurement Definition
                        </span>
                        <Text
                          label="Indicator statement"
                          value={i.statement}
                          onChange={statement =>
                            update({
                              indicators: indicators.map(r =>
                                r.id === i.id ? { ...r, statement } : r
                              )
                            })
                          }
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <Choice
                            label="Result level"
                            value={i.resultLevel}
                            items={options(RESULT_LEVELS)}
                            onChange={v =>
                              update({
                                indicators: indicators.map(r =>
                                  r.id === i.id
                                    ? {
                                        ...r,
                                        resultLevel: v as PlanningIndicator['resultLevel'],
                                        linkedRecordId:
                                          v === 'Intended Result / Outcome' ? cell.key : null
                                      }
                                    : r
                                )
                              })
                            }
                          />
                          {(i.resultLevel === 'Output' || i.resultLevel === 'Activity / Process') && (
                            <Choice
                              label="Linked result record"
                              value={i.linkedRecordId}
                              items={[
                                noLink,
                                ...refs(i.resultLevel === 'Output' ? p.outputs : p.activities)
                              ]}
                              onChange={v =>
                                update({
                                  indicators: indicators.map(r =>
                                    r.id === i.id ? { ...r, linkedRecordId: v || null } : r
                                  )
                                })
                              }
                            />
                          )}
                        </div>
                      </div>

                      {/* Sub-panel 2: Parameters (Baseline & Target paired) */}
                      <div className="rounded-lg border border-border-default bg-surface-raised p-4 space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          2. Measurement Parameters
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
                          <Text
                            label="Baseline (Current Condition)"
                            value={i.baseline}
                            onChange={baseline =>
                              update({
                                indicators: indicators.map(r =>
                                  r.id === i.id ? { ...r, baseline } : r
                                )
                              })
                            }
                            help="Current value or condition before implementation."
                          />
                          <div className="hidden md:flex flex-col items-center justify-center pt-5 text-text-muted">
                            <ArrowRight size={18} />
                          </div>
                          <Text
                            label="Target (Intended Condition)"
                            value={i.target}
                            onChange={target =>
                              update({
                                indicators: indicators.map(r =>
                                  r.id === i.id ? { ...r, target } : r
                                )
                              })
                            }
                            help="Value or condition to achieve by a defined point in time."
                          />
                        </div>
                        <Choice
                          label="Frequency"
                          value={i.frequency}
                          items={options(FREQUENCIES)}
                          onChange={v =>
                            update({
                              indicators: indicators.map(r =>
                                r.id === i.id
                                  ? { ...r, frequency: v as PlanningIndicator['frequency'] }
                                  : r
                              )
                            })
                          }
                        />
                      </div>

                      {/* Sub-panel 3: Verification & Responsibility */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          3. Verification &amp; Responsibility
                        </span>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Text
                            label="Means / Source of Verification"
                            value={i.verification}
                            onChange={verification =>
                              update({
                                indicators: indicators.map(r =>
                                  r.id === i.id ? { ...r, verification } : r
                                )
                              })
                            }
                            help="Planner-entered source, such as station records or observation; not a claim of verification."
                          />
                          <Choice
                            label="Responsible measurement actor"
                            value={i.responsibleActorId}
                            items={actors}
                            onChange={v =>
                              update({
                                indicators: indicators.map(r =>
                                  r.id === i.id ? { ...r, responsibleActorId: v || null } : r
                                )
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Sub-panel 4: Quality & Disaggregation */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          4. Quality &amp; Disaggregation
                        </span>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Text
                            label="Disaggregation note"
                            value={i.disaggregation}
                            onChange={disaggregation =>
                              update({
                                indicators: indicators.map(r =>
                                  r.id === i.id ? { ...r, disaggregation } : r
                                )
                              })
                            }
                          />
                          <Text
                            label="Measurement note"
                            value={i.note}
                            onChange={note =>
                              update({
                                indicators: indicators.map(r =>
                                  r.id === i.id ? { ...r, note } : r
                                )
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border-default">
                        <Button
                          size="sm"
                          variant="destructive"
                          aria-label={'Remove Indicator ' + (n + 1)}
                          onClick={() => {
                            if (confirmRemove()) {
                              update({
                                indicators: indicators.filter(r => r.id !== i.id)
                              });
                            }
                          }}
                        >
                          <Trash2 size={13} className="mr-1" />
                          Remove Indicator
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 07C — IMPLEMENTATION (Workplan Workbench) */}
      {/* ================================================== */}
      <section className="min-w-0 rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
        <button
          type="button"
          aria-expanded={openSections['7C']}
          aria-controls="results-7C"
          onClick={() => toggleSection('7C')}
          className="flex w-full items-center justify-between gap-3 p-4 sm:p-5 text-start bg-surface-raised hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-action-primary border border-blue-200 shrink-0">
              07C
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                IMPLEMENTATION
              </h3>
              <p className="text-xs text-text-muted font-normal mt-0.5">
                Delivery lead, intervention package, activities, milestones, dependencies, and resources
              </p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`text-text-muted transition-transform duration-200 shrink-0 ${
              openSections['7C'] ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          id="results-7C"
          hidden={!openSections['7C']}
          className="min-w-0 space-y-6 border-t border-border-default p-4 sm:p-6 bg-surface-base"
        >
          {/* 7A. Priority Delivery Context Strip */}
          <div className="rounded-lg border border-border-default bg-surface-subtle overflow-hidden">
            <div className="px-4 py-2 bg-surface-subtle border-b border-border-default/80 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Priority Delivery Context
              </span>
              <Badge variant="slate" className="text-[10px]">
                Shared from Stage 5
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border-default p-1 bg-surface-raised">
              <div className="p-3">
                <dt className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Accountable / Priority Lead
                </dt>
                <dd className="text-xs font-bold text-text-primary mt-1">
                  {actorName(cell.leadStakeholderId)}
                </dd>
              </div>
              <div className="p-3">
                <dt className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Priority Supporting Actors
                </dt>
                <dd className="text-xs text-text-secondary mt-1 truncate">
                  {cell.supportingStakeholderIds.map(actorName).join(', ') || 'Not recorded'}
                </dd>
              </div>
              <div className="p-3">
                <dt className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Priority Phase
                </dt>
                <dd className="text-xs font-semibold text-text-primary mt-1">
                  {cell.implementationPhase || 'Not assigned'}
                </dd>
              </div>
              <div className="p-3">
                <dt className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  Shared Milestone / Timeframe
                </dt>
                <dd className="text-xs text-text-secondary mt-1 truncate">
                  {cell.milestoneTimeframe || 'Not recorded'}
                </dd>
              </div>
            </div>
          </div>

          {/* 7B. Existing Intervention Package (Disclosure) */}
          <details className="group rounded-lg border border-border-default bg-surface-subtle/40 overflow-hidden">
            <summary className="cursor-pointer px-4 py-3 flex items-center justify-between text-xs font-bold text-text-primary uppercase tracking-wider select-none hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
              <span>Existing intervention package — activity foundation</span>
              <ChevronDown
                size={14}
                className="text-text-muted transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <dl className="p-4 sm:p-5 space-y-3.5 border-t border-border-default bg-surface-raised text-xs">
              {LEVELS.map(l => (
                <div key={l} className="space-y-1">
                  <dt className="font-bold text-text-primary capitalize">
                    {options([l])[0].label}
                  </dt>
                  <dd className="whitespace-pre-wrap text-text-secondary p-2.5 rounded bg-surface-subtle border border-border-default/60">
                    {cell[l] || 'Not recorded'}
                  </dd>
                </div>
              ))}
            </dl>
          </details>

          {/* 7C. Activities (Workplan View) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-2">
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Activities — Workplan ({p.activities.length})
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Actionable implementation steps carrying out the intervention package.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const record = {
                    id: uid(),
                    reference: nextReference('ACT', p.activities),
                    statement: '',
                    interventionLevel: null,
                    outputIds: [],
                    implementingActorId: null,
                    supportingActorIds: [],
                    timeframe: '',
                    milestone: '',
                    dependencyIds: [],
                    resourceIds: []
                  };
                  plan({ activities: [...p.activities, record] });
                  setOpenedRecord(prev => ({ ...prev, activities: record.id }));
                }}
              >
                <Plus size={14} className="mr-1" />
                Add Activity
              </Button>
            </div>

            {p.activities.length === 0 && (
              <p className="text-xs text-text-muted italic py-2">
                No activities recorded. Add only what is useful for this plan.
              </p>
            )}

            <div className="divide-y divide-border-default border border-border-default rounded-lg overflow-hidden">
              {p.activities.map(a => {
                const isOpen = openedRecord.activities === a.id;
                return (
                  <div key={a.id} className="min-w-0 bg-surface-raised">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={'record-' + a.id}
                      onClick={() => toggleRecord('activities', a.id)}
                      className="w-full text-start p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
                    >
                      <div className="flex items-start md:items-center gap-2.5 min-w-0 flex-1">
                        <span className="font-mono text-xs font-bold text-action-primary shrink-0">
                          {a.reference}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {a.statement ||
                            (a.interventionLevel
                              ? options([a.interventionLevel])[0].label + ' intervention'
                              : 'New activity')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5 shrink-0 text-xs">
                        {a.interventionLevel && (
                          <Badge variant="slate" className="text-[10px]">
                            {a.interventionLevel}
                          </Badge>
                        )}
                        <span className="text-[11px] text-text-secondary font-medium">
                          {actorName(a.implementingActorId)}
                        </span>
                        {(a.timeframe || cell.milestoneTimeframe) && (
                          <span className="hidden sm:inline font-mono text-[11px] text-text-muted">
                            {a.timeframe || cell.milestoneTimeframe}
                          </span>
                        )}
                        <ChevronDown
                          size={14}
                          className={`text-text-muted transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      id={'record-' + a.id}
                      hidden={!isOpen}
                      className="space-y-4 border-t border-border-default p-4 sm:p-5 bg-surface-subtle/30"
                    >
                      <Choice
                        label="Source intervention level"
                        value={a.interventionLevel}
                        items={[noLink, ...options(LEVELS)]}
                        onChange={v =>
                          plan({
                            activities: p.activities.map(r =>
                              r.id === a.id
                                ? { ...r, interventionLevel: (v || null) as ResultActivity['interventionLevel'] }
                                : r
                            )
                          })
                        }
                      />
                      {a.interventionLevel && (
                        <div className="p-2.5 rounded bg-surface-subtle text-xs text-text-secondary border border-border-default/60">
                          <strong className="text-text-primary">Shared intervention:</strong>{' '}
                          {cell[a.interventionLevel] || 'Not recorded in Stage 5.'}
                        </div>
                      )}
                      <Text
                        label="Activity detail"
                        value={a.statement}
                        onChange={statement =>
                          plan({
                            activities: p.activities.map(r =>
                              r.id === a.id ? { ...r, statement } : r
                            )
                          })
                        }
                        help="Add practical detail or a distinct action only where needed; the linked intervention is reused above."
                      />
                      <Multi
                        label="Contributes to outputs"
                        values={a.outputIds}
                        items={refs(p.outputs)}
                        onChange={outputIds =>
                          plan({
                            activities: p.activities.map(r =>
                              r.id === a.id ? { ...r, outputIds } : r
                            )
                          })
                        }
                      />
                      <Choice
                        label="Implementing actor"
                        value={a.implementingActorId}
                        items={actors}
                        onChange={v =>
                          plan({
                            activities: p.activities.map(r =>
                              r.id === a.id ? { ...r, implementingActorId: v || null } : r
                            )
                          })
                        }
                        help="Who carries out this activity; separate from the accountable priority lead."
                      />
                      <Multi
                        label="Activity supporting actors"
                        values={a.supportingActorIds}
                        items={actors.filter(o => o.value && o.value !== a.implementingActorId)}
                        onChange={supportingActorIds =>
                          plan({
                            activities: p.activities.map(r =>
                              r.id === a.id ? { ...r, supportingActorIds } : r
                            )
                          })
                        }
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Text
                          label="Activity timeframe (optional detail)"
                          value={a.timeframe}
                          onChange={timeframe =>
                            plan({
                              activities: p.activities.map(r =>
                                r.id === a.id ? { ...r, timeframe } : r
                              )
                            })
                          }
                          help={'Priority timing remains: ' + (cell.milestoneTimeframe || 'Not recorded')}
                        />
                        <Text
                          label="Activity milestone (optional detail)"
                          value={a.milestone}
                          onChange={milestone =>
                            plan({
                              activities: p.activities.map(r =>
                                r.id === a.id ? { ...r, milestone } : r
                              )
                            })
                          }
                        />
                      </div>
                      <Multi
                        label="Activity dependencies"
                        values={a.dependencyIds}
                        items={p.dependencies.map(d => ({
                          value: d.id,
                          label: d.statement || d.type
                        }))}
                        onChange={dependencyIds =>
                          plan({
                            activities: p.activities.map(r =>
                              r.id === a.id ? { ...r, dependencyIds } : r
                            )
                          })
                        }
                      />
                      <Multi
                        label="Activity resource requirements"
                        values={a.resourceIds}
                        items={p.resources.map(r => ({
                          value: r.id,
                          label: r.statement || r.category
                        }))}
                        onChange={resourceIds =>
                          plan({
                            activities: p.activities.map(r =>
                              r.id === a.id ? { ...r, resourceIds } : r
                            )
                          })
                        }
                      />
                      <div className="pt-2 border-t border-border-default">
                        <Button
                          size="sm"
                          variant="destructive"
                          aria-label={'Remove ' + a.reference}
                          onClick={() => {
                            if (confirmRemove()) {
                              plan({
                                activities: p.activities.filter(r => r.id !== a.id)
                              });
                            }
                          }}
                        >
                          <Trash2 size={13} className="mr-1" />
                          Remove Activity
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7D. Dependencies Registry */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-2">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Dependencies ({p.dependencies.length})
              </h4>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const record = {
                    id: uid(),
                    type: 'Other' as const,
                    statement: '',
                    linkedPriorityKey: null,
                    linkedRecordId: null,
                    status: 'Not assessed' as const
                  };
                  plan({ dependencies: [...p.dependencies, record] });
                  setOpenedRecord(prev => ({ ...prev, dependencies: record.id }));
                }}
              >
                <Plus size={14} className="mr-1" />
                Add Dependency
              </Button>
            </div>

            {p.dependencies.length === 0 && (
              <p className="text-xs text-text-muted italic py-2">
                No dependencies recorded. Add only what is useful for this plan.
              </p>
            )}

            <div className="divide-y divide-border-default border border-border-default rounded-lg overflow-hidden">
              {p.dependencies.map((d, i) => {
                const isOpen = openedRecord.dependencies === d.id;
                const statusVariant =
                  d.status === 'Met'
                    ? 'green'
                    : d.status === 'In progress'
                    ? 'blue'
                    : d.status === 'Required'
                    ? 'amber'
                    : d.status === 'Uncertain'
                    ? 'rose'
                    : 'slate';

                return (
                  <div key={d.id} className="min-w-0 bg-surface-raised">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={'record-' + d.id}
                      onClick={() => toggleRecord('dependencies', d.id)}
                      className="w-full text-start p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
                    >
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                        <span className="font-mono text-xs font-semibold text-text-secondary shrink-0">
                          Dependency {i + 1}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {d.statement || d.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="slate" className="text-[10px]">
                          {d.type}
                        </Badge>
                        <Badge variant={statusVariant} className="text-[10px]">
                          {d.status}
                        </Badge>
                        <ChevronDown
                          size={14}
                          className={`text-text-muted transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      id={'record-' + d.id}
                      hidden={!isOpen}
                      className="space-y-4 border-t border-border-default p-4 sm:p-5 bg-surface-subtle/30"
                    >
                      <Choice
                        label="Dependency type"
                        value={d.type}
                        items={options(DEPENDENCY_TYPES)}
                        onChange={v =>
                          plan({
                            dependencies: p.dependencies.map(r =>
                              r.id === d.id
                                ? {
                                    ...r,
                                    type: v as ResultDependency['type'],
                                    linkedPriorityKey: null,
                                    linkedRecordId: null
                                  }
                                : r
                            )
                          })
                        }
                      />
                      <Text
                        label="Dependency statement"
                        value={d.statement}
                        onChange={statement =>
                          plan({
                            dependencies: p.dependencies.map(r =>
                              r.id === d.id ? { ...r, statement } : r
                            )
                          })
                        }
                      />
                      {(d.type === 'Activity' || d.type === 'CBD priority') && (
                        <Choice
                          label="Linked CBD priority"
                          value={d.linkedPriorityKey}
                          items={[
                            noLink,
                            ...Object.keys(data.customCells).map(k => ({
                              value: k,
                              label: k.replace('|', ' × ')
                            }))
                          ]}
                          onChange={v =>
                            plan({
                              dependencies: p.dependencies.map(r =>
                                r.id === d.id
                                  ? { ...r, linkedPriorityKey: v || null, linkedRecordId: null }
                                  : r
                              )
                            })
                          }
                        />
                      )}
                      {d.type === 'Activity' && (
                        <Choice
                          label="Linked activity"
                          value={d.linkedRecordId}
                          items={[
                            noLink,
                            ...refs(
                              data.customCells[d.linkedPriorityKey || '']?.resultsPlan?.activities ||
                                []
                            )
                          ]}
                          onChange={v =>
                            plan({
                              dependencies: p.dependencies.map(r =>
                                r.id === d.id ? { ...r, linkedRecordId: v || null } : r
                              )
                            })
                          }
                        />
                      )}
                      {d.type === 'Stakeholder action' && (
                        <Choice
                          label="Linked stakeholder"
                          value={d.linkedRecordId}
                          items={actors}
                          onChange={v =>
                            plan({
                              dependencies: p.dependencies.map(r =>
                                r.id === d.id ? { ...r, linkedRecordId: v || null } : r
                              )
                            })
                          }
                        />
                      )}
                      <Choice
                        label="Dependency status"
                        value={d.status}
                        items={options(DEPENDENCY_STATUS)}
                        onChange={v =>
                          plan({
                            dependencies: p.dependencies.map(r =>
                              r.id === d.id
                                ? { ...r, status: v as ResultDependency['status'] }
                                : r
                            )
                          })
                        }
                        help="A planning record only; dependencies do not automatically change sequencing."
                      />
                      <div className="pt-2 border-t border-border-default">
                        <Button
                          size="sm"
                          variant="destructive"
                          aria-label={'Remove Dependency ' + (i + 1)}
                          onClick={() => {
                            if (confirmRemove()) {
                              plan({
                                dependencies: p.dependencies.filter(r => r.id !== d.id)
                              });
                            }
                          }}
                        >
                          <Trash2 size={13} className="mr-1" />
                          Remove Dependency
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7E. Resources Registry */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-2">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Resources ({p.resources.length})
              </h4>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const record = {
                    id: uid(),
                    category: 'Other' as const,
                    statement: '',
                    availability: 'Unknown' as const
                  };
                  plan({ resources: [...p.resources, record] });
                  setOpenedRecord(prev => ({ ...prev, resources: record.id }));
                }}
              >
                <Plus size={14} className="mr-1" />
                Add Resource
              </Button>
            </div>

            {p.resources.length === 0 && (
              <p className="text-xs text-text-muted italic py-2">
                No resources recorded. Add only what is useful for this plan.
              </p>
            )}

            <div className="divide-y divide-border-default border border-border-default rounded-lg overflow-hidden">
              {p.resources.map((r, i) => {
                const isOpen = openedRecord.resources === r.id;
                const availVariant =
                  r.availability === 'Available'
                    ? 'green'
                    : r.availability === 'Partially available'
                    ? 'amber'
                    : r.availability === 'Not available'
                    ? 'rose'
                    : 'slate';

                return (
                  <div key={r.id} className="min-w-0 bg-surface-raised">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={'record-' + r.id}
                      onClick={() => toggleRecord('resources', r.id)}
                      className="w-full text-start p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
                    >
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                        <span className="font-mono text-xs font-semibold text-text-secondary shrink-0">
                          Resource {i + 1}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {r.statement || r.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="slate" className="text-[10px]">
                          {r.category}
                        </Badge>
                        <Badge variant={availVariant} className="text-[10px]">
                          {r.availability}
                        </Badge>
                        <ChevronDown
                          size={14}
                          className={`text-text-muted transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      id={'record-' + r.id}
                      hidden={!isOpen}
                      className="space-y-4 border-t border-border-default p-4 sm:p-5 bg-surface-subtle/30"
                    >
                      <Choice
                        label="Resource category"
                        value={r.category}
                        items={options(RESOURCE_CATEGORIES)}
                        onChange={v =>
                          plan({
                            resources: p.resources.map(item =>
                              item.id === r.id
                                ? { ...item, category: v as ResourceRequirement['category'] }
                                : item
                            )
                          })
                        }
                      />
                      <Text
                        label="Resource / enabling requirement"
                        value={r.statement}
                        onChange={statement =>
                          plan({
                            resources: p.resources.map(item =>
                              item.id === r.id ? { ...item, statement } : item
                            )
                          })
                        }
                      />
                      <Choice
                        label="Availability"
                        value={r.availability}
                        items={options(AVAILABILITY)}
                        onChange={v =>
                          plan({
                            resources: p.resources.map(item =>
                              item.id === r.id
                                ? { ...item, availability: v as ResourceRequirement['availability'] }
                                : item
                            )
                          })
                        }
                      />
                      <div className="pt-2 border-t border-border-default">
                        <Button
                          size="sm"
                          variant="destructive"
                          aria-label={'Remove Resource ' + (i + 1)}
                          onClick={() => {
                            if (confirmRemove()) {
                              plan({
                                resources: p.resources.filter(item => item.id !== r.id)
                              });
                            }
                          }}
                        >
                          <Trash2 size={13} className="mr-1" />
                          Remove Resource
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 07D — OWNERSHIP, RISK & SUSTAINABILITY */}
      {/* ================================================== */}
      <section className="min-w-0 rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
        <button
          type="button"
          aria-expanded={openSections['7D']}
          aria-controls="results-7D"
          onClick={() => toggleSection('7D')}
          className="flex w-full items-center justify-between gap-3 p-4 sm:p-5 text-start bg-surface-raised hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-action-primary border border-blue-200 shrink-0">
              07D
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                OWNERSHIP, RISK &amp; SUSTAINABILITY
              </h3>
              <p className="text-xs text-text-muted font-normal mt-0.5">
                National counterpart ownership, priority risk management, and post-intervention sustainability requirements
              </p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`text-text-muted transition-transform duration-200 shrink-0 ${
              openSections['7D'] ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          id="results-7D"
          hidden={!openSections['7D']}
          className="min-w-0 space-y-8 border-t border-border-default p-4 sm:p-6 bg-surface-base"
        >
          {/* Zone 1: Counterpart Ownership */}
          <div className="space-y-4">
            <div className="border-b border-border-default pb-2 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Zone 1 · Counterpart Ownership &amp; National Leadership
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Assessment of national counterpart consultation, formal support, and readiness to sustain reform.
                </p>
              </div>
              <Badge variant="blue" className="text-[10px]">
                Ownership
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Choice
                label="Counterpart owner"
                value={p.ownership.counterpartActorId}
                items={actors}
                onChange={v =>
                  plan({
                    ownership: {
                      ...p.ownership,
                      counterpartActorId: v || null,
                      status: 'Not yet assessed'
                    }
                  })
                }
                help="Select the relevant national counterpart from existing stakeholders. Selection alone does not establish ownership."
              />
              <Choice
                label="Consultation / Ownership Status"
                value={p.ownership.status}
                items={options(OWNERSHIP_STATUS)}
                onChange={v =>
                  plan({
                    ownership: {
                      ...p.ownership,
                      status: v as ResultsPlan['ownership']['status']
                    }
                  })
                }
                help="Consulted does not mean approved; this records the planner’s assessment, not formal endorsement."
              />
            </div>

            <Text
              label="Ownership note"
              value={p.ownership.note}
              onChange={note => plan({ ownership: { ...p.ownership, note } })}
              help="What demonstrates that the relevant national counterpart owns, supports or is prepared to sustain this change?"
            />
          </div>

          {/* Zone 2: Risk Management (Editable Priority Risk + Mitigations) */}
          <div className="space-y-4 pt-4 border-t border-border-default">
            <div className="border-b border-border-default pb-2 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Zone 2 · Priority Risk Management
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Operational risks, mitigations, accountable actors, and regular review notes.
                </p>
              </div>
              <Badge variant="amber" className="text-[10px]">
                Risk
              </Badge>
            </div>

            {/* Editable Priority Risk shared with Stage 5 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="priority-risks" className="text-xs font-semibold text-text-secondary">
                  Priority risk / implementation conditions
                </label>
                <Badge variant="blue" className="text-[10px]">
                  Shared with Stage 5
                </Badge>
              </div>
              <TextArea
                id="priority-risks"
                rows={2}
                value={cell.risks}
                onChange={e => update({ risks: e.target.value })}
                helperText="The same priority-level risk text used in Stage 5 and the brief. Edits update across both views."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Text
                label="Mitigation / Management Measure"
                value={p.riskManagement.mitigation}
                onChange={mitigation =>
                  plan({ riskManagement: { ...p.riskManagement, mitigation } })
                }
              />
              <Choice
                label="Risk management responsible actor"
                value={p.riskManagement.responsibleActorId}
                items={actors}
                onChange={v =>
                  plan({
                    riskManagement: { ...p.riskManagement, responsibleActorId: v || null }
                  })
                }
              />
            </div>

            <Text
              label="Risk review note"
              value={p.riskManagement.reviewNote}
              onChange={reviewNote =>
                plan({ riskManagement: { ...p.riskManagement, reviewNote } })
              }
            />
          </div>

          {/* Zone 3: Sustainability Requirements */}
          <div className="space-y-4 pt-4 border-t border-border-default">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-2">
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Zone 3 · Post-Intervention Sustainability Requirements ({p.sustainability.length})
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  What must remain in place for this capacity to continue after external support reduces?
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const record = {
                    id: uid(),
                    dimension: 'Institutional responsibility',
                    requirement: ''
                  };
                  plan({ sustainability: [...p.sustainability, record] });
                  setOpenedRecord(prev => ({ ...prev, sustainability: record.id }));
                }}
              >
                <Plus size={14} className="mr-1" />
                Add Sustainability Requirement
              </Button>
            </div>

            {p.sustainability.length === 0 && (
              <p className="text-xs text-text-muted italic py-2">
                No sustainability requirements recorded. Add only what is useful for this plan.
              </p>
            )}

            <div className="divide-y divide-border-default border border-border-default rounded-lg overflow-hidden">
              {p.sustainability.map(s => {
                const isOpen = openedRecord.sustainability === s.id;
                return (
                  <div key={s.id} className="min-w-0 bg-surface-raised">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={'record-' + s.id}
                      onClick={() => toggleRecord('sustainability', s.id)}
                      className="w-full text-start p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring"
                    >
                      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                        <span className="font-mono text-xs font-semibold text-text-secondary shrink-0">
                          {s.dimension}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {s.requirement || 'Requirement not recorded'}
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-text-muted transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div
                      id={'record-' + s.id}
                      hidden={!isOpen}
                      className="space-y-4 border-t border-border-default p-4 sm:p-5 bg-surface-subtle/30"
                    >
                      <Choice
                        label="Sustainability dimension"
                        value={s.dimension}
                        items={options(SUSTAINABILITY_DIMENSIONS)}
                        onChange={dimension =>
                          plan({
                            sustainability: p.sustainability.map(item =>
                              item.id === s.id ? { ...item, dimension } : item
                            )
                          })
                        }
                      />
                      <Text
                        label="Sustainability requirement / note"
                        value={s.requirement}
                        onChange={requirement =>
                          plan({
                            sustainability: p.sustainability.map(item =>
                              item.id === s.id ? { ...item, requirement } : item
                            )
                          })
                        }
                      />
                      <div className="pt-2 border-t border-border-default">
                        <Button
                          size="sm"
                          variant="destructive"
                          aria-label={'Remove Sustainability Requirement'}
                          onClick={() => {
                            if (confirmRemove()) {
                              plan({
                                sustainability: p.sustainability.filter(item => item.id !== s.id)
                              });
                            }
                          }}
                        >
                          <Trash2 size={13} className="mr-1" />
                          Remove Requirement
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
