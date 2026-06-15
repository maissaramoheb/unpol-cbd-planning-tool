import React, { useState } from 'react';
import { Stakeholder, StakeholderPosition, EvidenceNote } from '../types';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { TextInput, Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EvidenceLogEditor } from './EvidenceLogEditor';
import { Plus, Trash2, User } from 'lucide-react';

interface StakeholderMappingProps {
  stakeholders: Stakeholder[];
  onAdd: (stakeholder: Stakeholder) => void;
  onUpdate: (stakeholder: Stakeholder) => void;
  onDelete: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const POSITION_OPTIONS = [
  { value: 'Enabler', label: 'Enabler' },
  { value: 'Persuadable', label: 'Persuadable' },
  { value: 'Blocker', label: 'Blocker' },
  { value: 'Spoiler risk', label: 'Spoiler Risk' },
  { value: 'Neutral / unknown', label: 'Neutral / Unknown' }
];

const HML_OPTIONS = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

const CATEGORY_OPTIONS = [
  { value: 'UN Mission', label: 'UN Mission' },
  { value: 'Host State', label: 'Host State' },
  { value: 'Civil Society', label: 'Civil Society' },
  { value: 'External Partners', label: 'External Partners' }
];

const DEFAULT_CBD_AREAS = [
  'Professionalism & Integrity',
  'Administrative Systems',
  'Legal & Policy Framework',
  'Accountability Mechanisms',
  'Stakeholder Engagement'
];

export const StakeholderMapping: React.FC<StakeholderMappingProps> = ({
  stakeholders,
  onAdd,
  onUpdate,
  onDelete,
  onNext,
  onPrev
}) => {
  const [selectedId, setSelectedId] = useState<string>(stakeholders[0]?.id || '');
  const activeStakeholder = stakeholders.find(s => s.id === selectedId);

  const getPositionBadge = (pos: StakeholderPosition) => {
    switch (pos) {
      case 'Enabler': return <Badge variant="green">{pos}</Badge>;
      case 'Persuadable': return <Badge variant="blue">{pos}</Badge>;
      case 'Blocker': return <Badge variant="amber">{pos}</Badge>;
      case 'Spoiler risk': return <Badge variant="rose">{pos}</Badge>;
      default: return <Badge variant="slate">{pos}</Badge>;
    }
  };

  const getMeterColor = (val: string) => {
    switch (val) {
      case 'High': return 'bg-blue-600';
      case 'Medium': return 'bg-amber-500';
      case 'Low': return 'bg-slate-400';
      default: return 'bg-slate-300';
    }
  };

  const getMeterWidth = (val: string) => {
    switch (val) {
      case 'High': return 'w-full';
      case 'Medium': return 'w-3/5';
      case 'Low': return 'w-1/5';
      default: return 'w-0';
    }
  };

  const handleCreateCustom = () => {
    const newId = `sh-custom-${Date.now()}`;
    const newStakeholder: Stakeholder = {
      id: newId,
      name: 'New Custom Stakeholder',
      category: 'Host State',
      role: 'Describe their operational role or mandate...',
      authority: 'Medium',
      influence: 'Medium',
      position: 'Neutral / unknown',
      legitimacy: 'Medium',
      relevance: 'Medium',
      capacity: 'Medium',
      risk: 'Identify risks associated with their opposition or capacities...',
      entry: 'Describe entry points or operational interfaces...',
      engagement: 'Describe recommended communication or advisory style...',
      cbdAreas: ['Professionalism & Integrity'],
      isCustom: true
    };
    onAdd(newStakeholder);
    setSelectedId(newId);
  };

  const handleFieldChange = (field: keyof Stakeholder, value: string | string[] | boolean | EvidenceNote[]) => {
    if (!activeStakeholder) return;
    onUpdate({
      ...activeStakeholder,
      [field]: value
    } as Stakeholder);
  };

  const handleCbdAreaToggle = (area: string) => {
    if (!activeStakeholder) return;
    const current = activeStakeholder.cbdAreas;
    const next = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    handleFieldChange('cbdAreas', next);
  };

  const handleDelete = () => {
    if (!activeStakeholder) return;
    if (confirm(`Are you sure you want to delete "${activeStakeholder.name}"?`)) {
      onDelete(activeStakeholder.id);
      const nextIndex = stakeholders.findIndex(s => s.id === activeStakeholder.id);
      const fallbackIndex = nextIndex === 0 ? 1 : nextIndex - 1;
      setSelectedId(stakeholders[fallbackIndex]?.id || '');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stakeholders Listing */}
      <div className="lg:col-span-1 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-950">3. Stakeholder Analysis</h3>
            <p className="text-xs text-slate-500 mt-0.5">Define key actors and assess their posture toward CBD reform.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCreateCustom} className="shrink-0">
            <Plus size={16} className="mr-1" />
            Add Custom
          </Button>
        </div>

        <div className="flex flex-col gap-2 max-h-[65vh] overflow-y-auto pr-1">
          {stakeholders.map((sh) => {
            const isSelected = sh.id === selectedId;
            return (
              <button
                key={sh.id}
                type="button"
                onClick={() => setSelectedId(sh.id)}
                className={`
                  text-left p-3.5 rounded-xl border transition-colors flex flex-col gap-1.5 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                  ${isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }
                `}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <span className="font-bold text-xs text-slate-900 line-clamp-1 leading-snug">
                    {sh.name}
                  </span>
                  {sh.isCustom && (
                    <span className="text-[9px] font-extrabold uppercase bg-indigo-50 border border-indigo-200 text-indigo-700 px-1 py-0.5 rounded shrink-0">
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 w-full">
                  <span>{sh.category}</span>
                  {getPositionBadge(sh.position)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor & Detail Panel */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {activeStakeholder ? (
          <>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 text-white rounded-t-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-400" />
                    <TextInput
                      value={activeStakeholder.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="bg-transparent border-transparent focus:border-blue-500 text-white p-0 text-md font-bold focus:ring-0 focus:bg-slate-800 focus:px-2 focus:py-1 rounded w-full"
                      placeholder="Stakeholder Name"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Click name to edit. Category: {activeStakeholder.category}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {activeStakeholder.isCustom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="text-rose-400 hover:text-rose-200 hover:bg-rose-950 p-1.5"
                      title="Delete Custom Stakeholder"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Stakeholder Category"
                    value={activeStakeholder.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    options={CATEGORY_OPTIONS}
                  />
                  <Select
                    label="Posture toward reform objectives"
                    value={activeStakeholder.position}
                    onChange={(e) => handleFieldChange('position', e.target.value as StakeholderPosition)}
                    options={POSITION_OPTIONS}
                  />
                </div>

                <TextArea
                  label="Strategic Role / Core Mandate"
                  value={activeStakeholder.role}
                  onChange={(e) => handleFieldChange('role', e.target.value)}
                  placeholder="Describe what this stakeholder does..."
                  rows={2}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Formal Legal Authority"
                    value={activeStakeholder.authority}
                    onChange={(e) => handleFieldChange('authority', e.target.value)}
                    placeholder="e.g. Constitutional, Executive, Traditional..."
                  />
                  <Select
                    label="Real Influence Level"
                    value={activeStakeholder.influence}
                    onChange={(e) => handleFieldChange('influence', e.target.value)}
                    options={HML_OPTIONS}
                  />
                </div>

                {/* Meter Bars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                  {[
                    { label: 'Legitimacy', field: 'legitimacy' as const },
                    { label: 'Relevance', field: 'relevance' as const },
                    { label: 'Capacity', field: 'capacity' as const }
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-1.5">
                      <Select
                        label={item.label}
                        value={activeStakeholder[item.field]}
                        onChange={(e) => handleFieldChange(item.field, e.target.value)}
                        options={HML_OPTIONS}
                        className="py-1 text-xs"
                      />
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${getMeterColor(activeStakeholder[item.field])} ${getMeterWidth(activeStakeholder[item.field])}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <TextArea
                  label="Identified Planning Risks"
                  value={activeStakeholder.risk}
                  onChange={(e) => handleFieldChange('risk', e.target.value)}
                  placeholder="Identify obstruction, interference, or resource issues..."
                  rows={2}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextArea
                    label="UNPOL Entry Point"
                    value={activeStakeholder.entry}
                    onChange={(e) => handleFieldChange('entry', e.target.value)}
                    placeholder="Liaison paths or committees..."
                    rows={2}
                  />
                  <TextArea
                    label="Engagement Strategy / Communication Style"
                    value={activeStakeholder.engagement}
                    onChange={(e) => handleFieldChange('engagement', e.target.value)}
                    placeholder="How to influence, coordinate, or monitor..."
                    rows={2}
                  />
                </div>

                {/* Linked CBD Areas Checkboxes */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Linked CBD Key Intervention Areas
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {DEFAULT_CBD_AREAS.map((area) => {
                      const isChecked = activeStakeholder.cbdAreas.includes(area);
                      return (
                        <label
                          key={area}
                          className={`
                            flex items-center gap-2.5 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors
                            ${isChecked
                              ? 'border-blue-600 bg-blue-50/50 text-blue-800'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCbdAreaToggle(area)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                          />
                          <span>{area}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <EvidenceLogEditor
                  notes={activeStakeholder.evidenceNotes || []}
                  onChange={(newNotes) => {
                    handleFieldChange('evidenceNotes', newNotes);
                  }}
                />
              </CardBody>
            </Card>

            <div className="flex justify-between items-center gap-3">
              <Button variant="outline" onClick={onPrev}>
                Back: Situational Analysis
              </Button>
              <Button variant="primary" onClick={onNext}>
                Next: CBD Matrix
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            No active stakeholder. Select or create one.
          </div>
        )}
      </div>
    </div>
  );
};
