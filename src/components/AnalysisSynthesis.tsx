'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Link2, Plus, Trash2 } from 'lucide-react';
import type { AnalysisSynthesis as AnalysisSynthesisData, StrategicOptionType, SwotCategory, UnpolProjectData } from '../types';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import {
  getAnalysisSourceCandidates,
  isValidStrategicOptionCombination,
  nextReference,
  OPTION_COMBINATIONS,
  STRATEGIC_OPTION_TYPES,
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
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">Analysis Synthesis · Stage 4 bridge</span>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">SWOT Analysis &amp; Strategic Options</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Bring together evidence, operating-environment findings and stakeholder analysis before defining CBD priorities.</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-950 lg:max-w-sm">
            <strong>Professional judgement remains primary.</strong> SWOT classification is analyst-written synthesis. It supports planning judgement; it does not determine the CBD response.
          </div>
        </div>
      </header>

      <section aria-labelledby="swot-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h3 id="swot-heading" className="text-lg font-black text-slate-950">SWOT synthesis</h3><p className="mt-1 text-xs text-slate-500">Internal conditions sit above external conditions. Empty categories are valid.</p></div>
          <Button variant="outline" onClick={() => setSourcePanelOpen(open => !open)} aria-expanded={sourcePanelOpen} aria-controls="existing-analysis-picker"><Link2 size={15} className="mr-2" />Add from Existing Analysis</Button>
        </div>

        {sourcePanelOpen && <div id="existing-analysis-picker" className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
            <Select label="Existing analytical source" value={selectedSourceKey} onChange={event => setSelectedSourceKey(event.target.value)} options={[{ value: '', label: 'Choose a source…' }, ...candidates.map(item => ({ value: `${item.reference.type}:${item.reference.id}`, label: `${item.group} — ${item.label}` }))]} />
            <Select label="Planner classification" value={selectedCategory} onChange={event => setSelectedCategory(event.target.value as SwotCategory)} options={SWOT_CATEGORIES.map(category => ({ value: category, label: category }))} />
            <Button onClick={() => addFinding(selectedCategory, selectedSourceKey)} disabled={!selectedSourceKey}><Plus size={15} className="mr-2" />Add source</Button>
          </div>
          <p className="mt-3 text-xs text-blue-900">The source remains linked. You may edit the SWOT wording without changing the original analysis.</p>
        </div>}

        <div className="rounded-xl border border-slate-300 bg-slate-900 px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-200">Internal institutional conditions</div>
        <div className="grid gap-4 lg:grid-cols-2">{(['Strength', 'Weakness'] as SwotCategory[]).map(category => <SwotZone key={category} category={category} data={data} onAdd={() => addFinding(category)} onUpdate={updateFinding} onDelete={onDeleteFinding} />)}</div>
        <div className="rounded-xl border border-blue-200 bg-blue-100/70 px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-blue-900">External operating conditions</div>
        <div className="grid gap-4 lg:grid-cols-2">{(['Opportunity', 'Threat'] as SwotCategory[]).map(category => <SwotZone key={category} category={category} data={data} onAdd={() => addFinding(category)} onUpdate={updateFinding} onDelete={onDeleteFinding} />)}</div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button type="button" onClick={() => setOptionsOpen(open => !open)} aria-expanded={optionsOpen} aria-controls="strategic-options" className="flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          <span><strong className="block text-lg text-slate-950">Develop Strategic Options</strong><span className="mt-1 block text-xs text-slate-500">Combine selected SWOT findings through SO, ST, WO or WT. No option is generated or ranked automatically.</span></span>
          <span className="text-sm font-black text-blue-700">{optionsOpen ? 'Hide' : 'Open'}</span>
        </button>
        {optionsOpen && <div id="strategic-options" className="border-t border-slate-200 p-5">
          <div className="grid gap-4 lg:grid-cols-2">{STRATEGIC_OPTION_TYPES.map(type => <OptionZone key={type} type={type} data={data} selections={optionSelections[type]} onSelections={value => setOptionSelections(current => ({ ...current, [type]: value }))} onAdd={() => addOption(type)} onUpdate={updateOption} onDelete={onDeleteOption} />)}</div>
        </div>}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft size={15} className="mr-2" />Back to Actors</Button>
        <div className="flex flex-col gap-2 sm:flex-row"><Button variant="ghost" onClick={onContinue}>Skip synthesis</Button><Button onClick={onContinue}>Continue to CBD Matrix<ArrowRight size={15} className="ml-2" /></Button></div>
      </div>
    </div>
  );
};

function SwotZone({ category, data, onAdd, onUpdate, onDelete }: { category: SwotCategory; data: UnpolProjectData; onAdd: () => void; onUpdate: (id: string, field: 'finding' | 'cbdImplication' | 'verificationNote' | 'confidence', value: string | number | null) => void; onDelete: (id: string) => void }) {
  const content = CATEGORY_CONTENT[category];
  const items = data.analysisSynthesis.swotFindings.filter(item => item.category === category);
  const candidates = getAnalysisSourceCandidates(data);
  return <section aria-labelledby={`swot-${category}`} className={`rounded-2xl border p-4 ${content.tone}`}>
    <header className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{content.scope}</span><h4 id={`swot-${category}`} className="mt-1 text-base font-black text-slate-950">{category}</h4><p className="mt-1 text-xs leading-relaxed text-slate-600">{content.prompt}</p></div><Button variant="outline" size="sm" onClick={onAdd}><Plus size={14} className="mr-1" />Add Finding</Button></header>
    <div className="mt-4 flex flex-col gap-3">{items.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-center text-xs text-slate-500">No {category.toLowerCase()} findings recorded.</div>}{items.map(item => {
      const linkedOptions = data.analysisSynthesis.strategicOptions.filter(option => option.swotFindingIds.includes(item.id));
      return <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2"><strong className="rounded-md bg-slate-900 px-2 py-1 text-[10px] tracking-wider text-white">{item.reference}</strong><button type="button" onClick={() => { if (!linkedOptions.length || confirm(`${item.reference} supports ${linkedOptions.map(option => option.reference).join(', ')}. Delete it and flag those options for review?`)) onDelete(item.id); }} aria-label={`Delete ${item.reference}`} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"><Trash2 size={14} /></button></div>
        <TextArea label="Finding" value={item.finding} onChange={event => onUpdate(item.id, 'finding', event.target.value)} rows={3} />
        <div className="mt-3"><TextArea label="Why this matters for CBD" value={item.cbdImplication} onChange={event => onUpdate(item.id, 'cbdImplication', event.target.value)} rows={2} /></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]"><Select label="Confidence" value={item.confidence?.toString() ?? ''} onChange={event => onUpdate(item.id, 'confidence', event.target.value ? Number(event.target.value) : null)} options={[{ value: '', label: 'Not set' }, ...[1,2,3,4,5].map(value => ({ value: String(value), label: `${value}/5` }))]} /><TextArea label="Verification note (optional)" value={item.verificationNote} onChange={event => onUpdate(item.id, 'verificationNote', event.target.value)} rows={2} /></div>
        <div className="mt-3 border-t border-slate-100 pt-3"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Structural sources</span><div className="mt-1 flex flex-wrap gap-1.5">{item.sourceReferences.length ? item.sourceReferences.map(reference => { const source = candidates.find(candidate => candidate.reference.type === reference.type && candidate.reference.id === reference.id); return <span key={`${reference.type}:${reference.id}`} className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800">{source?.label ?? `Missing source · ${reference.id}`}</span>; }) : <span className="text-[11px] text-amber-700">Manual synthesis · no supporting source linked</span>}</div></div>
      </article>;
    })}</div>
  </section>;
}

function OptionZone({ type, data, selections, onSelections, onAdd, onUpdate, onDelete }: { type: StrategicOptionType; data: UnpolProjectData; selections: [string, string]; onSelections: (value: [string, string]) => void; onAdd: () => void; onUpdate: (id: string, field: 'option' | 'planningNote', value: string) => void; onDelete: (id: string) => void }) {
  const required = OPTION_COMBINATIONS[type];
  const options = data.analysisSynthesis.strategicOptions.filter(item => item.type === type);
  const choices = required.map(category => data.analysisSynthesis.swotFindings.filter(item => item.category === category));
  return <section className="rounded-xl border border-slate-200 bg-slate-50 p-4"><header><span className="text-[10px] font-black tracking-wider text-blue-700">{type}</span><h4 className="text-sm font-black text-slate-950">{OPTION_CONTENT[type].title}</h4><p className="mt-1 text-xs leading-relaxed text-slate-600">{OPTION_CONTENT[type].prompt}</p></header>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">{required.map((category, index) => <Select key={category} label={category} value={selections[index]} onChange={event => { const next: [string,string] = [...selections] as [string,string]; next[index] = event.target.value; onSelections(next); }} options={[{ value: '', label: `Choose ${category.toLowerCase()}…` }, ...choices[index].map(item => ({ value: item.id, label: `${item.reference} — ${item.finding || 'Untitled finding'}` }))]} />)}</div>
    <Button size="sm" className="mt-3" onClick={onAdd} disabled={!selections[0] || !selections[1]}><Plus size={14} className="mr-1" />Add {type} Option</Button>
    <div className="mt-4 flex flex-col gap-3">{options.map(option => <article key={option.id} className="rounded-lg border border-slate-200 bg-white p-3"><div className="mb-2 flex items-center justify-between"><strong className="text-xs text-blue-800">{option.reference} · {option.swotFindingIds.map(id => data.analysisSynthesis.swotFindings.find(item => item.id === id)?.reference).filter(Boolean).join(' + ')}</strong><button type="button" onClick={() => onDelete(option.id)} aria-label={`Delete ${option.reference}`} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"><Trash2 size={14} /></button></div><TextArea label="Strategic Option" value={option.option} onChange={event => onUpdate(option.id, 'option', event.target.value)} rows={3} /><div className="mt-2"><TextArea label="Planning note (optional)" value={option.planningNote} onChange={event => onUpdate(option.id, 'planningNote', event.target.value)} rows={2} /></div>{!isValidStrategicOptionCombination(option, data.analysisSynthesis.swotFindings) && <p className="mt-2 text-xs font-semibold text-amber-700">Review required: this option no longer has a complete {type} SWOT basis.</p>}</article>)}</div>
  </section>;
}
