import React, { useState } from 'react';
import { PriorityBrief, CbdCell } from '../types';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { calculatePriorityScore, classifyPriority } from '../lib/scoring';
import { Plus, Trash2, Layers } from 'lucide-react';

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
    const inputs = {
      impact: cell.priorityScore,
      urgency: cell.priorityScore,
      feasibility: 4, // base assumption
      risk: cell.confidence > 3 ? 2 : 4, // proxy risk based on confidence
      stakeholderSupport: 4,
      mandateRelevance: 4,
      confidenceLevel: cell.confidence
    };
    const score = calculatePriorityScore(inputs);
    const classification = classifyPriority(inputs);
    return { key, cell, score, classification };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-6">
      {/* Introduction */}
      <div>
        <h3 className="text-lg font-bold text-slate-950">5. Priority Setting & Sequencing</h3>
        <p className="text-sm text-slate-500 mt-1">
          Review scored matrix interventions, define sequencing groups, and list top strategic objectives.
        </p>
      </div>

      {/* Prioritization Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader className="bg-slate-900 text-white">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-blue-400" />
                Intervention Dashboard
              </h4>
            </CardHeader>
            <CardBody className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
              <span className="text-[11px] text-slate-500">
                Interventions ranked by computed Priority Score:
              </span>
              {scoredCells.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No custom cells configured yet in Step 4. Default priority values will apply.</p>
              ) : (
                scoredCells.map(({ key, score, classification }) => (
                  <div key={key} className="p-3 border border-slate-200 rounded-lg text-xs flex flex-col gap-1.5 bg-slate-50/50">
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-extrabold text-slate-800 line-clamp-1">{key}</span>
                      <Badge variant="blue">{score.toFixed(1)}/5</Badge>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-semibold">{classification}</span>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        {/* Input Lists */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h4 className="text-sm font-bold text-slate-950">Formulate Strategic Sequencing Groups</h4>
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
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newItem[field]}
                        onChange={(e) => setNewItem({ ...newItem, [field]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddListItem(field)}
                        placeholder={placeholder}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <Button variant="outline" size="sm" onClick={() => handleAddListItem(field)}>
                        <Plus size={14} />
                      </Button>
                    </div>
                    {list.length > 0 && (
                      <ul className="flex flex-col gap-1 border border-slate-100 p-2.5 rounded-lg bg-slate-50/50">
                        {list.map((item, idx) => (
                          <li key={idx} className="flex items-start justify-between gap-3 text-xs text-slate-700 leading-relaxed py-0.5">
                            <span>• {item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveListItem(field, idx)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
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
              <div className="flex flex-col gap-1.5 pt-4 border-t border-slate-100">
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

          {/* Navigation */}
          <div className="flex justify-between items-center gap-3">
            <Button variant="outline" onClick={onPrev}>
              Back: CBD Matrix
            </Button>
            <Button variant="primary" onClick={onNext}>
              Next: Export Brief
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
