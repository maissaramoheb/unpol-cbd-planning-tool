import React from 'react';
import { CbdAxis, CbdCell } from '../types';

interface MatrixGridProps {
  rows: CbdAxis[];
  columns: CbdAxis[];
  customCells: Record<string, CbdCell>;
  selectedMode: 'cell' | 'dimension' | 'keyArea';
  selectedKey: string;
  onSelectCell: (rowId: string, colId: string) => void;
  onSelectDimension: (colId: string) => void;
  onSelectKeyArea: (rowId: string) => void;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  rows,
  columns,
  customCells,
  selectedMode,
  selectedKey,
  onSelectCell,
  onSelectDimension,
  onSelectKeyArea
}) => {
  const isRowHighlighted = (rowId: string) => {
    if (selectedMode === 'keyArea' && selectedKey === rowId) return true;
    if (selectedMode === 'cell') {
      const [cellRow] = selectedKey.split('|');
      return cellRow === rowId;
    }
    return false;
  };

  const isColHighlighted = (colId: string) => {
    if (selectedMode === 'dimension' && selectedKey === colId) return true;
    if (selectedMode === 'cell') {
      const [, cellCol] = selectedKey.split('|');
      return cellCol === colId;
    }
    return false;
  };

  const isCellSelected = (rowId: string, colId: string) => {
    return selectedMode === 'cell' && selectedKey === `${rowId}|${colId}`;
  };

  const hasBespokeContent = (rowId: string, colId: string) => {
    const key = `${rowId}|${colId}`;
    return !!customCells[key];
  };

  const shortColName = (name: string) => {
    return name
      .replace('Environmental Sustainability', 'Environment')
      .replace('Conflict Prevention', 'Prevention')
      .replace('Protection of Civilians', 'PoC');
  };

  const shortRowName = (name: string) => {
    return name
      .replace('Professionalism & Integrity', 'Professionalism')
      .replace('Administrative Systems', 'Administration')
      .replace('Legal & Policy Framework', 'Legal / Policy')
      .replace('Accountability Mechanisms', 'Accountability')
      .replace('Stakeholder Engagement', 'Stakeholders');
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="min-w-[980px] grid grid-cols-7 gap-2">
        {/* Corner Cell */}
        <div className="bg-slate-900 rounded-lg p-3 text-center flex flex-col justify-center items-center text-white text-[10px] font-extrabold uppercase tracking-wider h-20">
          <span>Dimensions &rarr;</span>
          <span className="mt-1 border-t border-slate-700 pt-1 w-full">Key Areas &darr;</span>
        </div>

        {/* Column Headers */}
        {columns.map((col) => {
          const isActive = selectedMode === 'dimension' && selectedKey === col.id;
          return (
            <button
              key={col.id}
              onClick={() => onSelectDimension(col.id)}
              className={`
                h-20 p-2 text-center rounded-lg text-xs font-extrabold transition-all flex flex-col justify-center items-center border-2
                ${isActive
                  ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                  : 'border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700'
                }
              `}
            >
              <span className="uppercase tracking-wider text-[9px] text-slate-400 block mb-1">Dimension</span>
              <span className="line-clamp-2 leading-tight">{shortColName(col.name)}</span>
            </button>
          );
        })}

        {/* Rows */}
        {rows.map((row) => (
          <React.Fragment key={row.id}>
            {/* Row Header */}
            <button
              onClick={() => onSelectKeyArea(row.id)}
              className={`
                h-20 p-2 text-left rounded-lg text-xs font-extrabold transition-all flex flex-col justify-center border-2
                ${selectedMode === 'keyArea' && selectedKey === row.id
                  ? 'border-slate-800 bg-slate-800 text-white shadow-sm'
                  : 'border-transparent bg-slate-800 text-slate-100 hover:bg-slate-700'
                }
              `}
            >
              <span className="uppercase tracking-wider text-[8px] text-slate-400 block mb-1">Key Area</span>
              <span className="line-clamp-2 leading-tight">{shortRowName(row.name)}</span>
            </button>

            {/* Cells */}
            {columns.map((col) => {
              const selected = isCellSelected(row.id, col.id);
              const highlighted = isRowHighlighted(row.id) || isColHighlighted(col.id);
              const custom = hasBespokeContent(row.id, col.id);

              return (
                <button
                  key={`${row.id}|${col.id}`}
                  onClick={() => onSelectCell(row.id, col.id)}
                  className={`
                    h-20 p-2 rounded-lg text-left transition-all border-2 flex flex-col justify-between relative
                    ${selected
                      ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm scale-[0.98]'
                      : highlighted
                        ? 'border-blue-200 bg-blue-50/20 text-slate-700 hover:bg-blue-50/40'
                        : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600 hover:border-slate-200'
                    }
                  `}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight line-clamp-1">
                      {shortColName(col.name)}
                    </span>
                    {custom && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" title="Customized analysis available" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 line-clamp-2 leading-tight">
                    {shortRowName(row.name)}
                  </span>
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
