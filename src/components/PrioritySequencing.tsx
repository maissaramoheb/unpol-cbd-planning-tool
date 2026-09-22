import React, { useState } from 'react';
import { PriorityBrief, CbdCell } from '../types';
import { Button } from '../ui/Button';
import { evaluateCbdCell } from '../lib/scoring';
import { Plus, Trash2, Layers } from 'lucide-react';
import { NextStepCue } from './Guidance';
import { StageLead } from './StageLead';
import { NEXT_STEP_CUES } from '../lib/guidance';

interface PrioritySequencingProps {
  brief: PriorityBrief;
  customCells: Record<string, CbdCell>;
  onChange: (brief: PriorityBrief) => void;
  onNext: () => void;
  onPrev: () => void;
}

const getClassificationStyle = (classification: string) => {
  switch (classification) {
    case 'Quick Win':
      return {
        text: 'text-emerald-700 font-medium',
        dot: 'bg-emerald-600'
      };
    case 'Sensitive Reform':
      return {
        text: 'text-rose-700 font-medium',
        dot: 'bg-rose-600'
      };
    case 'Long-Term Reform':
      return {
        text: 'text-indigo-700 font-medium',
        dot: 'bg-indigo-600'
      };
    default:
      return {
        text: 'text-text-muted',
        dot: 'bg-border-strong'
      };
  }
};

export const PrioritySequencing: React.FC<PrioritySequencingProps> = ({
  brief,
  customCells,
  onChange,
  onNext,
  onPrev
}) => {
  const [newItem, setNewItem] = useState({
    topPriorities: '',
    quickWins: '',
    sensitiveReforms: '',
    longerTermReforms: '',
    risksAssumptions: ''
  });

  const handleFieldChange = (field: keyof PriorityBrief, value: string | string[]) => {
    onChange({
      ...brief,
      [field]: value
    });
  };

  const handleAddListItem = (field: keyof Omit<PriorityBrief, 'sequencingRecommendation'>) => {
    const text = newItem[field].trim();
    if (!text) return;

    const currentList = brief[field] || [];
    handleFieldChange(field, [...currentList, text]);
    setNewItem({
      ...newItem,
      [field]: ''
    });
  };

  const handleRemoveListItem = (field: keyof Omit<PriorityBrief, 'sequencingRecommendation'>, idx: number) => {
    const currentList = brief[field] || [];
    handleFieldChange(field, currentList.filter((_, i) => i !== idx));
  };

  // Compile matrix priority cells using the scoring library
  const scoredCells = Object.keys(customCells).map(key => {
    const cell = customCells[key];
    const assessment = evaluateCbdCell(cell);
    return {
      key,
      cell,
      score: assessment.score,
      classification: assessment.classification
    };
  }).sort((a, b) => b.score - a.score);

  const phaseGroups = (['NOW', 'NEXT', 'LATER', 'UNASSIGNED'] as const).map(phase => ({
    phase,
    cells: scoredCells.filter(({ cell }) => (cell.implementationPhase || 'UNASSIGNED') === phase)
  }));

  return (
    <div className="flex flex-col gap-6">
      <StageLead stage={6} />

      {/* Prioritization Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Analytical Diagnostics & Phase Allocations */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Intervention Diagnostic */}
          <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden shadow-subtle">
            <div className="px-4 py-3 bg-surface-subtle border-b border-border-default flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Layers size={14} className="text-institutional" />
                Intervention Diagnostic
              </h4>
              <span className="text-[11px] font-mono text-text-muted px-2 py-0.5 rounded bg-surface-card border border-border-default">
                {scoredCells.length} {scoredCells.length === 1 ? 'cell' : 'cells'}
              </span>
            </div>

            {/* Prominent Heuristic Caveat */}
            <div className="px-4 py-2.5 bg-surface-subtle/60 border-b border-border-default text-[11px] text-text-muted leading-relaxed">
              <span className="font-semibold text-text-default">Planning Heuristic:</span> Indicative ranking based on weighted criteria (not official UN doctrine). Use to inform strategic sequencing.
            </div>

            {scoredCells.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted italic">
                No matrix intersections configured yet in Stage 5 (CBD Priorities).
              </div>
            ) : (
              <>
                {/* Aligned Table Header */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3.5 py-1.5 bg-surface-subtle border-b border-border-default text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  <span>Intervention</span>
                  <span className="w-16 text-center">Phase</span>
                  <span className="w-12 text-right">Score</span>
                </div>

                {/* Aligned Table Body */}
                <div className="divide-y divide-border-default max-h-[440px] overflow-y-auto">
                  {scoredCells.map(({ key, cell, score, classification }) => {
                    const phase = cell.implementationPhase || 'UNASSIGNED';
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-3.5 py-2.5 hover:bg-surface-subtle transition-colors text-xs"
                      >
                        <div className="min-w-0 pr-1">
                          <div className="font-medium text-text-default truncate" title={key}>
                            {key}
                          </div>
                          {(() => {
                            const classStyle = getClassificationStyle(classification);
                            return (
                              <div className={`text-[11px] truncate mt-0.5 inline-flex items-center gap-1.5 ${classStyle.text}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${classStyle.dot} shrink-0`} />
                                <span>{classification}</span>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="w-16 flex justify-center shrink-0">
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              phase === 'NOW'
                                ? 'border-action-danger/30 text-action-danger bg-action-danger/5'
                                : phase === 'NEXT'
                                ? 'border-institutional/30 text-institutional bg-institutional-subtle'
                                : phase === 'LATER'
                                ? 'border-border-default text-text-muted bg-surface-subtle'
                                : 'border-dashed border-border-default text-text-muted/60 bg-transparent'
                            }`}
                          >
                            {phase === 'UNASSIGNED' ? 'NONE' : phase}
                          </span>
                        </div>
                        <div className="w-12 text-right font-mono text-xs font-semibold text-institutional tabular-nums shrink-0">
                          {score.toFixed(1)}
                          <span className="text-[10px] text-text-muted font-normal">/5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Manual Implementation Phases */}
          <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden shadow-subtle">
            <div className="px-4 py-3 bg-surface-subtle border-b border-border-default flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Manual Implementation Phases
              </h4>
              <span className="text-[11px] text-text-muted font-mono">
                {Object.keys(customCells).length} total
              </span>
            </div>
            <div className="px-4 py-2 bg-surface-subtle/50 border-b border-border-default text-[11px] text-text-muted leading-relaxed">
              Assignments recorded in the CBD Matrix. Phases reflect planner sequencing decisions, not automated scoring.
            </div>
            <div className="divide-y divide-border-default">
              {phaseGroups.map(group => {
                const phaseLabel = group.phase === 'UNASSIGNED' ? 'NOT ASSIGNED' : group.phase;
                const phaseBadgeStyle =
                  group.phase === 'NOW'
                    ? 'bg-action-danger/10 text-action-danger border-action-danger/30'
                    : group.phase === 'NEXT'
                    ? 'bg-institutional-subtle text-institutional border-institutional/30'
                    : group.phase === 'LATER'
                    ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                    : 'bg-surface-subtle text-text-muted border-border-default';

                return (
                  <div key={group.phase} className="p-3.5 hover:bg-surface-subtle/40 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          group.phase === 'NOW' ? 'bg-action-danger' :
                          group.phase === 'NEXT' ? 'bg-institutional' :
                          group.phase === 'LATER' ? 'bg-amber-500' :
                          'bg-border-strong'
                        }`} />
                        <span className="text-xs font-semibold text-text-default tracking-wide">
                          {phaseLabel}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${phaseBadgeStyle}`}>
                        {group.cells.length}
                      </span>
                    </div>
                    {group.cells.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {group.cells.map(item => (
                          <span
                            key={item.key}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-subtle border border-border-default text-[11px] text-text-default"
                          >
                            <span className="font-medium">{item.key}</span>
                            <span className="font-mono text-[10px] text-institutional tabular-nums font-semibold">
                              {item.score.toFixed(1)}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] italic text-text-muted pl-4">No interventions assigned.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Strategic Sequencing Formulation & Narrative Synthesis */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-lg border border-border-default bg-surface-card overflow-hidden shadow-subtle">
            <div className="px-4 py-3 bg-surface-subtle border-b border-border-default flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Formulate Strategic Sequencing Groups
              </h4>
              <span className="text-[11px] text-text-muted">
                5 Strategic Categories
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {/* Dynamic Lists Creator */}
              {[
                { label: 'Top 3 CBD Priorities', field: 'topPriorities' as const, placeholder: 'e.g. Conduct process mapping for central accountability...' },
                { label: 'Quick Wins (High Feasibility, Low Risk)', field: 'quickWins' as const, placeholder: 'e.g. Distribute paper custody logbooks to field stations...' },
                { label: 'Sensitive Reforms (Requires Political Cover)', field: 'sensitiveReforms' as const, placeholder: 'e.g. Vetting command appointments...' },
                { label: 'Longer-Term Institutional Reforms', field: 'longerTermReforms' as const, placeholder: 'e.g. Update formal Police Act legislation...' },
                { label: 'Risks & Planning Assumptions', field: 'risksAssumptions' as const, placeholder: 'e.g. Assumes host-state leadership maintains minimum cooperation...' }
              ].map(({ label, field, placeholder }) => {
                const list = brief[field] || [];
                return (
                  <div key={field} className="rounded-md border border-border-default bg-surface-subtle/20 overflow-hidden">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-surface-subtle border-b border-border-default">
                      <span className="text-xs font-semibold text-text-default uppercase tracking-wider">
                        {label}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded bg-surface-card border border-border-default">
                        {list.length} {list.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="p-3 flex flex-col gap-2.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newItem[field]}
                          onChange={(e) => setNewItem({ ...newItem, [field]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddListItem(field);
                            }
                          }}
                          placeholder={placeholder}
                          className="flex-1 h-8 px-3 border border-border-default rounded-md text-xs bg-surface-card text-text-default placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-institutional focus:border-institutional transition-shadow"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAddListItem(field)}
                          aria-label={`Add to ${label}`}
                          className="h-8 px-2.5 flex items-center gap-1 shrink-0"
                        >
                          <Plus size={13} />
                          <span className="text-xs">Add</span>
                        </Button>
                      </div>
                      {list.length > 0 && (
                        <ul className="divide-y divide-border-default border border-border-default rounded-md overflow-hidden bg-surface-card">
                          {list.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start justify-between gap-3 text-xs text-text-default leading-relaxed py-2 px-3 hover:bg-surface-subtle transition-colors"
                            >
                              <span className="flex-1">• {item}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveListItem(field, idx)}
                                aria-label={`Remove ${item}`}
                                className="text-text-muted hover:text-action-danger hover:bg-action-danger/10 p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring shrink-0"
                              >
                                <Trash2 size={12} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sequencing Narrative: Prominent Executive Analytical Conclusion Framing */}
          <div className="rounded-lg border-2 border-institutional/25 bg-surface-card overflow-hidden shadow-subtle">
            <div className="px-4 py-3 bg-institutional-subtle border-b border-institutional/20">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-institutional">
                Stage 6 Synthesis: Recommended Sequencing Narrative
              </h4>
              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                Executive analytical narrative synthesizing the phased implementation trajectory from immediate stabilization to sustainable institutional reform.
              </p>
            </div>
            <div className="p-4">
              <textarea
                value={brief.sequencingRecommendation}
                onChange={(e) => handleFieldChange('sequencingRecommendation', e.target.value)}
                placeholder="Articulate the strategic sequencing logic and transitional rationale (e.g., Phase 1 focuses on immediate integrity safeguards and quick wins to build operational credibility; Phase 2 introduces middle-management accountability SOPs; Phase 3 anchors reforms in formal statutory Police Act amendments)..."
                rows={5}
                className="w-full p-3 border border-border-default rounded-md text-xs bg-surface-card text-text-default placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-institutional focus:border-institutional transition-shadow resize-y leading-relaxed font-normal"
              />
            </div>
          </div>

          <NextStepCue {...NEXT_STEP_CUES[6]} />

          {/* Navigation */}
          <div className="flex justify-between items-center gap-3">
            <Button variant="secondary" onClick={onPrev}>
              Back: CBD Priorities
            </Button>
            <Button variant="primary" onClick={onNext}>
              Next: Results &amp; Implementation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
