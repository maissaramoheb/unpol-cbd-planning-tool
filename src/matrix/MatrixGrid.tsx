import React from 'react';
import { CbdAxis, CbdCell } from '../types';
import { CbdHeatmapTag, evaluateCbdCell } from '../lib/scoring';

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

  const getHeatmapTags = (rowId: string, colId: string) => {
    const key = `${rowId}|${colId}`;
    const cell = customCells[key];
    if (!cell) return [];

    return evaluateCbdCell(cell).tags.map((tag) => getTagPresentation(tag));
  };

  const getTagPresentation = (tag: CbdHeatmapTag) => {
    switch (tag) {
      case 'Quick Win':
        return { text: tag, bg: 'bg-emerald-50 border-emerald-200', textCol: 'text-emerald-700' };
      case 'Sensitive Reform':
        return { text: 'Sensitive', bg: 'bg-rose-50 border-rose-200', textCol: 'text-rose-700' };
      case 'Long-Term Reform':
        return { text: 'Long-term', bg: 'bg-indigo-50 border-indigo-200', textCol: 'text-indigo-700' };
      case 'Low Confidence':
        return { text: 'Low Conf', bg: 'bg-slate-50 border-slate-200', textCol: 'text-slate-500' };
      default:
        return { text: tag, bg: 'bg-amber-50 border-amber-200', textCol: 'text-amber-700' };
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="min-w-[980px] grid grid-cols-7 gap-2">
          {/* Corner Cell */}
          <div className="bg-slate-900 rounded-lg p-3 text-center flex flex-col justify-center items-center text-white text-[10px] font-extrabold uppercase tracking-wider h-24">
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
                  h-24 p-2 text-center rounded-lg text-xs font-extrabold transition-all flex flex-col justify-center items-center border-2
                  ${isActive
                    ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                    : 'border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }
                `}
              >
                <span className="uppercase tracking-wider text-[9px] text-slate-500 block mb-1">Dimension</span>
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
                  h-24 p-2 text-left rounded-lg text-xs font-extrabold transition-all flex flex-col justify-center border-2
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
                const tags = getHeatmapTags(row.id, col.id);

                return (
                  <button
                    key={`${row.id}|${col.id}`}
                    onClick={() => onSelectCell(row.id, col.id)}
                    className={`
                      h-24 p-2 rounded-lg text-left transition-all border-2 flex flex-col justify-between relative
                      ${selected
                        ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm scale-[0.98]'
                        : highlighted
                          ? 'border-blue-200 bg-blue-50/20 text-slate-700 hover:bg-blue-50/40'
                          : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600 hover:border-slate-200'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-tight line-clamp-1">
                        {shortColName(col.name)}
                      </span>
                      {custom && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" title="Customized analysis available" />
                      )}
                    </div>
                    
                    <span className="text-[10px] font-black text-slate-900 line-clamp-2 leading-tight flex-1 flex items-center">
                      {shortRowName(row.name)}
                    </span>

                    {/* Heatmap tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 w-full">
                        {tags.map((tag, idx) => (
                          <span key={idx} className={`px-1 py-0.5 rounded text-[7px] font-black uppercase border tracking-wider leading-none shrink-0 ${tag.bg} ${tag.textCol}`}>
                            {tag.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[9px] flex flex-wrap gap-4 items-center justify-center font-extrabold text-slate-500 uppercase tracking-wider">
        <span>Heatmap Legend:</span>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 flex" />
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 flex" />
          <span>Quick Win</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded bg-rose-50 border border-rose-200 flex" />
          <span>Leadership-Sensitive</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded bg-indigo-50 border border-indigo-200 flex" />
          <span>Long-term Reform</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-650">
          <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200 flex" />
          <span>Low Confidence</span>
        </div>
      </div>
    </div>
  );
};
