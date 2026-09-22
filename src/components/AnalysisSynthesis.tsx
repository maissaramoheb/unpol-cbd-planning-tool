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
      swotFindings: [...synthesis.swotFindings, {
        id,
        reference,
        category,
        finding: source?.text ?? '',
        cbdImplication: '',
        sourceReferences: source ? [source.reference] : [],
        confidence: null,
        verificationNote: ''
      }]
    });
    setSourcePanelOpen(false);
    setSelectedSourceKey('');
  };

  const updateOption = (id: string, field: 'option' | 'planningNote', value: string) => {
    onChange({ ...synthesis, strategicOptions: synthesis.strategicOptions.map(item => item.id === id ? { ...item, [field]: value } : item) });
  };

  const addOption = (type: StrategicOptionType) => {
    const selected = optionSelections[type].filter(Boolean);
    const reference = nextReference(`${type}-`, synthesis.strategicOptions.map(item => item.reference));
    const candidate = {
      id: `option-${reference.toLowerCase()}`,
      reference,
      type,
      swotFindingIds: selected,
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

        {/* 2x2 SWOT Matrix with Shared Boundary */}
        <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden shadow-subtle">
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

      <section className="rounded-lg border border-border-default bg-surface-card overflow-hidden shadow-subtle">
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

const SWOT_ACCENTS: Record<SwotCategory, { dot: string; border: string }> = {
  Strength: { dot: 'bg-emerald-600', border: 'border-l-2 border-l-emerald-600' },
  Weakness: { dot: 'bg-amber-600', border: 'border-l-2 border-l-amber-600' },
  Opportunity: { dot: 'bg-institutional', border: 'border-l-2 border-l-institutional' },
  Threat: { dot: 'bg-rose-600', border: 'border-l-2 border-l-rose-600' }
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
                  <span className="font-mono text-xs font-bold text-text-default bg-surface-subtle border border-border-default px-2 py-0.5 rounded">
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
                          <span key={`${reference.type}:${reference.id}`} className="rounded-md border border-border-default bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                            {source?.label ?? `Missing source · ${reference.id}`}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[11px] text-text-muted italic">
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

  return (
    <section className="flex flex-col">
      <header className="border-b border-border-default bg-surface-subtle/50 px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-institutional">{type}</span>
            <h5 className="text-xs font-bold text-text-default">{OPTION_CONTENT[type].title}</h5>
            <span className="font-mono text-xs font-semibold text-text-muted">({options.length})</span>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">{OPTION_CONTENT[type].prompt}</p>
        </div>
      </header>

      {/* Creator Controls */}
      <div className="p-3.5 bg-surface-subtle/25 border-b border-border-default flex flex-col gap-2.5">
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
              options={[
                { value: '', label: `Choose ${category.toLowerCase()}…` },
                ...choices[index].map(item => ({
                  value: item.id,
                  label: `${item.reference} — ${item.finding || 'Untitled finding'}`
                }))
              ]}
            />
          ))}
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="self-start"
          onClick={onAdd}
          disabled={!selections[0] || !selections[1]}
        >
          <Plus size={14} className="mr-1" />
          Add {type} Option
        </Button>
      </div>

      {/* Structured Option Records */}
      <div className="divide-y divide-border-default flex-1">
        {options.length === 0 ? (
          <div className="p-4 text-center text-xs italic text-text-muted">
            No {type} options formulated.
          </div>
        ) : (
          options.map(option => (
            <article key={option.id} className="p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-institutional bg-institutional-subtle border border-institutional/20 px-2 py-0.5 rounded">
                  {option.reference} · {option.swotFindingIds.map(id => data.analysisSynthesis.swotFindings.find(item => item.id === id)?.reference).filter(Boolean).join(' + ')}
                </span>
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
                <p className="text-xs font-semibold text-amber-700">
                  Review required: this option no longer has a complete {type} SWOT basis.
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
