import React, { useState } from 'react';
import { Stakeholder, StakeholderPosition, EvidenceNote } from '../types';
import { TextInput, Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EvidenceLogEditor } from './EvidenceLogEditor';
import { Plus, Trash2, User, Compass, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { resolvePlanningContext } from '../lib/planningContext';
import { NextStepCue } from './Guidance';
import { StageLead } from './StageLead';
import { NEXT_STEP_CUES } from '../lib/guidance';

interface StakeholderMappingProps {
  stakeholders: Stakeholder[];
  templateId?: string;
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

const POSTURE_DESCRIPTIONS: Record<StakeholderPosition, string> = {
  'Enabler': 'Proactively champions and facilitates CBD modernization and police reform initiatives.',
  'Persuadable': 'Conditionally open to reform; requires targeted engagement, trust-building, or incentives.',
  'Blocker': 'Systematically resists, obstructs, or opposes institutional reform objectives.',
  'Spoiler risk': 'Holds capability and incentive to actively undermine peacebuilding or reform implementation.',
  'Neutral / unknown': 'Posture unconfirmed, uncommitted, or ambiguous at the current planning stage.'
};

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
  templateId,
  onAdd,
  onUpdate,
  onDelete,
  onNext,
  onPrev
}) => {
  const [selectedId, setSelectedId] = useState<string>(stakeholders[0]?.id || '');
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);
  const activeStakeholder = stakeholders.find(s => s.id === selectedId);

  const context = resolvePlanningContext(templateId);
  const candidatePrompts = context?.planningPrompts?.stakeholderPrompts ?? [];
  const candidateCategories = context?.planningPrompts?.suggestedStakeholderCategories ?? [];

  const getPositionBadge = (pos: StakeholderPosition) => {
    switch (pos) {
      case 'Enabler': return <Badge variant="green">{pos}</Badge>;
      case 'Persuadable': return <Badge variant="blue">{pos}</Badge>;
      case 'Blocker': return <Badge variant="amber">{pos}</Badge>;
      case 'Spoiler risk': return <Badge variant="rose">{pos}</Badge>;
      default: return <Badge variant="slate">{pos}</Badge>;
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
    <div className="flex flex-col gap-6">
      <StageLead stage={3} />

      {/* Master-Detail Split Pane */}
      <div className="bg-surface-raised border border-border-strong rounded-lg overflow-hidden flex flex-col lg:flex-row min-h-[640px]">
        {/* Master List Column */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border-default flex flex-col shrink-0 bg-surface-subtle">
          <div className="p-3.5 border-b border-border-default flex items-center justify-between gap-2 bg-surface-raised">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Actors Directory ({stakeholders.length})
              </h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreateCustom}
              className="text-xs py-1 px-2.5 shrink-0"
            >
              <Plus size={14} className="mr-1" />
              Add Actor
            </Button>
          </div>

          {/* Contextual Actors to Verify Drawer */}
          {context && (candidatePrompts.length > 0 || candidateCategories.length > 0) && (
            <div className="border-b border-blue-200 bg-blue-50/50">
              <button
                type="button"
                onClick={() => setIsContextDrawerOpen((prev) => !prev)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-blue-100/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Compass size={14} className="text-blue-700 shrink-0" />
                  <span className="text-xs font-bold text-blue-950 truncate">
                    Contextual Actors to Verify
                  </span>
                  <span className="text-[10px] font-semibold bg-white border border-blue-200 px-1.5 py-0.2 rounded text-blue-800">
                    {context.identity.missionAcronym || context.identity.countryArea}
                  </span>
                </div>
                {isContextDrawerOpen ? (
                  <ChevronUp size={14} className="text-blue-700 shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-blue-700 shrink-0" />
                )}
              </button>

              {isContextDrawerOpen && (
                <div className="p-3 bg-white/95 border-t border-blue-200/80 flex flex-col gap-2.5 text-xs max-h-64 overflow-y-auto">
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    Candidate actors to verify in the field. Adding an actor pre-fills name and category only; ratings and posture start unassessed.
                  </p>

                  {candidatePrompts.map((promptGroup, gIdx) => (
                    <div key={gIdx} className="flex flex-col gap-1.5 border-t border-slate-100 pt-1.5 first:border-t-0 first:pt-0">
                      <span className="font-bold text-slate-800 text-[11px]">{promptGroup.category}</span>
                      {promptGroup.suggestedStakeholders && promptGroup.suggestedStakeholders.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {promptGroup.suggestedStakeholders.map((actorName, aIdx) => {
                            const isAlreadyAdded = stakeholders.some(
                              (s) => s.name.trim().toLowerCase() === actorName.trim().toLowerCase()
                            );
                            return (
                              <div key={aIdx} className="flex items-center justify-between gap-1.5 py-1 px-2 rounded bg-slate-50 border border-slate-200">
                                <span className="text-xs text-slate-800 font-medium truncate">{actorName}</span>
                                {isAlreadyAdded ? (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    <Check size={10} />
                                    Added
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newId = `sh-ctx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
                                      const newStakeholder: Stakeholder = {
                                        id: newId,
                                        name: actorName,
                                        category: promptGroup.category || 'Host State',
                                        role: promptGroup.rolePrompt || 'Suggested for verification in field operations',
                                        authority: 'Medium',
                                        influence: 'Medium',
                                        position: 'Neutral / unknown',
                                        legitimacy: 'Medium',
                                        relevance: 'Medium',
                                        capacity: 'Medium',
                                        risk: '',
                                        entry: '',
                                        engagement: '',
                                        cbdAreas: ['Professionalism & Integrity'],
                                        isCustom: false
                                      };
                                      onAdd(newStakeholder);
                                      setSelectedId(newId);
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-white hover:bg-blue-50 px-2 py-0.5 rounded border border-blue-200 transition-colors shrink-0"
                                  >
                                    <Plus size={10} />
                                    Add
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">{promptGroup.rolePrompt}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto divide-y divide-border-default max-h-[600px] lg:max-h-none">
            {stakeholders.map((sh) => {
              const isSelected = sh.id === selectedId;
              return (
                <button
                  key={sh.id}
                  type="button"
                  onClick={() => setSelectedId(sh.id)}
                  className={`w-full text-left px-4 py-3.5 transition-colors duration-150 motion-reduce:transition-none flex flex-col gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-2 border-action-primary'
                      : 'border-l-2 border-transparent hover:bg-surface-subtle/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 w-full">
                    <span className={`text-xs line-clamp-1 ${isSelected ? 'font-bold text-action-primary' : 'font-semibold text-text-primary'}`}>
                      {sh.name}
                    </span>
                    {sh.isCustom && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-surface-raised border border-border-default text-text-muted px-1.5 py-0.5 rounded shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="truncate text-text-muted font-normal">{sh.category}</span>
                    <div className="shrink-0">{getPositionBadge(sh.position)}</div>
                  </div>
                  <div className="text-[10px] font-mono text-text-muted flex items-center gap-1.5 pt-0.5">
                    <span>Auth: <span className="font-semibold text-text-secondary">{sh.authority || 'N/A'}</span></span>
                    <span className="text-border-strong">·</span>
                    <span>Infl: <span className="font-semibold text-text-secondary">{sh.influence || 'N/A'}</span></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-surface-raised">
          {activeStakeholder ? (
            <div className="flex flex-col">
              {/* Header */}
              <div className="p-4 lg:p-5 border-b border-border-default flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-raised">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-institutional shrink-0" />
                    <input
                      type="text"
                      value={activeStakeholder.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="text-base font-bold text-text-default bg-transparent border-b border-transparent hover:border-border-default focus:border-institutional focus:outline-none w-full transition-colors py-0.5"
                      placeholder="Actor / Stakeholder Name"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
                    <span>{activeStakeholder.category}</span>
                    <span>•</span>
                    {getPositionBadge(activeStakeholder.position)}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {activeStakeholder.isCustom && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      title="Delete Custom Stakeholder"
                      aria-label="Delete Custom Stakeholder"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete Actor
                    </Button>
                  )}
                </div>
              </div>

              {/* Form Content */}
              <div className="p-5 lg:p-6 flex flex-col gap-6">
                {/* Section 1: Identity & Mandate */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    1. Identity &amp; Mandate
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Stakeholder Category"
                      value={activeStakeholder.category}
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                      options={CATEGORY_OPTIONS}
                    />
                    <TextInput
                      label="Formal Legal Authority"
                      value={activeStakeholder.authority}
                      onChange={(e) => handleFieldChange('authority', e.target.value)}
                      placeholder="e.g. Constitutional, Executive, Traditional..."
                    />
                  </div>
                  <TextArea
                    label="Strategic Role / Core Mandate"
                    value={activeStakeholder.role}
                    onChange={(e) => handleFieldChange('role', e.target.value)}
                    placeholder="Describe what this stakeholder does..."
                    rows={2}
                  />
                </div>

                {/* Section 2: Position & Power Assessment */}
                <div className="border-t border-border-default pt-5 flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    2. Position &amp; Power Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Select
                        label="Posture toward reform objectives"
                        value={activeStakeholder.position}
                        onChange={(e) => handleFieldChange('position', e.target.value as StakeholderPosition)}
                        options={POSITION_OPTIONS}
                      />
                      <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">
                        {POSTURE_DESCRIPTIONS[activeStakeholder.position]}
                      </p>
                    </div>
                    <Select
                      label="Real Influence Level"
                      value={activeStakeholder.influence}
                      onChange={(e) => handleFieldChange('influence', e.target.value)}
                      options={HML_OPTIONS}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-subtle p-3.5 rounded-lg border border-border-default">
                    {[
                      { label: 'Legitimacy', field: 'legitimacy' as const },
                      { label: 'Relevance', field: 'relevance' as const },
                      { label: 'Capacity', field: 'capacity' as const }
                    ].map((item) => (
                      <Select
                        key={item.label}
                        label={item.label}
                        value={activeStakeholder[item.field]}
                        onChange={(e) => handleFieldChange(item.field, e.target.value)}
                        options={HML_OPTIONS}
                      />
                    ))}
                  </div>
                </div>

                {/* Section 3: Engagement Strategy */}
                <div className="border-t border-border-default pt-5 flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    3. Engagement Strategy &amp; Risks
                  </h3>
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
                </div>

                {/* Section 4: Key Intervention Areas */}
                <div className="border-t border-border-default pt-5 flex flex-col gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    4. Linked CBD Key Intervention Areas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {DEFAULT_CBD_AREAS.map((area) => {
                      const isChecked = activeStakeholder.cbdAreas.includes(area);
                      return (
                        <label
                          key={area}
                          className={`
                            flex items-center gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition-colors
                            ${isChecked
                              ? 'border-institutional bg-institutional-subtle text-text-default font-medium'
                              : 'border-border-default hover:bg-surface-hover text-text-muted'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCbdAreaToggle(area)}
                            className="rounded border-border-default text-institutional focus:ring-focus-ring w-3.5 h-3.5"
                          />
                          <span>{area}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Section 5: Evidence & Source Notes */}
                <div className="border-t border-border-default pt-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                    5. Evidence &amp; Source Notes
                  </h3>
                  <EvidenceLogEditor
                    notes={activeStakeholder.evidenceNotes || []}
                    onChange={(newNotes) => {
                      handleFieldChange('evidenceNotes', newNotes);
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-text-muted">
              No active stakeholder selected. Add one, or continue to optional Analysis Synthesis.
            </div>
          )}
        </div>
      </div>

      <NextStepCue {...NEXT_STEP_CUES[3]} />
      <div className="flex justify-between items-center gap-3">
        <Button variant="secondary" onClick={onPrev}>
          Back: Diagnostic Analysis
        </Button>
        <Button variant="primary" onClick={onNext}>
          Synthesize the Analysis
        </Button>
      </div>
    </div>
  );
};
