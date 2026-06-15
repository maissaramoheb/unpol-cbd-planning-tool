import React, { useState } from 'react';
import { PestelsItem, PestelsRating } from '../types';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { TextArea } from '../ui/TextArea';
import { Badge } from '../ui/Badge';
import { EvidenceLogEditor } from './EvidenceLogEditor';
import { Activity, ShieldAlert, Award, Compass, Eye, AlertCircle } from 'lucide-react';

interface SituationalAnalysisProps {
  pestels: Record<string, PestelsItem>;
  onChange: (id: string, item: PestelsItem) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const SituationalAnalysis: React.FC<SituationalAnalysisProps> = ({
  pestels,
  onChange,
  onNext,
  onPrev
}) => {
  const [selectedId, setSelectedId] = useState<string>('political');
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
    switch (id) {
      case 'political': return <Compass size={16} className="text-blue-500" />;
      case 'economic': return <Activity size={16} className="text-indigo-500" />;
      case 'social': return <Award size={16} className="text-emerald-500" />;
      case 'technological': return <Eye size={16} className="text-teal-500" />;
      case 'environmental': return <Compass size={16} className="text-amber-500" />;
      case 'legal': return <ShieldAlert size={16} className="text-purple-500" />;
      case 'security': return <ShieldAlert size={16} className="text-rose-500" />;
      default: return <Compass size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* PESTEL-S List */}
      <div className="lg:col-span-1 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950">2. PESTEL-S Situational Analysis</h3>
          <p className="text-sm text-slate-500 mt-1">
            Assess environmental factors impacting host-state policing. Select a factor to edit findings and ratings.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {Object.values(pestels).map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`
                  text-left p-3.5 rounded-xl border-2 transition-all flex flex-col gap-2 w-full focus:outline-none
                  ${isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }
                `}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {getPestelsIcon(item.id)}
                    <span className="font-bold text-xs text-slate-900 tracking-tight">
                      {item.name.split(' / ')[0]}
                    </span>
                  </div>
                  <Badge variant={item.rating.impact >= 4 ? 'rose' : 'slate'}>
                    Impact: {item.rating.impact}/5
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {item.finding}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {activeItem ? (
          <>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 text-white rounded-t-xl">
                <div>
                  <div className="flex items-center gap-2">
                    {getPestelsIcon(activeItem.id)}
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-blue-400">
                      {activeItem.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{activeItem.definition}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-xs text-slate-300">
                  <AlertCircle size={14} className="text-amber-400" />
                  <span>Planning Support</span>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
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

                <TextArea
                  label="Suggested sequencing guideline for UNPOL intervention"
                  value={activeItem.sequencing}
                  onChange={(e) => handleFieldChange('sequencing', e.target.value)}
                  placeholder="Describe sequencing, e.g. Do this before training..."
                  rows={2}
                />

                {/* Sliders Grid */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                    Analytical Ratings (1-5 Scale)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                      maxLabel="Verified / Triangulated"
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
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-2">Suggested CBD Intervention Areas</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeItem.cbdAreas.map((area, idx) => (
                        <Badge key={idx} variant="blue">{area}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-2">Activated CBD Dimensions</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeItem.dimensions.map((dim, idx) => (
                        <Badge key={idx} variant="teal">{dim}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <EvidenceLogEditor
                  notes={activeItem.evidenceNotes || []}
                  onChange={(newNotes) => {
                    onChange(activeItem.id, {
                      ...activeItem,
                      evidenceNotes: newNotes
                    });
                  }}
                />
              </CardBody>
            </Card>

            <div className="flex justify-between items-center gap-3">
              <Button variant="outline" onClick={onPrev}>
                Back: Mission Profile
              </Button>
              <Button variant="primary" onClick={onNext}>
                Next: Stakeholder Analysis
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Select a PESTEL-S category to begin.
          </div>
        )}
      </div>
    </div>
  );
};
