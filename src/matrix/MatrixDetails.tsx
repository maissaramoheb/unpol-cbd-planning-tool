import React, { useId, useState } from 'react';
import { CbdCell, CbdAxis, PestelsItem, Stakeholder, EvidenceNote, StrategicOption, PlanningIndicator } from '../types';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { TextArea } from '../ui/TextArea';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EvidenceLogEditor } from '../components/EvidenceLogEditor';
import { Plus, Trash2, Link, Users } from 'lucide-react';
import { evaluateCbdCell } from '../lib/scoring';
import { FieldGuidance } from '../components/Guidance';
import { FIELD_GUIDANCE } from '../lib/guidance';
import { createIndicator, indicatorText, structuredIndicators } from '../lib/resultsPlanning';

interface MatrixDetailsProps {
  selectedMode: 'cell' | 'dimension' | 'keyArea';
  selectedKey: string;
  rows: CbdAxis[];
  columns: CbdAxis[];
  customCells: Record<string, CbdCell>;
  pestels: Record<string, PestelsItem>;
  stakeholders: Stakeholder[];
  strategicOptions: StrategicOption[];
  onUpdateCell: (key: string, cell: CbdCell) => void;
  onSelectCellByKey: (key: string) => void;
}

export const MatrixDetails: React.FC<MatrixDetailsProps> = ({
  selectedMode,
  selectedKey,
  rows,
  columns,
  customCells,
  pestels,
  stakeholders,
  strategicOptions,
  onUpdateCell,
  onSelectCellByKey
}) => {
  const [newIndicator, setNewIndicator] = useState('');
  const leadHelpId = useId();
  const phaseHelpId = useId();
  const supportingHelpId = useId();
  const indicatorHelpId = useId();

  // Helper to fetch cell content (supporting fallback logic)
  const getCellData = (rowId: string, colId: string): CbdCell => {
    const key = `${rowId}|${colId}`;
    if (customCells[key]) return customCells[key];

    // Fallback logic
    const linkedDrivers = Object.keys(pestels).filter(k => {
      const item = pestels[k];
      return item.cbdAreas.includes(rowId) || item.dimensions.includes(colId);
    }).slice(0, 3);

    const linkedStakeholders = stakeholders.filter(s => {
      return s.cbdAreas.includes(rowId) || s.cbdAreas.includes("All key areas");
    }).slice(0, 4).map(s => s.id);

    return {
      key,
      why: `${rowId} × ${colId} matters because this intersection shows how UNPOL can translate broad reform intent into targeted support that reflects both operational reality and cross-cutting obligations.`,
      individual: `At individual level, support focuses on practical conduct, competence, and decision-making relevant to ${rowId.toLowerCase()} through the lens of ${colId.toLowerCase()}.`,
      organizational: `At organizational level, support focuses on workflows, supervision, standardization, and institutional routines that make this intersection sustainable.`,
      environment: `At enabling-environment level, support focuses on law, policy, oversight, coordination, and external conditions that affect whether change can hold.`,
      indicators: [
        "Clearer procedural consistency",
        "Improved supervisory or institutional follow-up",
        "Better linkage between policy intent and daily practice"
      ],
      drivers: linkedDrivers,
      stakeholders: linkedStakeholders,
      risks: "Weak counterpart ownership and competing administrative priorities may delay progress.",
      sequencing: "Conduct basic process mapping before drafting standard operating procedures.",
      confidence: 3,
      priorityScore: 3,
      impact: 3,
      urgency: 3,
      feasibility: 3,
      riskRating: 3,
      stakeholderSupport: 3,
      mandateRelevance: 3,
      result: `More coherent CBD action at the intersection of ${rowId} and ${colId}.`,
      engagement: "Start with the most influential and feasible entry points, then connect technical support to workflow and policy follow-through.",
      capacityProblem: '',
      planningObjective: '',
      leadStakeholderId: null,
      supportingStakeholderIds: [],
      implementationPhase: null,
      milestoneTimeframe: '',
      strategicOptionIds: []
    };
  };

  if (selectedMode === 'dimension') {
    const col = columns.find(c => c.id === selectedKey);
    if (!col) return null;

    return (
      <Card>
        <CardHeader className="border-b border-border-default bg-surface-subtle p-4 rounded-t-lg">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-institutional bg-institutional-subtle border border-institutional/20 px-2 py-0.5 rounded-md inline-block mb-1">
            Analytical Lens
          </span>
          <h3 className="text-base font-bold text-text-default">{col.name}</h3>
          <p className="text-xs text-text-muted mt-1">{col.definition}</p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <h4 className="text-xs font-semibold text-text-default uppercase tracking-wider">
            How this dimension manifests across Key Areas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rows.map((row) => {
              const data = getCellData(row.id, col.id);
              return (
                <button
                  key={row.id}
                  onClick={() => onSelectCellByKey(`${row.id}|${col.id}`)}
                  className="text-left p-3.5 rounded-md border border-border-default bg-surface-card hover:bg-surface-subtle transition-colors duration-150 motion-reduce:transition-none flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <span className="font-semibold text-xs text-text-default uppercase tracking-tight">{row.name}</span>
                  <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">{data.why}</p>
                  <span className="text-[11px] text-institutional font-semibold self-end mt-1">Configure &rarr;</span>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (selectedMode === 'keyArea') {
    const row = rows.find(r => r.id === selectedKey);
    if (!row) return null;

    return (
      <Card>
        <CardHeader className="border-b border-border-default bg-surface-subtle p-4 rounded-t-lg">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-institutional bg-institutional-subtle border border-institutional/20 px-2 py-0.5 rounded-md inline-block mb-1">
            Key Area Analysis
          </span>
          <h3 className="text-base font-bold text-text-default">{row.name}</h3>
          <p className="text-xs text-text-muted mt-1">{row.definition}</p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <h4 className="text-xs font-semibold text-text-default uppercase tracking-wider">
            How this Key Area is examined through each analytical lens
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {columns.map((col) => {
              const data = getCellData(row.id, col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => onSelectCellByKey(`${row.id}|${col.id}`)}
                  className="text-left p-3.5 rounded-md border border-border-default bg-surface-card hover:bg-surface-subtle transition-colors duration-150 motion-reduce:transition-none flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <span className="font-semibold text-xs text-text-default uppercase tracking-tight">{col.name}</span>
                  <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">{data.why}</p>
                  <span className="text-[11px] text-institutional font-semibold self-end mt-1">Configure &rarr;</span>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Cell Mode
  const [rowId, colId] = selectedKey.split('|');
  const activeCell = getCellData(rowId, colId);
  const activeAssessment = evaluateCbdCell(activeCell);

  const handleCellChange = (field: keyof CbdCell, value: string | string[] | number | EvidenceNote[] | PlanningIndicator[]) => {
    onUpdateCell(`${rowId}|${colId}`, {
      ...activeCell,
      [field]: value
    } as CbdCell);
  };

  const handleCheckboxToggle = (field: 'drivers' | 'stakeholders', itemId: string) => {
    const activeCell = getCellData(rowId, colId);
    const list = activeCell[field] || [];
    const nextList = list.includes(itemId)
      ? list.filter(id => id !== itemId)
      : [...list, itemId];
    handleCellChange(field, nextList);
  };

  const handleSupportingStakeholderToggle = (stakeholderId: string) => {
    const current = activeCell.supportingStakeholderIds || [];
    handleCellChange(
      'supportingStakeholderIds',
      current.includes(stakeholderId)
        ? current.filter(id => id !== stakeholderId)
        : [...current, stakeholderId]
    );
  };

  const handleAddIndicator = () => {
    if (!newIndicator.trim()) return;
    const current = structuredIndicators(activeCell);
    handleCellChange('indicators', [...current, createIndicator(crypto.randomUUID(), newIndicator.trim())]);
    setNewIndicator('');
  };

  const handleRemoveIndicator = (idx: number) => {
    const current = structuredIndicators(activeCell);
    handleCellChange('indicators', current.filter((_, i) => i !== idx));
  };

  return (
    <Card>
      <CardHeader className="border-b border-border-default bg-surface-subtle px-5 py-4 rounded-t-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-institutional bg-institutional-subtle border border-institutional/20 px-2 py-0.5 rounded-md">
              Active Intersection Inspector
            </span>
            {customCells[`${rowId}|${colId}`] && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Customized
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-text-default mt-1.5">
            {rowId} <span className="text-text-muted font-normal mx-1">&times;</span> {colId}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <Badge variant={activeAssessment.score >= 4 ? 'rose' : activeAssessment.score >= 3 ? 'amber' : 'slate'}>
                Indicative Priority: {activeAssessment.score.toFixed(1)}/5
              </Badge>
              {activeAssessment.classification && activeAssessment.classification !== 'Standard Priority' && (
                <Badge variant={
                  activeAssessment.classification === 'Quick Win' ? 'green' :
                  activeAssessment.classification === 'Sensitive Reform' ? 'rose' :
                  'blue'
                }>
                  {activeAssessment.classification}
                </Badge>
              )}
            </div>
            <p className="mt-1 max-w-xs text-[11px] leading-snug text-text-muted">{FIELD_GUIDANCE.indicativeScore.help}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-default">Planning Basis</h4>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">Link strategic options that inform this priority. The links do not populate or determine the CBD response.</p>
          </div>
          <fieldset className="rounded-lg border border-border-default bg-surface-subtle/50 p-3.5">
            <legend className="px-1 text-xs font-semibold text-text-default">Strategic Synthesis Basis</legend>
            {strategicOptions.length ? <div className="grid gap-2 sm:grid-cols-2">
              {strategicOptions.map(option => {
                const checked = (activeCell.strategicOptionIds || []).includes(option.id);
                return <label key={option.id} className={`flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-xs ${checked ? 'border-institutional bg-institutional-subtle text-text-default font-medium' : 'border-border-default bg-surface-card text-text-muted hover:text-text-default'}`}>
                  <input type="checkbox" checked={checked} onChange={() => handleCellChange('strategicOptionIds', checked ? (activeCell.strategicOptionIds ?? []).filter(id => id !== option.id) : [...(activeCell.strategicOptionIds ?? []), option.id])} className="mt-0.5 h-3.5 w-3.5 rounded border-border-default text-institutional focus:ring-focus-ring" />
                  <span><strong className="block text-text-default">{option.reference} · {option.type}</strong><span className="mt-0.5 block line-clamp-2">{option.option || 'Strategic option wording not yet recorded.'}</span></span>
                </label>;
              })}
            </div> : <p className="text-xs text-text-muted">No Strategic Options recorded. You may continue without Analysis Synthesis.</p>}
          </fieldset>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-default">Planning Logic</h4>
          <TextArea
            label="Capacity Problem / Gap"
            value={activeCell.capacityProblem || ''}
            onChange={(e) => handleCellChange('capacityProblem', e.target.value)}
            placeholder="What institutional or individual capacity problem needs to change?"
            rows={3}
          />
          <FieldGuidance {...FIELD_GUIDANCE.capacityProblem} />
          <TextArea
            label="Planning Objective / Intended Result"
            value={activeCell.planningObjective || ''}
            onChange={(e) => handleCellChange('planningObjective', e.target.value)}
            placeholder="State the intended, context-specific change."
            rows={2}
          />
          <FieldGuidance {...FIELD_GUIDANCE.planningObjective} />
        </div>

        <h4 className="border-t border-border-default pt-4 text-xs font-semibold uppercase tracking-wider text-text-default">Intervention Package</h4>
        <TextArea
          label="Why this intersection matters for SSR / CBD"
          value={activeCell.why}
          onChange={(e) => handleCellChange('why', e.target.value)}
          placeholder="Explain the theoretical and operational importance..."
          rows={2}
        />

        {/* 3 Action Levels */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
            Intervention Examples across the 3 Levels
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><TextArea label="Individual Level (Skills / Mentoring)" value={activeCell.individual} onChange={(e) => handleCellChange('individual', e.target.value)} rows={3} /><FieldGuidance {...FIELD_GUIDANCE.individual} /></div>
            <div><TextArea label="Organizational Level (SOPs / Systems)" value={activeCell.organizational} onChange={(e) => handleCellChange('organizational', e.target.value)} rows={3} /><FieldGuidance {...FIELD_GUIDANCE.organizational} /></div>
            <div><TextArea label="Enabling Environment (Law / Oversight)" value={activeCell.environment} onChange={(e) => handleCellChange('environment', e.target.value)} rows={3} /><FieldGuidance {...FIELD_GUIDANCE.enablingEnvironment} /></div>
          </div>
        </div>

        <div className="border-t border-border-default pt-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-default">Implementation</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-secondary">
              Lead Stakeholder / Actor
              <select
                aria-describedby={leadHelpId}
                value={activeCell.leadStakeholderId || ''}
                onChange={(e) => onUpdateCell(`${rowId}|${colId}`, {
                  ...activeCell,
                  leadStakeholderId: e.target.value || null,
                  supportingStakeholderIds: (activeCell.supportingStakeholderIds || []).filter(id => id !== e.target.value)
                })}
                className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-xs font-normal text-text-default focus:outline-none focus:ring-2 focus:ring-focus-ring"
              >
                <option value="">Not assigned</option>
                {stakeholders.map(stakeholder => <option key={stakeholder.id} value={stakeholder.id}>{stakeholder.name}</option>)}
              </select>
              <span id={leadHelpId} className="font-normal leading-relaxed text-text-muted">{FIELD_GUIDANCE.leadActor.help}</span>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-secondary">
              Implementation Phase
              <select
                aria-describedby={phaseHelpId}
                value={activeCell.implementationPhase || ''}
                onChange={(e) => handleCellChange('implementationPhase', e.target.value)}
                className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-xs font-normal text-text-default focus:outline-none focus:ring-2 focus:ring-focus-ring"
              >
                <option value="">Not assigned</option>
                <option value="NOW">NOW</option><option value="NEXT">NEXT</option><option value="LATER">LATER</option>
              </select>
              <span id={phaseHelpId} className="font-normal leading-relaxed text-text-muted">{FIELD_GUIDANCE.implementationPhase.help}</span>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-text-secondary">
              Milestone / Timeframe
              <input
                value={activeCell.milestoneTimeframe || ''}
                onChange={(e) => handleCellChange('milestoneTimeframe', e.target.value)}
                placeholder="e.g. Pilot review after 90 days"
                className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-xs font-normal text-text-default focus:outline-none focus:ring-2 focus:ring-focus-ring"
              />
            </label>
          </div>
          <div className="mt-4">
            <span className="mb-1 block text-xs font-semibold text-text-secondary">Supporting Stakeholders / Actors</span>
            <p id={supportingHelpId} className="mb-2 text-xs leading-relaxed text-text-muted">{FIELD_GUIDANCE.supportingActors.help}</p>
            <div aria-describedby={supportingHelpId} className="grid max-h-[160px] grid-cols-1 gap-1.5 overflow-y-auto rounded-md border border-border-default bg-surface-subtle p-2.5 md:grid-cols-2">
              {stakeholders.filter(stakeholder => stakeholder.id !== activeCell.leadStakeholderId).map(stakeholder => (
                <label key={stakeholder.id} className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary hover:text-text-default">
                  <input type="checkbox" checked={(activeCell.supportingStakeholderIds || []).includes(stakeholder.id)} onChange={() => handleSupportingStakeholderToggle(stakeholder.id)} className="h-3.5 w-3.5 rounded border-border-default text-institutional focus:ring-focus-ring" />
                  <span>{stakeholder.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="pt-2 border-t border-border-default">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-default">Monitoring</h4>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
            CBD Assessment Indicators
          </label>
          <div id={indicatorHelpId} className="mb-2"><FieldGuidance {...FIELD_GUIDANCE.indicator} /></div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newIndicator}
              onChange={(e) => setNewIndicator(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddIndicator()}
              placeholder="Add verifiable indicator..."
              aria-describedby={indicatorHelpId}
              className="flex-1 px-3 py-1.5 border border-border-default rounded-md text-xs bg-surface-raised text-text-default focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
            <Button variant="secondary" size="sm" onClick={handleAddIndicator}>
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeCell.indicators?.map((indicator, idx) => (
              <Badge
                key={idx}
                variant="slate"
                className="pl-2.5 pr-1 py-1 flex items-center gap-1.5 text-[11px]"
              >
                <span>{indicatorText(indicator)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveIndicator(idx)}
                  aria-label={`Remove indicator ${idx + 1}`}
                  className="p-0.5 rounded-full hover:bg-surface-hover text-text-muted hover:text-action-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  <Trash2 size={11} />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <h4 className="border-t border-border-default pt-4 text-xs font-semibold uppercase tracking-wider text-text-default">Evidence &amp; Assessment</h4>
        {/* Sliders */}
        <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3 text-xs leading-relaxed text-amber-950">
          <strong>Prototype planning heuristic — not UN doctrine.</strong> This indicative score supports discussion; it is not objective and does not replace mandate review, evidence, consultation, or professional judgement. Confidence qualifies the assessment but does not increase the score.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border-default">
          <Slider
            label="Impact"
            value={activeCell.impact ?? activeCell.priorityScore}
            onChange={(v) => handleCellChange('impact', v)}
            minLabel="Limited"
            maxLabel="Major"
          />
          <Slider
            label="Urgency"
            value={activeCell.urgency ?? 3}
            onChange={(v) => handleCellChange('urgency', v)}
            minLabel="Can Wait"
            maxLabel="Immediate"
          />
          <Slider
            label="Mandate Relevance"
            value={activeCell.mandateRelevance ?? 3}
            onChange={(v) => handleCellChange('mandateRelevance', v)}
            minLabel="Indirect"
            maxLabel="Direct"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-border-default">
          <Slider
            label="Confidence Level"
            value={activeCell.confidence}
            onChange={(v) => handleCellChange('confidence', v)}
            minLabel="Assumption"
            maxLabel="Evidence-Based"
            helperText={FIELD_GUIDANCE.evidenceConfidence.help}
          />
          <Slider
            label="Feasibility"
            value={activeCell.feasibility !== undefined ? activeCell.feasibility : 3}
            onChange={(v) => handleCellChange('feasibility', v)}
            minLabel="Low Feasibility"
            maxLabel="High Feasibility"
          />
          <Slider
            label="Implementation Risk"
            value={activeCell.riskRating !== undefined ? activeCell.riskRating : 3}
            onChange={(v) => handleCellChange('riskRating', v)}
            minLabel="Low Risk"
            maxLabel="High Risk"
          />
          <Slider
            label="Stakeholder Support"
            value={activeCell.stakeholderSupport !== undefined ? activeCell.stakeholderSupport : 3}
            onChange={(v) => handleCellChange('stakeholderSupport', v)}
            minLabel="Low Support"
            maxLabel="High Support"
          />
        </div>

        {/* Risks & Sequencing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border-default">
          <TextArea
            label="Risks & Blockages"
            value={activeCell.risks}
            onChange={(e) => handleCellChange('risks', e.target.value)}
            placeholder="e.g. Host-state command resistance..."
            rows={2}
          />
          <TextArea
            label="Sequencing / Implementation Notes"
            value={activeCell.sequencing}
            onChange={(e) => handleCellChange('sequencing', e.target.value)}
            placeholder="e.g. Conduct process mapping before drafting SOPs..."
            rows={2}
          />
        </div>

        {/* Checkbox Groups: Drivers & Stakeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-default text-xs">
          {/* Linked PESTEL-S Drivers */}
          <div>
            <span className="font-semibold text-text-secondary block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Link size={14} className="text-institutional" />
              Link PESTEL-S Contextual Drivers
            </span>
            <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto border border-border-default p-2.5 rounded-md bg-surface-subtle">
              {Object.keys(pestels).map(key => {
                const p = pestels[key];
                const checked = activeCell.drivers?.includes(key);
                return (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-default">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCheckboxToggle('drivers', key)}
                      className="rounded border-border-default text-institutional focus:ring-focus-ring w-3.5 h-3.5"
                    />
                    <span className="line-clamp-1">{p.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Linked Stakeholders */}
          <div>
            <span className="font-semibold text-text-secondary block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-institutional" />
              Link Advisory Stakeholders
            </span>
            <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto border border-border-default p-2.5 rounded-md bg-surface-subtle">
              {stakeholders.map(s => {
                const checked = activeCell.stakeholders?.includes(s.id);
                return (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-default">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCheckboxToggle('stakeholders', s.id)}
                      className="rounded border-border-default text-institutional focus:ring-focus-ring w-3.5 h-3.5"
                    />
                    <span className="line-clamp-1">{s.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <EvidenceLogEditor
          notes={activeCell.evidenceNotes || []}
          onChange={(newNotes) => handleCellChange('evidenceNotes', newNotes)}
        />
      </CardBody>
    </Card>
  );
};
