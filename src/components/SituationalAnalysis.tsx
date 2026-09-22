import React, { useState } from 'react';
import { Interdependency, PestelsItem, PestelsRating, UnpolProjectData } from '../types';
import { InterdependencyAnalysis } from './InterdependencyAnalysis';
import { newInterdependency } from '../lib/interdependencies';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { TextArea } from '../ui/TextArea';
import { Badge } from '../ui/Badge';
import { EvidenceLogEditor } from './EvidenceLogEditor';
import { Activity, ShieldAlert, Award, Compass, Eye, Globe, Scale } from 'lucide-react';
import { StageLead } from './StageLead';
import { NextStepCue } from './Guidance';
import { NEXT_STEP_CUES } from '../lib/guidance';

const PESTELS_PALETTE: Record<string, { iconColor: string; dot: string }> = {
  political: { iconColor: 'text-indigo-600', dot: 'bg-indigo-500' },
  economic: { iconColor: 'text-teal-600', dot: 'bg-teal-500' },
  social: { iconColor: 'text-purple-600', dot: 'bg-purple-500' },
  technological: { iconColor: 'text-cyan-600', dot: 'bg-cyan-500' },
  environmental: { iconColor: 'text-emerald-600', dot: 'bg-emerald-500' },
  legal: { iconColor: 'text-amber-600', dot: 'bg-amber-500' },
  security: { iconColor: 'text-rose-600', dot: 'bg-rose-500' }
};

interface SituationalAnalysisProps {
  data: UnpolProjectData;
  interdependencyError: string | null;
  onInterdependenciesChange: (items: Interdependency[]) => void;
  pestels: Record<string, PestelsItem>;
  onChange: (id: string, item: PestelsItem) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const SituationalAnalysis: React.FC<SituationalAnalysisProps> = ({
  data, interdependencyError, onInterdependenciesChange,
  pestels,
  onChange,
  onNext,
  onPrev
}) => {
  const [selectedId, setSelectedId] = useState<string>('political');
  const [interdependencyOpen, setInterdependencyOpen] = useState(false);
  const [draft, setDraft] = useState<Interdependency | null>(null);
  const activeItem = pestels[selectedId];

  const handleFieldChange = (field: keyof PestelsItem, value: string) => {
    onChange(selectedId, {
      ...activeItem,
      [field]: value
    });
  };

  const handleRatingChange = (ratingField: keyof PestelsRating, value: number) => {
    onChange(selectedId, {
      ...activeItem,
      rating: {
        ...activeItem.rating,
        [ratingField]: value
      }
    });
  };

  const getPestelsIcon = (id: string) => {
    const style = PESTELS_PALETTE[id] || { iconColor: 'text-text-muted', dot: 'bg-slate-400' };
    switch (id) {
      case 'political': return <Compass size={15} className={`${style.iconColor} shrink-0`} />;
      case 'economic': return <Activity size={15} className={`${style.iconColor} shrink-0`} />;
      case 'social': return <Award size={15} className={`${style.iconColor} shrink-0`} />;
      case 'technological': return <Eye size={15} className={`${style.iconColor} shrink-0`} />;
      case 'environmental': return <Globe size={15} className={`${style.iconColor} shrink-0`} />;
      case 'legal': return <Scale size={15} className={`${style.iconColor} shrink-0`} />;
      case 'security': return <ShieldAlert size={15} className={`${style.iconColor} shrink-0`} />;
      default: return <Compass size={15} className={`${style.iconColor} shrink-0`} />;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <StageLead stage={2} />

      {/* Master-Detail Worksurface Container */}
      <div className="rounded-lg border border-border-strong bg-surface-raised overflow-hidden flex flex-col lg:flex-row">
        {/* Left Master List */}
        <div className="w-full lg:w-72 lg:border-r border-border-default bg-surface-subtle/40 shrink-0 flex flex-col">
          <div className="px-4 py-3 border-b border-border-default bg-surface-subtle flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              PESTEL-S Factors (7)
            </span>
          </div>

          <div className="divide-y divide-border-default flex flex-col">
            {Object.values(pestels).map((item) => {
              const isSelected = item.id === selectedId;
              const hasFinding = item.finding.trim().length > 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`
                    text-left px-4 py-3.5 transition-colors duration-150 motion-reduce:transition-none flex flex-col gap-1 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring
                    ${isSelected
                      ? 'bg-blue-50/80 border-l-2 border-action-primary'
                      : 'border-l-2 border-transparent hover:bg-surface-subtle/80'
                    }
                  `}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getPestelsIcon(item.id)}
                      <span className={`text-xs truncate ${isSelected ? 'font-bold text-action-primary' : 'font-semibold text-text-primary'}`}>
                        {item.name.split(' / ')[0]}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-[11px] font-medium text-text-muted shrink-0">
                      {hasFinding ? `Imp: ${item.rating.impact}/5` : 'Not assessed'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-1 leading-snug">
                    {hasFinding ? item.finding : <span className="italic text-text-muted/70">No finding recorded</span>}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Inspector */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col gap-4">
          {activeItem ? (
            <>
              <div className="border-b border-border-default pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-text-primary">
                      {activeItem.name}
                    </h3>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{activeItem.definition}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="font-mono tabular-nums text-xs font-semibold bg-surface-subtle border border-border-default px-2 py-0.5 rounded text-text-secondary">
                    {activeItem.finding.trim() !== ''
                      ? `Pressure: ${activeItem.rating.impact * activeItem.rating.urgency}/25`
                      : 'Pressure: Not assessed'}
                  </span>
                </div>
              </div>

              {/* Guided Manual Inputs */}
              <TextArea
                label="Key Finding / Host-State Diagnosis"
                value={activeItem.finding}
                onChange={(e) => handleFieldChange('finding', e.target.value)}
                placeholder="Describe the main challenge or condition observed..."
                rows={3}
              />

              <TextArea
                label="Why this matters for host-state capacity development"
                value={activeItem.why}
                onChange={(e) => handleFieldChange('why', e.target.value)}
                placeholder="Explain why this factor restricts or dictates policing standards..."
                rows={2}
              />

              <div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!activeItem.finding.trim()}
                  onClick={() => { setDraft(newInterdependency(data.interdependencies, activeItem.id)); setInterdependencyOpen(true); }}
                >
                  Explore Interdependency from this finding
                </Button>
              </div>

              <TextArea
                label="Suggested sequencing guideline for UNPOL intervention"
                value={activeItem.sequencing}
                onChange={(e) => handleFieldChange('sequencing', e.target.value)}
                placeholder="Describe sequencing, e.g. Do this before training..."
                rows={2}
              />

              {/* Sliders Grid */}
              <div className="mt-2 pt-4 border-t border-border-default">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Analytical Ratings (1-5 Scale)
                  </h4>
                  {activeItem.finding.trim() === '' && (
                    <span className="text-[11px] font-medium text-text-muted bg-surface-subtle border border-border-default px-2 py-0.5 rounded">
                      Not assessed
                    </span>
                  )}
                </div>
                {activeItem.finding.trim() === '' && (
                  <p className="text-xs text-text-muted mb-3 italic">
                    Ratings reflect technical baseline values. Record an analyst finding above to activate completed factor analysis.
                  </p>
                )}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 ${activeItem.finding.trim() === '' ? 'opacity-60' : ''}`}>
                  <Slider
                    label="Impact on Policing Reforms"
                    value={activeItem.rating.impact}
                    onChange={(v) => handleRatingChange('impact', v)}
                    minLabel="Low Impact"
                    maxLabel="High Constraint"
                  />
                  <Slider
                    label="Urgency Level"
                    value={activeItem.rating.urgency}
                    onChange={(v) => handleRatingChange('urgency', v)}
                    minLabel="Deferrable"
                    maxLabel="Immediate Action"
                  />
                  <Slider
                    label="Confidence Level"
                    value={activeItem.rating.confidence}
                    onChange={(v) => handleRatingChange('confidence', v)}
                    minLabel="Low Data"
                    maxLabel="Well Supported"
                  />
                  <Slider
                    label="CBD Intervention Relevance"
                    value={activeItem.rating.relevance}
                    onChange={(v) => handleRatingChange('relevance', v)}
                    minLabel="Indirect"
                    maxLabel="Directly Linked"
                  />
                </div>
              </div>

              {/* Linked Entities Preview */}
              <div className="mt-2 pt-4 border-t border-border-default grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-text-secondary block mb-1.5">Suggested CBD Intervention Areas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeItem.cbdAreas.map((area, idx) => (
                      <Badge key={idx} variant="blue">{area}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-text-secondary block mb-1.5">Relevant Cross-Cutting Analytical Lenses</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeItem.dimensions.map((dim, idx) => (
                      <Badge key={idx} variant="teal">{dim}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-border-default">
                <EvidenceLogEditor
                  notes={activeItem.evidenceNotes || []}
                  onChange={(newNotes) => {
                    onChange(activeItem.id, {
                      ...activeItem,
                      evidenceNotes: newNotes
                    });
                  }}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-text-muted text-sm">
              Select a PESTEL-S category to begin.
            </div>
          )}
        </div>
      </div>

      <NextStepCue {...NEXT_STEP_CUES[2]} />

      <div className="flex justify-between items-center gap-3">
        <Button variant="secondary" onClick={onPrev}>
          Back: Context &amp; Mandate
        </Button>
        <Button variant="primary" onClick={onNext}>
          Next: Stakeholders &amp; Ownership
        </Button>
      </div>

      <div className="min-w-0">
        {interdependencyError && <p role="alert" className="mb-3 text-sm text-action-danger">{interdependencyError}</p>}
        <InterdependencyAnalysis data={data} open={interdependencyOpen} onOpenChange={setInterdependencyOpen} draft={draft} onDraftChange={setDraft} onChange={onInterdependenciesChange} />
      </div>
    </div>
  );
};
