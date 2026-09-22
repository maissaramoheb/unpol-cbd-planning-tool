import React, { useState } from 'react';
import { PriorityBrief, CbdCell } from '../types';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
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
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader className="bg-surface-subtle border-b border-border-default py-3 px-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Layers size={14} className="text-institutional" />
                Intervention Diagnostic
              </h4>
            </CardHeader>
            <CardBody className="flex flex-col max-h-[500px] overflow-y-auto">
              <span className="text-[11px] text-text-muted pb-1">
                Indicative ranking from prototype planning heuristic (not UN doctrine):
              </span>
              {scoredCells.length === 0 ? (
                <p className="text-xs text-text-muted italic py-2">No matrix intersections configured yet in Step 5.</p>
              ) : (
                <div className="divide-y divide-border-default">
                  {scoredCells.map(({ key, score, classification }) => (
                    <div key={key} className="py-2 px-1 text-xs flex flex-col gap-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-text-default line-clamp-1">{key}</span>
                        <span className="font-mono text-[11px] font-semibold text-institutional tabular-nums shrink-0">
                          {score.toFixed(1)}/5
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-text-muted">{classification}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="bg-surface-subtle border-b border-border-default py-3 px-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Manual Implementation Phases</h4>
            </CardHeader>
            <CardBody className="flex flex-col">
              <p className="text-[11px] leading-relaxed text-text-muted pb-2">Assignments recorded in the CBD Matrix. Phases are not generated from indicative scores.</p>
              <div className="divide-y divide-border-default">
                {phaseGroups.map(group => (
                  <div key={group.phase} className="py-2.5 px-1">
                    <div className="mb-1.5 flex items-center justify-between">
                      <strong className="text-xs font-semibold text-text-default">{group.phase === 'UNASSIGNED' ? 'NOT ASSIGNED' : group.phase}</strong>
                      <Badge variant="slate">{group.cells.length}</Badge>
                    </div>
                    {group.cells.length ? (
                      <ul className="space-y-1 text-[11px] text-text-muted">
                        {group.cells.map(item => <li key={item.key}>• {item.key}</li>)}
                      </ul>
                    ) : (
                      <p className="text-[11px] italic text-text-muted">No interventions assigned.</p>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Input Lists */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="bg-surface-subtle border-b border-border-default py-3 px-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Formulate Strategic Sequencing Groups</h4>
            </CardHeader>
            <CardBody className="flex flex-col gap-5">
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
                  <div key={field} className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-text-default uppercase tracking-wider block">
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newItem[field]}
                        onChange={(e) => setNewItem({ ...newItem, [field]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddListItem(field)}
                        placeholder={placeholder}
                        className="flex-1 h-9 px-3 border border-border-default rounded-md text-xs bg-surface-raised text-text-default focus:outline-none focus:ring-2 focus:ring-focus-ring"
                      />
                      <Button variant="secondary" size="sm" onClick={() => handleAddListItem(field)} aria-label={`Add to ${label}`} className="h-9 px-3">
                        <Plus size={14} />
                      </Button>
                    </div>
                    {list.length > 0 && (
                      <ul className="flex flex-col divide-y divide-border-default pt-1">
                        {list.map((item, idx) => (
                          <li key={idx} className="flex items-start justify-between gap-3 text-xs text-text-default leading-relaxed py-1.5 px-1">
                            <span>• {item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveListItem(field, idx)}
                              aria-label={`Remove ${item}`}
                              className="text-text-muted hover:text-action-danger transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              {/* Sequencing Guidelines Textarea */}
              <div className="flex flex-col gap-1.5 pt-4 border-t border-border-default">
                <TextArea
                  label="Recommended Sequencing Narrative"
                  value={brief.sequencingRecommendation}
                  onChange={(e) => handleFieldChange('sequencingRecommendation', e.target.value)}
                  placeholder="Describe the sequential narrative pathway (e.g. Build trust through Quick Wins first, then leverage this to address administrative SOPs, and finally legal reforms...)"
                  rows={4}
                />
              </div>
            </CardBody>
          </Card>

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
