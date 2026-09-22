import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Link2, Plus, Trash2 } from 'lucide-react';
import type { AnalysisSynthesis as AnalysisSynthesisData, StrategicOptionType, SwotCategory, UnpolProjectData } from '../types';
import { Button } from '../ui/Button';
import { NextStepCue } from './Guidance';
import { StageLead } from './StageLead';
import { NEXT_STEP_CUES } from '../lib/guidance';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import {
  getAnalysisSourceCandidates,
  isValidStrategicOptionCombination,
  nextReference,
  OPTION_COMBINATIONS,
  SWOT_CATEGORY_PREFIX,
  SWOT_CATEGORIES
} from '../lib/analysisSynthesis';

interface AnalysisSynthesisProps {
  data: UnpolProjectData;
  onChange: (synthesis: AnalysisSynthesisData) => void;
  onDeleteFinding: (id: string) => void;
  onDeleteOption: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const CATEGORY_CONTENT: Record<SwotCategory, { prompt: string; scope: string; tone: string }> = {
  Strength: { prompt: 'What existing internal capability, asset or positive institutional condition can CBD build on?', scope: 'Internal · enabling', tone: 'border-emerald-200 bg-emerald-50/40' },
  Weakness: { prompt: 'What internal capacity, performance, system or institutional gap needs to be addressed?', scope: 'Internal · constraining', tone: 'border-amber-200 bg-amber-50/40' },
  Opportunity: { prompt: 'What external condition could enable or accelerate progress?', scope: 'External · enabling', tone: 'border-blue-200 bg-blue-50/40' },
  Threat: { prompt: 'What external condition could obstruct, delay or reverse progress?', scope: 'External · constraining', tone: 'border-rose-200 bg-rose-50/40' }
};

const OPTION_CONTENT: Record<StrategicOptionType, { title: string; prompt: string }> = {
  SO: { title: 'Strength × Opportunity', prompt: 'How can existing capacities be used to capitalize on favorable external conditions?' },
  ST: { title: 'Strength × Threat', prompt: 'How can existing capacities help reduce exposure to external threats?' },
  WO: { title: 'Weakness × Opportunity', prompt: 'How can favorable external conditions help overcome internal capacity gaps?' },
  WT: { title: 'Weakness × Threat', prompt: 'What defensive, protective or risk-reduction response is needed where internal weakness meets external threat?' }
};

export const AnalysisSynthesis: React.FC<AnalysisSynthesisProps> = ({ data, onChange, onDeleteFinding, onDeleteOption, onBack, onContinue }) => {
  const synthesis = data.analysisSynthesis;
  const [sourcePanelOpen, setSourcePanelOpen] = useState(false);
  const [selectedSourceKey, setSelectedSourceKey] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SwotCategory>('Strength');
  const [optionsOpen, setOptionsOpen] = useState(synthesis.strategicOptions.length > 0);
  const [optionSelections, setOptionSelections] = useState<Record<StrategicOptionType, [string, string]>>({ SO: ['', ''], ST: ['', ''], WO: ['', ''], WT: ['', ''] });
  const candidates = useMemo(() => getAnalysisSourceCandidates(data), [data]);

  const updateFinding = (id: string, field: 'finding' | 'cbdImplication' | 'verificationNote' | 'confidence', value: string | number | null) => {
    onChange({ ...synthesis, swotFindings: synthesis.swotFindings.map(item => item.id === id ? { ...item, [field]: value } : item) });
  };

  const addFinding = (category: SwotCategory, sourceKey?: string) => {
    const source = candidates.find(item => `${item.reference.type}:${item.reference.id}` === sourceKey);
    const reference = nextReference(SWOT_CATEGORY_PREFIX[category], synthesis.swotFindings.map(item => item.reference));
    const id = `swot-${reference.toLowerCase()}`;
    onChange({
      ...synthesis,
      swotFindings: [
        ...synthesis.swotFindings,
        {
          id,
          reference,
          category,
          finding: source ? source.text : '',
          cbdImplication: '',
          sourceReferences: source ? [source.reference] : [],
          confidence: null,
          verificationNote: ''
        }
      ]
    });
    setSelectedSourceKey('');
    setSourcePanelOpen(false);
  };

  const updateOption = (id: string, field: 'option' | 'planningNote', value: string) => {
    onChange({ ...synthesis, strategicOptions: synthesis.strategicOptions.map(item => item.id === id ? { ...item, [field]: value } : item) });
  };

  const addOption = (type: StrategicOptionType) => {
    const [firstId, secondId] = optionSelections[type];
    if (!firstId || !secondId) return;
    const reference = nextReference(type, synthesis.strategicOptions.map(item => item.reference));
    const candidate = {
      id: `option-${reference.toLowerCase()}`,
      reference,
      type,
      swotFindingIds: [firstId, secondId],
      option: '',
      planningNote: ''
    };
    if (!isValidStrategicOptionCombination(candidate, synthesis.swotFindings)) return;
    onChange({ ...synthesis, strategicOptions: [...synthesis.strategicOptions, candidate] });
    setOptionSelections(current => ({ ...current, [type]: ['', ''] }));
  };

  return (
    <div className="flex flex-col gap-6">
      <StageLead stage={4} />

      <div className="rounded-lg border border-institutional/20 bg-institutional-subtle px-4 py-3 text-xs leading-relaxed text-text-default">
        <strong className="font-semibold text-institutional">Professional judgement remains primary.</strong> SWOT classification is analyst-written synthesis. It supports planning judgement; it does not determine the CBD response.
      </div>

      <section aria-labelledby="swot-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 id="swot-heading" className="text-sm font-semibold uppercase tracking-wider text-text-muted">SWOT Synthesis</h3>
            <p className="mt-0.5 text-xs text-text-muted">Internal conditions sit above external conditions. Empty categories are valid.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setSourcePanelOpen(open => !open)} aria-expanded={sourcePanelOpen} aria-controls="existing-analysis-picker">
            <Link2 size={14} className="mr-1.5" />
            Add from Existing Analysis
          </Button>
        </div>

        {sourcePanelOpen && (
          <div id="existing-analysis-picker" className="rounded-lg border border-border-default bg-surface-subtle p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
              <Select label="Existing analytical source" value={selectedSourceKey} onChange={event => setSelectedSourceKey(event.target.value)} options={[{ value: '', label: 'Choose a source…' }, ...candidates.map(item => ({ value: `${item.reference.type}:${item.reference.id}`, label: `${item.group} — ${item.label}` }))]} />
              <Select label="Planner classification" value={selectedCategory} onChange={event => setSelectedCategory(event.target.value as SwotCategory)} options={SWOT_CATEGORIES.map(category => ({ value: category, label: category }))} />
              <Button size="sm" onClick={() => addFinding(selectedCategory, selectedSourceKey)} disabled={!selectedSourceKey}><Plus size={14} className="mr-1.5" />Add source</Button>
            </div>
            {candidates.find(item => `${item.reference.type}:${item.reference.id}` === selectedSourceKey)?.reference.type === 'interdependency' && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-text-default">{candidates.find(item => `${item.reference.type}:${item.reference.id}` === selectedSourceKey)?.text}</p>}
            <p className="mt-2 text-xs text-text-muted">The source remains linked. You may edit the SWOT wording without changing the original analysis.</p>
          </div>
        )}

        {/* 1. Four Clean Separate S / W / O / T Summary & Orientation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {SWOT_CATEGORIES.map(category => {
            const items = data.analysisSynthesis.swotFindings.filter(item => item.category === category);
            const content = CATEGORY_CONTENT[category];
            const letter = category[0];
            const styles: Record<SwotCategory, { border: string; bg: string; badge: string; text: string }> = {
              Strength: {
                border: 'border-emerald-200/80',
                bg: 'bg-emerald-50/40',
                badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                text: 'text-emerald-950'
              },
              Weakness: {
                border: 'border-amber-200/80',
                bg: 'bg-amber-50/40',
                badge: 'bg-amber-100 text-amber-800 border-amber-300',
                text: 'text-amber-950'
              },
              Opportunity: {
                border: 'border-blue-200/80',
                bg: 'bg-blue-50/40',
                badge: 'bg-blue-100 text-blue-800 border-blue-300',
                text: 'text-blue-950'
              },
              Threat: {
                border: 'border-rose-200/80',
                bg: 'bg-rose-50/40',
                badge: 'bg-rose-100 text-rose-800 border-rose-300',
                text: 'text-rose-950'
              }
            };
            const s = styles[category];

            return (
              <div
                key={category}
                className={`rounded-lg border ${s.border} ${s.bg} p-3.5 flex flex-col justify-between shadow-subtle transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold border ${s.badge}`}>
                        {letter}
                      </span>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${s.text}`}>
                        {category}
                      </h4>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-text-muted px-2 py-0.5 rounded bg-surface-card border border-border-default">
                      {items.length} {items.length === 1 ? 'finding' : 'findings'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-1">
                    {content.scope}
                  </span>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    {content.prompt}
                  </p>
                </div>

                {/* Orientation summary / preview */}
                <div className="mt-3 pt-2.5 border-t border-border-default/60 flex items-center justify-between text-[11px]">
                  {items.length > 0 ? (
                    <div className="flex flex-wrap gap-1 items-center overflow-hidden max-h-6">
                      {items.slice(0, 3).map(item => (
                        <span
                          key={item.id}
                          className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-card border border-border-default text-text-default"
                        >
                          {item.reference}
                        </span>
                      ))}
                      {items.length > 3 && (
                        <span className="text-[10px] text-text-muted">
                          +{items.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-text-muted italic text-[11px]">
                      No findings recorded yet
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Professional Unified 2x2 SWOT Analytical Matrix for Detailed Findings */}
        <div className="rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
          {/* Row 1 Header: Internal Conditions */}
          <div className="border-b border-border-default bg-surface-subtle px-4 py-2 flex items-center justify-between text-xs font-semibold text-text-default">
            <span className="uppercase tracking-wider">Internal Institutional Conditions</span>
            <span className="text-[11px] font-normal text-text-muted">Strength &amp; Weakness</span>
          </div>
          {/* Row 1 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-default">
            <SwotZone category="Strength" data={data} onAdd={() => addFinding('Strength')} onUpdate={updateFinding} onDelete={onDeleteFinding} />
            <SwotZone category="Weakness" data={data} onAdd={() => addFinding('Weakness')} onUpdate={updateFinding} onDelete={onDeleteFinding} />
          </div>

          {/* Row 2 Header: External Conditions */}
          <div className="border-t border-b border-border-default bg-surface-subtle px-4 py-2 flex items-center justify-between text-xs font-semibold text-text-default">
            <span className="uppercase tracking-wider">External Operating Conditions</span>
            <span className="text-[11px] font-normal text-text-muted">Opportunity &amp; Threat</span>
          </div>
          {/* Row 2 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-default">
            <SwotZone category="Opportunity" data={data} onAdd={() => addFinding('Opportunity')} onUpdate={updateFinding} onDelete={onDeleteFinding} />
            <SwotZone category="Threat" data={data} onAdd={() => addFinding('Threat')} onUpdate={updateFinding} onDelete={onDeleteFinding} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
        <button
          type="button"
          onClick={() => setOptionsOpen(open => !open)}
          aria-expanded={optionsOpen}
          aria-controls="strategic-options"
          className="flex w-full items-center justify-between gap-4 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring hover:bg-surface-hover transition-colors"
        >
          <div>
            <strong className="block text-sm font-semibold text-text-default">Develop Strategic Options (TOWS Matrix)</strong>
            <span className="mt-0.5 block text-xs text-text-muted">
              Combine selected SWOT findings through SO, ST, WO or WT. No option is generated or ranked automatically.
            </span>
          </div>
          <span className="text-xs font-semibold text-institutional">{optionsOpen ? 'Hide Matrix' : 'Open Matrix'}</span>
        </button>
        {optionsOpen && (
          <div id="strategic-options" className="border-t border-border-default">
            {/* TOWS 2x2 Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-default">
              <OptionZone type="SO" data={data} selections={optionSelections.SO} onSelections={value => setOptionSelections(current => ({ ...current, SO: value }))} onAdd={() => addOption('SO')} onUpdate={updateOption} onDelete={onDeleteOption} />
              <OptionZone type="ST" data={data} selections={optionSelections.ST} onSelections={value => setOptionSelections(current => ({ ...current, ST: value }))} onAdd={() => addOption('ST')} onUpdate={updateOption} onDelete={onDeleteOption} />
            </div>
            <div className="border-t border-border-default" />
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-default">
              <OptionZone type="WO" data={data} selections={optionSelections.WO} onSelections={value => setOptionSelections(current => ({ ...current, WO: value }))} onAdd={() => addOption('WO')} onUpdate={updateOption} onDelete={onDeleteOption} />
              <OptionZone type="WT" data={data} selections={optionSelections.WT} onSelections={value => setOptionSelections(current => ({ ...current, WT: value }))} onAdd={() => addOption('WT')} onUpdate={updateOption} onDelete={onDeleteOption} />
            </div>
          </div>
        )}
      </section>

      <NextStepCue {...NEXT_STEP_CUES[4]} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={onBack}><ArrowLeft size={15} className="mr-2" />Back: Stakeholders &amp; Ownership</Button>
        <div className="flex flex-col gap-2 sm:flex-row"><Button variant="tertiary" onClick={onContinue}>Continue without synthesis</Button><Button onClick={onContinue}>Continue to CBD Priorities<ArrowRight size={15} className="ml-2" /></Button></div>
      </div>
    </div>
  );
};

const SWOT_ACCENTS: Record<SwotCategory, { dot: string; border: string; badge: string }> = {
  Strength: { dot: 'bg-emerald-600', border: 'border-l-2 border-l-emerald-600', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  Weakness: { dot: 'bg-amber-600', border: 'border-l-2 border-l-amber-600', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
  Opportunity: { dot: 'bg-institutional', border: 'border-l-2 border-l-institutional', badge: 'bg-blue-50 text-blue-800 border-blue-200' },
  Threat: { dot: 'bg-rose-600', border: 'border-l-2 border-l-rose-600', badge: 'bg-rose-50 text-rose-800 border-rose-200' }
};

function SwotZone({ category, data, onAdd, onUpdate, onDelete }: { category: SwotCategory; data: UnpolProjectData; onAdd: () => void; onUpdate: (id: string, field: 'finding' | 'cbdImplication' | 'verificationNote' | 'confidence', value: string | number | null) => void; onDelete: (id: string) => void }) {
  const content = CATEGORY_CONTENT[category];
  const items = data.analysisSynthesis.swotFindings.filter(item => item.category === category);
  const candidates = getAnalysisSourceCandidates(data);
  const accent = SWOT_ACCENTS[category];

  return (
    <section aria-labelledby={`swot-${category}`} className="flex flex-col">
      <header className={`border-b border-border-default bg-surface-subtle/50 px-4 py-3 flex items-start justify-between gap-3 ${accent.border}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${accent.dot} shrink-0`} />
            <h4 id={`swot-${category}`} className="text-xs font-bold uppercase tracking-wider text-text-default">
              {category}
            </h4>
            <span className="font-mono text-xs font-semibold text-text-muted">
              ({items.length})
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">{content.prompt}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onAdd} className="shrink-0">
          <Plus size={14} className="mr-1" />
          Add Finding
        </Button>
      </header>

      <div className="divide-y divide-border-default flex-1">
        {items.length === 0 ? (
          <div className="p-6 text-center text-xs italic text-text-muted">
            No {category.toLowerCase()} findings recorded.
          </div>
        ) : (
          items.map(item => {
            const linkedOptions = data.analysisSynthesis.strategicOptions.filter(option => option.swotFindingIds.includes(item.id));
            return (
              <article key={item.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${accent.badge}`}>
                    {item.reference}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!linkedOptions.length || confirm(`${item.reference} supports ${linkedOptions.map(option => option.reference).join(', ')}. Delete it and flag those options for review?`)) {
                        onDelete(item.id);
                      }
                    }}
                    aria-label={`Delete ${item.reference}`}
                    className="rounded p-1 text-text-muted hover:text-action-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <TextArea
                  label="Finding"
                  value={item.finding}
                  onChange={event => onUpdate(item.id, 'finding', event.target.value)}
                  rows={2}
                />
                <TextArea
                  label="Why this matters for CBD"
                  value={item.cbdImplication}
                  onChange={event => onUpdate(item.id, 'cbdImplication', event.target.value)}
                  rows={2}
                />
                <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
                  <Select
                    label="Confidence"
                    value={item.confidence?.toString() ?? ''}
                    onChange={event => onUpdate(item.id, 'confidence', event.target.value ? Number(event.target.value) : null)}
                    options={[{ value: '', label: 'Not set' }, ...[1, 2, 3, 4, 5].map(value => ({ value: String(value), label: `${value}/5` }))]}
                  />
                  <TextArea
                    label="Verification note (optional)"
                    value={item.verificationNote}
                    onChange={event => onUpdate(item.id, 'verificationNote', event.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block mb-1">
                    Structural sources
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.sourceReferences.length ? (
                      item.sourceReferences.map(reference => {
                        const source = candidates.find(candidate => candidate.reference.type === reference.type && candidate.reference.id === reference.id);
                        return (
                          <span key={`${reference.type}:${reference.id}`} className="rounded-md border border-blue-200 bg-blue-50/70 px-2 py-0.5 text-[11px] font-medium text-blue-800">
                            {source?.label ?? `Missing source · ${reference.id}`}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Manual synthesis · no supporting source linked
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function OptionZone({ type, data, selections, onSelections, onAdd, onUpdate, onDelete }: { type: StrategicOptionType; data: UnpolProjectData; selections: [string, string]; onSelections: (value: [string, string]) => void; onAdd: () => void; onUpdate: (id: string, field: 'option' | 'planningNote', value: string) => void; onDelete: (id: string) => void }) {
  const required = OPTION_COMBINATIONS[type];
  const options = data.analysisSynthesis.strategicOptions.filter(item => item.type === type);
  const choices = required.map(category => data.analysisSynthesis.swotFindings.filter(item => item.category === category));

  const optionBadges: Record<StrategicOptionType, string> = {
    SO: 'bg-blue-50 text-blue-800 border-blue-200',
    ST: 'bg-amber-50 text-amber-800 border-amber-200',
    WO: 'bg-teal-50 text-teal-800 border-teal-200',
    WT: 'bg-rose-50 text-rose-800 border-rose-200'
  };

  return (
    <section className="flex flex-col">
      <header className="border-b border-border-default bg-surface-subtle/50 px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${optionBadges[type]}`}>
              {type}
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-default">
              {OPTION_CONTENT[type].title}
            </h4>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">{OPTION_CONTENT[type].prompt}</p>
        </div>
      </header>

      <div className="p-4 border-b border-border-default bg-surface-subtle/20">
        <div className="grid gap-2 sm:grid-cols-2">
          {required.map((category, index) => (
            <Select
              key={category}
              label={category}
              value={selections[index]}
              onChange={event => {
                const next: [string, string] = [...selections] as [string, string];
                next[index] = event.target.value;
                onSelections(next);
              }}
              options={[{ value: '', label: `Choose ${category.toLowerCase()}…` }, ...choices[index].map(item => ({ value: item.id, label: `${item.reference} — ${item.finding || 'Untitled finding'}` }))]}
            />
          ))}
        </div>
        <Button
          size="sm"
          className="mt-3"
          onClick={onAdd}
          disabled={!selections[0] || !selections[1]}
        >
          <Plus size={14} className="mr-1" />
          Add {type} Option
        </Button>
      </div>

      <div className="divide-y divide-border-default flex-1">
        {options.length === 0 ? (
          <div className="p-6 text-center text-xs italic text-text-muted">
            No {type} options formulated yet.
          </div>
        ) : (
          options.map(option => (
            <article key={option.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <strong className={`text-xs font-semibold px-2 py-0.5 rounded border font-mono ${optionBadges[type]}`}>
                  {option.reference} · {option.swotFindingIds.map(id => data.analysisSynthesis.swotFindings.find(item => item.id === id)?.reference).filter(Boolean).join(' + ')}
                </strong>
                <button
                  type="button"
                  onClick={() => onDelete(option.id)}
                  aria-label={`Delete ${option.reference}`}
                  className="rounded p-1 text-text-muted hover:text-action-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <TextArea
                label="Strategic Option"
                value={option.option}
                onChange={event => onUpdate(option.id, 'option', event.target.value)}
                rows={2}
              />
              <TextArea
                label="Planning note (optional)"
                value={option.planningNote}
                onChange={event => onUpdate(option.id, 'planningNote', event.target.value)}
                rows={2}
              />
              {!isValidStrategicOptionCombination(option, data.analysisSynthesis.swotFindings) && (
                <div className="rounded-md border border-amber-300 bg-amber-50/70 p-2 text-xs font-medium text-amber-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-600 shrink-0" />
                  <span>Review required: this option no longer has a complete {type} SWOT basis.</span>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
