import React, { useState } from 'react';
import { CbdAxis, CbdCell, PestelsItem, Stakeholder, StrategicOption } from '../types';
import { MatrixGrid } from './MatrixGrid';
import { MatrixListView } from './MatrixListView';
import { MatrixDetails } from './MatrixDetails';
import { Button } from '../ui/Button';
import { NextStepCue } from '../components/Guidance';
import { StageLead } from '../components/StageLead';
import { NEXT_STEP_CUES } from '../lib/guidance';

interface CBDMatrixProps {
  rows: CbdAxis[];
  columns: CbdAxis[];
  customCells: Record<string, CbdCell>;
  pestels: Record<string, PestelsItem>;
  stakeholders: Stakeholder[];
  strategicOptions: StrategicOption[];
  onUpdateCell: (key: string, cell: CbdCell) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const CBDMatrix: React.FC<CBDMatrixProps> = ({
  rows,
  columns,
  customCells,
  pestels,
  stakeholders,
  strategicOptions,
  onUpdateCell,
  onNext,
  onPrev
}) => {
  const [selectedMode, setSelectedMode] = useState<'cell' | 'dimension' | 'keyArea'>('cell');
  const [selectedKey, setSelectedKey] = useState<string>('Accountability Mechanisms|Human Rights');

  const handleSelectCell = (rowId: string, colId: string) => {
    setSelectedMode('cell');
    setSelectedKey(`${rowId}|${colId}`);
  };

  const handleSelectDimension = (colId: string) => {
    setSelectedMode('dimension');
    setSelectedKey(colId);
  };

  const handleSelectKeyArea = (rowId: string) => {
    setSelectedMode('keyArea');
    setSelectedKey(rowId);
  };

  const handleSelectCellByKey = (key: string) => {
    setSelectedMode('cell');
    setSelectedKey(key);
  };

  return (
    <div className="flex flex-col gap-6">
      <StageLead stage={5} />

      {/* Responsive Grid Containers */}
      <div className="w-full">
        {/* Desktop / Tablet Grid */}
        <div className="hidden md:block">
          <MatrixGrid
            rows={rows}
            columns={columns}
            customCells={customCells}
            selectedMode={selectedMode}
            selectedKey={selectedKey}
            onSelectCell={handleSelectCell}
            onSelectDimension={handleSelectDimension}
            onSelectKeyArea={handleSelectKeyArea}
          />
        </div>

        {/* Mobile Accordion List */}
        <div className="block md:hidden">
          <MatrixListView
            rows={rows}
            columns={columns}
            customCells={customCells}
            selectedMode={selectedMode}
            selectedKey={selectedKey}
            onSelectCell={handleSelectCell}
            onSelectKeyArea={handleSelectKeyArea}
          />
        </div>
      </div>

      {/* Details & Editor Section */}
      <div className="w-full">
        <MatrixDetails
          selectedMode={selectedMode}
          selectedKey={selectedKey}
          rows={rows}
          columns={columns}
          customCells={customCells}
          pestels={pestels}
          stakeholders={stakeholders}
          strategicOptions={strategicOptions}
          onUpdateCell={onUpdateCell}
          onSelectCellByKey={handleSelectCellByKey}
        />
      </div>

      {/* Navigation Buttons */}
      <NextStepCue {...NEXT_STEP_CUES[5]} />
      <div className="flex justify-between items-center gap-3">
        <Button variant="secondary" onClick={onPrev}>
          Back: Analysis Synthesis
        </Button>
        <Button variant="primary" onClick={onNext}>
          Next: Prioritization & Sequencing
        </Button>
      </div>
    </div>
  );
};
