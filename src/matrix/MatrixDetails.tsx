import React, { useState } from 'react';
import { CbdCell, CbdAxis, PestelsItem, Stakeholder, EvidenceNote } from '../types';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { TextArea } from '../ui/TextArea';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EvidenceLogEditor } from '../components/EvidenceLogEditor';
import { Plus, Trash2, Link, Users } from 'lucide-react';
import { evaluateCbdCell } from '../lib/scoring';

interface MatrixDetailsProps {
  selectedMode: 'cell' | 'dimension' | 'keyArea';
  selectedKey: string;
  rows: CbdAxis[];
  columns: CbdAxis[];
  customCells: Record<string, CbdCell>;
  pestels: Record<string, PestelsItem>;
  stakeholders: Stakeholder[];
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
  onUpdateCell,
  onSelectCellByKey
}) => {
  const [newIndicator, setNewIndicator] = useState('');

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
      result: `More coherent CBD action at the intersection of ${rowId} and ${colId}.`,
      engagement: "Start with the most influential and feasible entry points, then connect technical support to workflow and policy follow-through."
    };
  };

  if (selectedMode === 'dimension') {
    const col = columns.find(c => c.id === selectedKey);
    if (!col) return null;

    return (
      <Card>
        <CardHeader className="bg-blue-600 text-white rounded-t-xl">
          <span className="text-[10px] uppercase font-extrabold tracking-wider block text-blue-200">Dimension Analysis</span>
          <h3 className="text-base font-extrabold">{col.name}</h3>
          <p className="text-xs text-blue-100 mt-1">{col.definition}</p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            How this dimension manifests across Key Areas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rows.map((row) => {
              const data = getCellData(row.id, col.id);
              return (
                <button
                  key={row.id}
                  onClick={() => onSelectCellByKey(`${row.id}|${col.id}`)}
                  className="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/10 transition-all flex flex-col gap-2"
                >
                  <span className="font-extrabold text-xs text-slate-800 uppercase tracking-tight">{row.name}</span>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{data.why}</p>
                  <span className="text-[10px] text-blue-600 font-bold self-end mt-1">Configure &rarr;</span>
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
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <span className="text-[10px] uppercase font-extrabold tracking-wider block text-slate-400">Key Area Analysis</span>
          <h3 className="text-base font-extrabold">{row.name}</h3>
          <p className="text-xs text-slate-400 mt-1">{row.definition}</p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            How this Key Area is shaped by Dimensions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.map((col) => {
              const data = getCellData(row.id, col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => onSelectCellByKey(`${row.id}|${col.id}`)}
                  className="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/10 transition-all flex flex-col gap-2"
                >
                  <span className="font-extrabold text-xs text-slate-800 uppercase tracking-tight">{col.name}</span>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{data.why}</p>
                  <span className="text-[10px] text-blue-600 font-bold self-end mt-1">Configure &rarr;</span>
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

  const handleCellChange = (field: keyof CbdCell, value: string | string[] | number | EvidenceNote[]) => {
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

  const handleAddIndicator = () => {
    if (!newIndicator.trim()) return;
    const current = activeCell.indicators || [];
    handleCellChange('indicators', [...current, newIndicator.trim()]);
    setNewIndicator('');
  };

  const handleRemoveIndicator = (idx: number) => {
    const current = activeCell.indicators || [];
    handleCellChange('indicators', current.filter((_, i) => i !== idx));
  };

  return (
    <Card>
      <CardHeader className="bg-slate-900 text-white rounded-t-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[9px] uppercase font-extrabold tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded mr-2">
            Viewing Intersection Cell
          </span>
          <h3 className="text-base font-extrabold mt-1">
            {rowId} <span className="text-blue-400">&times;</span> {colId}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={activeAssessment.score >= 4 ? 'rose' : 'slate'}>
            Computed Priority: {activeAssessment.score.toFixed(1)}/5
          </Badge>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        {/* Why matters */}
        <TextArea
          label="Why this intersection matters for SSR / CBD"
          value={activeCell.why}
          onChange={(e) => handleCellChange('why', e.target.value)}
          placeholder="Explain the theoretical and operational importance..."
          rows={2}
        />

        {/* 3 Action Levels */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Intervention Examples across the 3 Levels
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextArea
              label="Individual Level (Skills / Mentoring)"
              value={activeCell.individual}
              onChange={(e) => handleCellChange('individual', e.target.value)}
              rows={3}
            />
            <TextArea
              label="Organizational Level (SOPs / Systems)"
              value={activeCell.organizational}
              onChange={(e) => handleCellChange('organizational', e.target.value)}
              rows={3}
            />
            <TextArea
              label="Enabling Environment (Law / Oversight)"
              value={activeCell.environment}
              onChange={(e) => handleCellChange('environment', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Indicators */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            CBD Assessment Indicators
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newIndicator}
              onChange={(e) => setNewIndicator(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddIndicator()}
              placeholder="Add verifiable indicator..."
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <Button variant="outline" size="sm" onClick={handleAddIndicator}>
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
                <span>{indicator}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveIndicator(idx)}
                  className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                >
                  <Trash2 size={10} />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <Slider
            label="Priority Score"
            value={activeCell.priorityScore}
            onChange={(v) => handleCellChange('priorityScore', v)}
            minLabel="Optional"
            maxLabel="Critical Path"
          />
          <Slider
            label="Confidence Level"
            value={activeCell.confidence}
            onChange={(v) => handleCellChange('confidence', v)}
            minLabel="Assumption"
            maxLabel="Evidence-Based"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <Slider
            label="Feasibility"
            value={activeCell.feasibility !== undefined ? activeCell.feasibility : 3}
            onChange={(v) => handleCellChange('feasibility', v)}
            minLabel="Low Feasibility"
            maxLabel="High Feasibility"
          />
          <Slider
            label="Risk Exposure"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
          {/* Linked PESTEL-S Drivers */}
          <div>
            <span className="font-extrabold text-slate-700 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Link size={14} className="text-blue-500" />
              Link PESTEL-S Contextual Drivers
            </span>
            <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto border border-slate-100 p-2.5 rounded-lg bg-slate-50/50">
              {Object.keys(pestels).map(key => {
                const p = pestels[key];
                const checked = activeCell.drivers?.includes(key);
                return (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCheckboxToggle('drivers', key)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="line-clamp-1">{p.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Linked Stakeholders */}
          <div>
            <span className="font-extrabold text-slate-700 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-teal-500" />
              Link Advisory Stakeholders
            </span>
            <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto border border-slate-100 p-2.5 rounded-lg bg-slate-50/50">
              {stakeholders.map(s => {
                const checked = activeCell.stakeholders?.includes(s.id);
                return (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCheckboxToggle('stakeholders', s.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
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
