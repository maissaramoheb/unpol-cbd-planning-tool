import React, { useState } from 'react';
import { CbdAxis, CbdCell, PestelsItem, Stakeholder } from '../types';
import { MatrixGrid } from './MatrixGrid';
import { MatrixListView } from './MatrixListView';
import { MatrixDetails } from './MatrixDetails';
import { Button } from '../ui/Button';

interface CBDMatrixProps {
  rows: CbdAxis[];
  columns: CbdAxis[];
  customCells: Record<string, CbdCell>;
  pestels: Record<string, PestelsItem>;
  stakeholders: Stakeholder[];
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
      {/* Introduction */}
      <div>
        <h3 className="text-lg font-bold text-slate-950">4. Interactive UNPOL CBD Matrix</h3>
        <p className="text-sm text-slate-500 mt-1">
          Click cells to customize indicators and actions, or click Row/Column headers to inspect full Key Areas and Dimensions.
        </p>
      </div>

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
          onUpdateCell={onUpdateCell}
          onSelectCellByKey={handleSelectCellByKey}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-3">
        <Button variant="outline" onClick={onPrev}>
          Back: Stakeholder Analysis
        </Button>
        <Button variant="primary" onClick={onNext}>
          Next: Priority & Sequencing
        </Button>
      </div>
    </div>
  );
};
