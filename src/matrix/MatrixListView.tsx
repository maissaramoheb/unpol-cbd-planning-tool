import React, { useState } from 'react';
import { CbdAxis, CbdCell } from '../types';
import { ChevronDown, ChevronUp, Layers, CheckCircle2 } from 'lucide-react';
import { CbdHeatmapTag, evaluateCbdCell } from '../lib/scoring';

interface MatrixListViewProps {
  rows: CbdAxis[];
  columns: CbdAxis[];
  customCells: Record<string, CbdCell>;
  selectedMode: 'cell' | 'dimension' | 'keyArea';
  selectedKey: string;
  onSelectCell: (rowId: string, colId: string) => void;
  onSelectKeyArea: (rowId: string) => void;
}

export const MatrixListView: React.FC<MatrixListViewProps> = ({
  rows,
  columns,
  customCells,
  selectedMode,
  selectedKey,
  onSelectCell,
  onSelectKeyArea
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(rows[0]?.id || null);

  const toggleRow = (rowId: string) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
    onSelectKeyArea(rowId);
  };

  const hasBespokeContent = (rowId: string, colId: string) => {
    return !!customCells[`${rowId}|${colId}`];
  };

  const isCellSelected = (rowId: string, colId: string) => {
    return selectedMode === 'cell' && selectedKey === `${rowId}|${colId}`;
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
    <div className="flex flex-col gap-3 w-full">
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-900 text-xs flex items-start gap-2">
        <Layers size={16} className="shrink-0 mt-0.5" />
        <p>
          <strong>Mobile Matrix View:</strong> Tap any Key Area to expand, and select an intersection dimension to customize actions.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          const isExpanded = expandedRow === row.id;
          const isRowSelected = selectedMode === 'keyArea' && selectedKey === row.id;

          return (
            <div key={row.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
              {/* Row Header Accordion Trigger */}
              <button
                type="button"
                onClick={() => toggleRow(row.id)}
                className={`
                  w-full px-4 py-3 flex items-center justify-between text-left font-bold text-sm transition-colors
                  ${isRowSelected ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-900 bg-slate-50/50'}
                `}
              >
                <div>
                  <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-extrabold">Key Area</span>
                  <span className="line-clamp-1">{row.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded font-bold">
                    6 Dim
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Dimension Intersections List */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-2 bg-slate-50/20 flex flex-col gap-1.5">
                  {columns.map((col) => {
                    const selected = isCellSelected(row.id, col.id);
                    const custom = hasBespokeContent(row.id, col.id);
                    const tags = getHeatmapTags(row.id, col.id);

                    return (
                      <button
                        key={`${row.id}|${col.id}`}
                        type="button"
                        onClick={() => onSelectCell(row.id, col.id)}
                        className={`
                          w-full p-3 rounded-lg text-left text-xs font-semibold border transition-all flex items-center justify-between
                          ${selected
                            ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm font-bold'
                            : 'border-slate-100 hover:border-slate-200 bg-white text-slate-700'
                          }
                        `}
                      >
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400">Intersection Dimension</span>
                          <span className="font-bold text-slate-900 mt-0.5">{col.name}</span>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {tags.map((tag, idx) => (
                                <span key={idx} className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border tracking-wider leading-none ${tag.bg} ${tag.textCol}`}>
                                  {tag.text}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {custom && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded">
                              <CheckCircle2 size={10} />
                              Custom
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {/* Explore Axis Button */}
                  <button
                    type="button"
                    onClick={() => onSelectKeyArea(row.id)}
                    className="w-full text-center py-2 text-[10px] uppercase tracking-wider font-extrabold text-blue-600 hover:text-blue-800 transition-colors border border-dashed border-blue-200 rounded-lg bg-blue-50/10 mt-1"
                  >
                    Inspect Full Key Area &rarr;
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
