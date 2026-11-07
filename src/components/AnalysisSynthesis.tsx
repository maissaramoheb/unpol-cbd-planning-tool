import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Link2, Plus, Trash2, Info, ChevronDown, ChevronUp, Sparkles, AlertTriangle } from 'lucide-react';
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

const CATEGORY_CONTENT: Record<SwotCategory, { prompt: string; scope: string; tag: string }> = {
  Strength: {
    prompt: 'What existing internal capability, asset or positive institutional condition can CBD build on?',
    scope: 'Internal · Enabling Assets',
    tag: 'Internal Assets'
  },
  Weakness: {
    prompt: 'What internal capacity, performance, system or institutional gap needs to be addressed?',
    scope: 'Internal · Constraining Deficits',
    tag: 'Internal Deficits'
  },
  Opportunity: {
    prompt: 'What external condition could enable or accelerate progress in institutional capacity?',
    scope: 'External · Enabling Dynamics',
    tag: 'External Enablers'
  },
  Threat: {
    prompt: 'What external condition could obstruct, delay or reverse capacity-building progress?',
    scope: 'External · Constraining Dynamics',
    tag: 'External Spoilers'
  }
};

const OPTION_CONTENT: Record<StrategicOptionType, { title: string; subtitle: string; prompt: string }> = {
  SO: {
    title: 'Strength × Opportunity',
    subtitle: 'Maxi-Maxi Strategy',
    prompt: 'How can existing institutional capacities be deployed to capitalize on favorable external conditions?'
  },
  ST: {
    title: 'Strength × Threat',
    subtitle: 'Maxi-Mini Strategy',
    prompt: 'How can existing institutional capacities help neutralize or reduce exposure to external operational threats?'
  },
  WO: {
    title: 'Weakness × Opportunity',
    subtitle: 'Mini-Maxi Strategy',
    prompt: 'How can favorable external conditions or partner support help overcome internal capacity gaps?'
  },
  WT: {
    title: 'Weakness × Threat',
    subtitle: 'Mini-Mini Strategy',
    prompt: 'What defensive, protective or risk-mitigation response is needed where internal weakness meets external threat?'
  }
};

export const AnalysisSynthesis: React.FC<AnalysisSynthesisProps> = ({
  data,
  onChange,
  onDeleteFinding,
  onDeleteOption,
  onBack,
  onContinue
}) => {
  const synthesis = data.analysisSynthesis;
  const [sourcePanelOpen, setSourcePanelOpen] = useState(false);
  const [selectedSourceKey, setSelectedSourceKey] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SwotCategory>('Strength');
  const [optionsOpen, setOptionsOpen] = useState(synthesis.strategicOptions.length > 0);
  const [optionSelections, setOptionSelections] = useState<Record<StrategicOptionType, [string, string]>>({
    SO: ['', ''],
    ST: ['', ''],
    WO: ['', ''],
    WT: ['', '']
  });
  const candidates = useMemo(() => getAnalysisSourceCandidates(data), [data]);

  const updateFinding = (
    id: string,
    field: 'finding' | 'cbdImplication' | 'verificationNote' | 'confidence',
    value: string | number | null
  ) => {
    onChange({
      ...synthesis,
      swotFindings: synthesis.swotFindings.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const addFinding = (category: SwotCategory, sourceKey?: string) => {
    const source = candidates.find(item => `${item.reference.type}:${item.reference.id}` === sourceKey);
    const reference = nextReference(
      SWOT_CATEGORY_PREFIX[category],
      synthesis.swotFindings.map(item => item.reference)
    );
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
    onChange({
      ...synthesis,
      strategicOptions: synthesis.strategicOptions.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
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

      {/* Methodological Guidance Callout - Clean, Natural, Compact */}
      <div className="rounded-lg border border-status-info-border/70 bg-status-info-bg/30 px-4 py-3 text-xs leading-relaxed text-text-primary flex items-start gap-3 shadow-2xs">
        <Info size={16} className="text-action-link shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-text-primary">Professional judgement remains primary.</strong>{' '}
          SWOT classification is analyst-written synthesis. It structures evidence from PESTEL-S and Stakeholder diagnostics to support planning judgement; it does not automate or determine the CBD response.
        </div>
      </div>

      <section aria-labelledby="swot-heading" className="flex flex-col gap-4">
        {/* Section Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 id="swot-heading" className="text-base font-bold text-text-primary flex items-center gap-2">
              <span>SWOT Strategic Synthesis</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Internal institutional conditions sit strictly above external operating conditions. Empty categories remain valid.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSourcePanelOpen(open => !open)}
            aria-expanded={sourcePanelOpen}
            aria-controls="existing-analysis-picker"
            className="shadow-2xs self-start sm:self-auto"
          >
            <Link2 size={14} className="mr-1.5" />
            Add from Existing Analysis
          </Button>
        </div>

        {/* Existing Analysis Import Drawer */}
        {sourcePanelOpen && (
          <div
            id="existing-analysis-picker"
            className="rounded-xl border border-border-strong bg-surface-subtle p-4 shadow-subtle transition-all duration-150"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-action-link" />
              <span className="text-xs font-semibold text-text-primary">
                Import findings from PESTEL-S Diagnostic or Stakeholders
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_200px_auto] md:items-end">
              <Select
                label="Existing analytical source"
                value={selectedSourceKey}
                onChange={event => setSelectedSourceKey(event.target.value)}
                options={[
                  { value: '', label: 'Choose a verified diagnostic source…' },
                  ...candidates.map(item => ({
                    value: `${item.reference.type}:${item.reference.id}`,
                    label: `${item.group} — ${item.label}`
                  }))
                ]}
              />
              <Select
                label="Planner classification"
                value={selectedCategory}
                onChange={event => setSelectedCategory(event.target.value as SwotCategory)}
                options={SWOT_CATEGORIES.map(category => ({ value: category, label: category }))}
              />
              <Button
                size="sm"
                onClick={() => addFinding(selectedCategory, selectedSourceKey)}
                disabled={!selectedSourceKey}
              >
                <Plus size={14} className="mr-1.5" />
                Add Source Finding
              </Button>
            </div>
            {candidates.find(item => `${item.reference.type}:${item.reference.id}` === selectedSourceKey)?.reference.type === 'interdependency' && (
              <p className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-border-default bg-surface-base p-3 text-xs text-text-primary">
                {candidates.find(item => `${item.reference.type}:${item.reference.id}` === selectedSourceKey)?.text}
              </p>
            )}
            <p className="mt-2 text-xs text-text-muted">
              The analytical source remains linked for traceability. You may edit the synthesis wording without modifying the original diagnostic record.
            </p>
          </div>
        )}

        {/* 1. Compact, Balanced SWOT Summary & Orientation Strip (Stitch Candidates 09 & 10) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SWOT_CATEGORIES.map(category => {
            const items = data.analysisSynthesis.swotFindings.filter(item => item.category === category);
            const content = CATEGORY_CONTENT[category];
            const letter = category[0];
            const styles: Record<SwotCategory, {
              topBorder: string;
              border: string;
              bg: string;
              badge: string;
              title: string;
              tagClass: string;
            }> = {
              Strength: {
                topBorder: 'border-t-2 border-t-emerald-500',
                border: 'border-emerald-500/20 dark:border-emerald-500/30',
                bg: 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]',
                badge: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/30',
                title: 'text-emerald-900 dark:text-emerald-300',
                tagClass: 'text-emerald-800 dark:text-emerald-400'
              },
              Weakness: {
                topBorder: 'border-t-2 border-t-rose-500',
                border: 'border-rose-500/20 dark:border-rose-500/30',
                bg: 'bg-rose-500/[0.03] dark:bg-rose-500/[0.06]',
                badge: 'bg-rose-500/15 text-rose-800 dark:text-rose-400 border-rose-500/30',
                title: 'text-rose-900 dark:text-rose-300',
                tagClass: 'text-rose-800 dark:text-rose-400'
              },
              Opportunity: {
                topBorder: 'border-t-2 border-t-sky-500',
                border: 'border-sky-500/20 dark:border-sky-500/30',
                bg: 'bg-sky-500/[0.03] dark:bg-sky-500/[0.06]',
                badge: 'bg-sky-500/15 text-sky-800 dark:text-sky-400 border-sky-500/30',
                title: 'text-sky-900 dark:text-sky-300',
                tagClass: 'text-sky-800 dark:text-sky-400'
              },
              Threat: {
                topBorder: 'border-t-2 border-t-amber-500',
                border: 'border-amber-500/20 dark:border-amber-500/30',
                bg: 'bg-amber-500/[0.03] dark:bg-amber-500/[0.06]',
                badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30',
                title: 'text-amber-900 dark:text-amber-300',
                tagClass: 'text-amber-800 dark:text-amber-400'
              }
            };
            const s = styles[category];

            return (
              <div
                key={category}
                className={`rounded-xl border ${s.border} ${s.topBorder} ${s.bg} p-3 flex flex-col justify-between shadow-2xs transition-all duration-150`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold border ${s.badge}`}>
                        {letter}
                      </span>
                      <h4 className={`text-xs font-bold ${s.title}`}>
                        {category}
                      </h4>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-text-muted px-2 py-0.5 rounded-full bg-surface-base border border-border-default shadow-2xs">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className={`text-[11px] font-medium ${s.tagClass}`}>
                      {content.scope}
                    </span>
                  </div>
                </div>

                {/* Compact Orientation preview */}
                <div className="mt-2 pt-2 border-t border-border-default/50 flex items-center justify-between text-[11px]">
                  {items.length > 0 ? (
                    <div className="flex flex-wrap gap-1 items-center overflow-hidden max-h-5">
                      {items.slice(0, 4).map(item => (
                        <span
                          key={item.id}
                          className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-surface-base border border-border-default text-text-primary shadow-2xs"
                        >
                          {item.reference}
                        </span>
                      ))}
                      {items.length > 4 && (
                        <span className="text-[10px] text-text-muted">
                          +{items.length - 4}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-text-muted italic text-[11px]">
                      No items recorded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Professional 2x2 SWOT Analytical Matrix (Strict Methodological Preservation) */}
        <div className="rounded-xl border border-border-strong bg-surface-raised overflow-hidden shadow-subtle">
          {/* Row 1 Header: Internal Conditions */}
          <div className="border-b border-border-default bg-surface-subtle px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-text-primary">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-action-primary" />
              <span>Internal Institutional Conditions</span>
            </div>
            <span className="font-mono text-[11px] text-text-muted">
              Strengths &amp; Weaknesses (Capacities &amp; Deficits)
            </span>
          </div>

          {/* Row 1 Grid: Strengths (Left) & Weaknesses (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-default">
            <SwotZone
              category="Strength"
              data={data}
              onAdd={() => addFinding('Strength')}
              onUpdate={updateFinding}
              onDelete={onDeleteFinding}
            />
            <SwotZone
              category="Weakness"
              data={data}
              onAdd={() => addFinding('Weakness')}
              onUpdate={updateFinding}
              onDelete={onDeleteFinding}
            />
          </div>

          {/* Row 2 Header: External Conditions */}
          <div className="border-t border-b border-border-default bg-surface-subtle px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-text-primary">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-action-link" />
              <span>External Operating Conditions</span>
            </div>
            <span className="font-mono text-[11px] text-text-muted">
              Opportunities &amp; Threats (Environment &amp; Dynamics)
            </span>
          </div>

          {/* Row 2 Grid: Opportunities (Left) & Threats (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-default">
            <SwotZone
              category="Opportunity"
              data={data}
              onAdd={() => addFinding('Opportunity')}
              onUpdate={updateFinding}
              onDelete={onDeleteFinding}
            />
            <SwotZone
              category="Threat"
              data={data}
              onAdd={() => addFinding('Threat')}
              onUpdate={updateFinding}
              onDelete={onDeleteFinding}
            />
          </div>
        </div>
      </section>

      {/* TOWS Matrix Section */}
      <section className="rounded-xl border border-border-strong bg-surface-raised overflow-hidden shadow-subtle">
        <button
          type="button"
          onClick={() => setOptionsOpen(open => !open)}
          aria-expanded={optionsOpen}
          aria-controls="strategic-options"
          className="flex w-full items-center justify-between gap-4 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring hover:bg-surface-hover transition-colors"
        >
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm font-bold text-text-primary">
                Strategic Options Formulation (TOWS Cross-Matrix)
              </strong>
            </div>
            <span className="mt-0.5 block text-xs text-text-muted">
              Cross-reference internal factors with external conditions to derive actionable options (SO, ST, WO, WT). No option is generated or ranked automatically.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-action-link">
              {optionsOpen ? 'Hide Matrix' : 'Open Matrix'}
            </span>
            {optionsOpen ? (
              <ChevronUp size={16} className="text-action-link" />
            ) : (
              <ChevronDown size={16} className="text-action-link" />
            )}
          </div>
        </button>

        {optionsOpen && (
          <div id="strategic-options" className="border-t border-border-default">
            {/* TOWS 2x2 Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-default">
              <OptionZone
                type="SO"
                data={data}
                selections={optionSelections.SO}
                onSelections={value => setOptionSelections(current => ({ ...current, SO: value }))}
                onAdd={() => addOption('SO')}
                onUpdate={updateOption}
                onDelete={onDeleteOption}
              />
              <OptionZone
                type="ST"
                data={data}
                selections={optionSelections.ST}
                onSelections={value => setOptionSelections(current => ({ ...current, ST: value }))}
                onAdd={() => addOption('ST')}
                onUpdate={updateOption}
                onDelete={onDeleteOption}
              />
            </div>
            <div className="border-t border-border-default" />
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-default">
              <OptionZone
                type="WO"
                data={data}
                selections={optionSelections.WO}
                onSelections={value => setOptionSelections(current => ({ ...current, WO: value }))}
                onAdd={() => addOption('WO')}
                onUpdate={updateOption}
                onDelete={onDeleteOption}
              />
              <OptionZone
                type="WT"
                data={data}
                selections={optionSelections.WT}
                onSelections={value => setOptionSelections(current => ({ ...current, WT: value }))}
                onAdd={() => addOption('WT')}
                onUpdate={updateOption}
                onDelete={onDeleteOption}
              />
            </div>
          </div>
        )}
      </section>

      <NextStepCue {...NEXT_STEP_CUES[4]} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft size={15} className="mr-2" />
          Back: Stakeholders &amp; Ownership
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="tertiary" onClick={onContinue}>
            Continue without synthesis
          </Button>
          <Button onClick={onContinue}>
            Continue to CBD Priorities
            <ArrowRight size={15} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const SWOT_ACCENTS: Record<SwotCategory, {
  dot: string;
  headerBorder: string;
  headerBg: string;
  badge: string;
  tagClass: string;
  surfaceBg: string;
}> = {
  Strength: {
    dot: 'bg-emerald-500',
    headerBorder: 'border-l-4 border-l-emerald-500',
    headerBg: 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.12]',
    badge: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    tagClass: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    surfaceBg: 'bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]'
  },
  Weakness: {
    dot: 'bg-rose-500',
    headerBorder: 'border-l-4 border-l-rose-500',
    headerBg: 'bg-rose-500/[0.06] dark:bg-rose-500/[0.12]',
    badge: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
    tagClass: 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    surfaceBg: 'bg-rose-500/[0.02] dark:bg-rose-500/[0.04]'
  },
  Opportunity: {
    dot: 'bg-sky-500',
    headerBorder: 'border-l-4 border-l-sky-500',
    headerBg: 'bg-sky-500/[0.06] dark:bg-sky-500/[0.12]',
    badge: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30',
    tagClass: 'text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
    surfaceBg: 'bg-sky-500/[0.02] dark:bg-sky-500/[0.04]'
  },
  Threat: {
    dot: 'bg-amber-500',
    headerBorder: 'border-l-4 border-l-amber-500',
    headerBg: 'bg-amber-500/[0.06] dark:bg-amber-500/[0.12]',
    badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    tagClass: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    surfaceBg: 'bg-amber-500/[0.02] dark:bg-amber-500/[0.04]'
  }
};

function SwotZone({
  category,
  data,
  onAdd,
  onUpdate,
  onDelete
}: {
  category: SwotCategory;
  data: UnpolProjectData;
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: 'finding' | 'cbdImplication' | 'verificationNote' | 'confidence',
    value: string | number | null
  ) => void;
  onDelete: (id: string) => void;
}) {
  const content = CATEGORY_CONTENT[category];
  const items = data.analysisSynthesis.swotFindings.filter(item => item.category === category);
  const candidates = getAnalysisSourceCandidates(data);
  const accent = SWOT_ACCENTS[category];

  return (
    <section aria-labelledby={`swot-${category}`} className={`flex flex-col ${accent.surfaceBg}`}>
      <header className={`border-b border-border-default ${accent.headerBg} px-4 py-3 flex items-start justify-between gap-3 min-h-[86px] lg:h-[86px] ${accent.headerBorder}`}>
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`h-2.5 w-2.5 rounded-full ${accent.dot} shrink-0 ring-2 ring-white/50 dark:ring-black/50`} />
            <h4 id={`swot-${category}`} className="text-xs font-bold uppercase tracking-wider text-text-primary">
              {category}
            </h4>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${accent.tagClass}`}>
              {content.tag}
            </span>
            <span className="font-mono text-xs font-semibold text-text-muted">
              ({items.length})
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-text-muted line-clamp-2">{content.prompt}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onAdd} className="shrink-0 shadow-2xs self-start">
          <Plus size={14} className="mr-1" />
          Add Finding
        </Button>
      </header>

      <div className="p-3.5 space-y-3 flex-1">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-default p-6 text-center text-xs italic text-text-muted">
            No {category.toLowerCase()} findings recorded yet. Click &quot;Add Finding&quot; to synthesize an analytical item.
          </div>
        ) : (
          items.map(item => {
            const linkedOptions = data.analysisSynthesis.strategicOptions.filter(option =>
              option.swotFindingIds.includes(item.id)
            );
            return (
              <article
                key={item.id}
                className="rounded-xl border border-border-default bg-surface-raised p-4 shadow-2xs hover:shadow-subtle hover:border-border-strong transition-all duration-150 flex flex-col gap-3"
              >
                {/* Finding Header */}
                <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border shadow-2xs ${accent.badge}`}>
                      {item.reference}
                    </span>
                    {linkedOptions.length > 0 && (
                      <span className="text-[11px] font-medium text-action-link bg-status-info-bg border border-status-info-border px-2 py-0.5 rounded-md">
                        Supports TOWS: {linkedOptions.map(option => option.reference).join(', ')}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !linkedOptions.length ||
                        confirm(
                          `${item.reference} supports ${linkedOptions.map(option => option.reference).join(', ')}. Delete it and flag those options for review?`
                        )
                      ) {
                        onDelete(item.id);
                      }
                    }}
                    aria-label={`Delete ${item.reference}`}
                    className="rounded-lg p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger-bg/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Finding Textarea */}
                <TextArea
                  label="Analytical Finding"
                  value={item.finding}
                  onChange={event => onUpdate(item.id, 'finding', event.target.value)}
                  rows={2}
                />

                {/* CBD Implication */}
                <TextArea
                  label="Operational Implication for CBD"
                  value={item.cbdImplication}
                  onChange={event => onUpdate(item.id, 'cbdImplication', event.target.value)}
                  rows={2}
                />

                {/* Confidence and Verification Note */}
                <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                  <Select
                    label="Confidence"
                    value={item.confidence?.toString() ?? ''}
                    onChange={event =>
                      onUpdate(item.id, 'confidence', event.target.value ? Number(event.target.value) : null)
                    }
                    options={[
                      { value: '', label: 'Not set' },
                      ...[1, 2, 3, 4, 5].map(value => ({ value: String(value), label: `${value}/5` }))
                    ]}
                  />
                  <TextArea
                    label="Verification note (optional)"
                    value={item.verificationNote}
                    onChange={event => onUpdate(item.id, 'verificationNote', event.target.value)}
                    rows={2}
                  />
                </div>

                {/* Structural Sources */}
                <div className="pt-1 border-t border-border-subtle">
                  <span className="text-[11px] font-medium text-text-muted block mb-1">
                    Diagnostic Source Linkage
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.sourceReferences.length ? (
                      item.sourceReferences.map(reference => {
                        const source = candidates.find(
                          candidate => candidate.reference.type === reference.type && candidate.reference.id === reference.id
                        );
                        return (
                          <span
                            key={`${reference.type}:${reference.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-status-info-border bg-status-info-bg px-2 py-0.5 text-[11px] font-medium text-action-link"
                          >
                            <Link2 size={11} />
                            {source?.label ?? `Missing source · ${reference.id}`}
                          </span>
                        );
                      })
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        <AlertTriangle size={11} className="text-amber-600 dark:text-amber-400" />
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

function OptionZone({
  type,
  data,
  selections,
  onSelections,
  onAdd,
  onUpdate,
  onDelete
}: {
  type: StrategicOptionType;
  data: UnpolProjectData;
  selections: [string, string];
  onSelections: (value: [string, string]) => void;
  onAdd: () => void;
  onUpdate: (id: string, field: 'option' | 'planningNote', value: string) => void;
  onDelete: (id: string) => void;
}) {
  const required = OPTION_COMBINATIONS[type];
  const options = data.analysisSynthesis.strategicOptions.filter(item => item.type === type);
  const choices = required.map(category =>
    data.analysisSynthesis.swotFindings.filter(item => item.category === category)
  );

  const optionBadges: Record<StrategicOptionType, { badge: string; accentBorder: string; headerBg: string }> = {
    SO: {
      badge: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30',
      accentBorder: 'border-l-4 border-l-sky-500',
      headerBg: 'bg-sky-500/[0.06] dark:bg-sky-500/[0.12]'
    },
    ST: {
      badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
      accentBorder: 'border-l-4 border-l-amber-500',
      headerBg: 'bg-amber-500/[0.06] dark:bg-amber-500/[0.12]'
    },
    WO: {
      badge: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
      accentBorder: 'border-l-4 border-l-emerald-500',
      headerBg: 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.12]'
    },
    WT: {
      badge: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
      accentBorder: 'border-l-4 border-l-rose-500',
      headerBg: 'bg-rose-500/[0.06] dark:bg-rose-500/[0.12]'
    }
  };

  const currentStyle = optionBadges[type];

  return (
    <section className="flex flex-col">
      <header className={`border-b border-border-default ${currentStyle.headerBg} px-4 py-3 flex items-start justify-between gap-3 min-h-[86px] lg:h-[86px] ${currentStyle.accentBorder}`}>
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border shadow-2xs ${currentStyle.badge}`}>
              {type}
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              {OPTION_CONTENT[type].title}
            </h4>
            <span className="text-xs text-text-muted font-normal">
              ({OPTION_CONTENT[type].subtitle})
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-text-muted line-clamp-2">{OPTION_CONTENT[type].prompt}</p>
        </div>
      </header>

      {/* Option Formulation Bar */}
      <div className="p-3.5 border-b border-border-default bg-surface-subtle/30 min-h-[104px] flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-text-primary truncate">
            Formulate Strategy: Combine {required[0]} + {required[1]}
          </span>
          <span className="text-[11px] text-text-muted shrink-0">
            Select one from each category
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_auto] items-end">
          {required.map((category, index) => (
            <Select
              key={category}
              label={`Select ${category}`}
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
          <Button
            size="sm"
            className={`h-9 px-3.5 transition-all duration-150 shrink-0 ${
              !selections[0] || !selections[1]
                ? 'opacity-40 cursor-not-allowed border-dashed'
                : 'shadow-xs hover:shadow-subtle active:scale-[0.98]'
            }`}
            onClick={onAdd}
            disabled={!selections[0] || !selections[1]}
          >
            <Plus size={14} className="mr-1.5" />
            Add {type} Option
          </Button>
        </div>
      </div>

      {/* Formulated Options List */}
      <div className="p-3.5 space-y-3 flex-1">
        {options.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-default p-6 text-center text-xs italic text-text-muted">
            No {type} options formulated yet. Select a {required[0].toLowerCase()} and {required[1].toLowerCase()} above to create one.
          </div>
        ) : (
          options.map(option => (
            <article
              key={option.id}
              className="rounded-xl border border-border-default bg-surface-raised p-3.5 shadow-2xs hover:shadow-subtle hover:border-border-strong transition-all duration-150 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2">
                <strong className={`text-xs font-semibold px-2 py-0.5 rounded-md border font-mono shadow-2xs ${currentStyle.badge}`}>
                  {option.reference} · {option.swotFindingIds.map(id => data.analysisSynthesis.swotFindings.find(item => item.id === id)?.reference).filter(Boolean).join(' + ')}
                </strong>
                <button
                  type="button"
                  onClick={() => onDelete(option.id)}
                  aria-label={`Delete ${option.reference}`}
                  className="rounded-lg p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger-bg/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-colors"
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
                <div className="rounded-lg border border-status-warning-border bg-status-warning-bg p-2.5 text-xs font-medium text-status-warning flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-status-warning shrink-0" />
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
