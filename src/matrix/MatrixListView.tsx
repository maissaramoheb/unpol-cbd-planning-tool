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
        return { text: tag, bg: 'bg-emerald-50 border-emerald-200', textCol: 'text-emerald-800', dotCol: 'bg-emerald-600' };
      case 'Sensitive Reform':
        return { text: 'Sensitive', bg: 'bg-rose-50 border-rose-200', textCol: 'text-rose-800', dotCol: 'bg-rose-600' };
      case 'Long-Term Reform':
        return { text: 'Long-term', bg: 'bg-indigo-50 border-indigo-200', textCol: 'text-indigo-800', dotCol: 'bg-indigo-600' };
      case 'Low Confidence':
        return { text: 'Low Conf', bg: 'bg-slate-50 border-slate-200', textCol: 'text-slate-700', dotCol: 'bg-slate-500' };
      default:
        return { text: tag, bg: 'bg-amber-50 border-amber-200', textCol: 'text-amber-800', dotCol: 'bg-amber-600' };
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="bg-institutional-subtle border border-institutional/20 p-3 rounded-md text-text-default text-xs flex items-start gap-2">
        <Layers size={16} className="shrink-0 mt-0.5 text-institutional" />
        <p>
          <strong className="font-semibold text-institutional">Mobile Matrix View:</strong> Tap any Key Area to expand, and select an intersection dimension to customize actions.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          const isExpanded = expandedRow === row.id;
          const isRowSelected = selectedMode === 'keyArea' && selectedKey === row.id;

          return (
            <div key={row.id} className="border border-border-default rounded-md bg-surface-card overflow-hidden shadow-subtle">
              {/* Row Header Accordion Trigger */}
              <button
                type="button"
                onClick={() => toggleRow(row.id)}
                aria-expanded={isExpanded}
                className={`
                  w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-xs transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring
                  ${isRowSelected
                    ? 'bg-institutional-subtle text-institutional border-l-4 border-l-institutional font-bold'
                    : 'hover:bg-surface-hover text-text-default bg-surface-card border-l-2 border-l-institutional/60'
                  }
                `}
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider block text-text-muted font-mono">Key Area</span>
                  <span className="line-clamp-1 text-xs">{row.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-text-muted bg-surface-subtle border border-border-default px-2 py-0.5 rounded-md font-semibold">
                    6 Lenses
                  </span>
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </button>

              {/* Dimension Intersections List */}
              {isExpanded && (
                <div className="border-t border-border-default p-2 bg-surface-subtle/40 flex flex-col gap-1.5">
                  {columns.map((col) => {
                    const selected = isCellSelected(row.id, col.id);
                    const custom = hasBespokeContent(row.id, col.id);
                    const tags = getHeatmapTags(row.id, col.id);

                    return (
                      <button
                        key={`${row.id}|${col.id}`}
                        type="button"
                        onClick={() => onSelectCell(row.id, col.id)}
                        aria-pressed={selected}
                        aria-label={`${row.name} × ${col.name}. ${custom ? 'Customized. ' : ''}${tags.map(t => t.text).join(', ')}`}
                        className={`
                          w-full p-3 rounded-md text-left text-xs font-medium border transition-colors duration-150 motion-reduce:transition-none flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                          ${selected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-1 ring-blue-600 shadow-subtle'
                            : 'border-border-default hover:bg-surface-hover bg-surface-card text-text-default'
                          }
                        `}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted">Analytical Lens</span>
                          <span className="font-semibold text-text-default text-xs">{col.name}</span>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border tracking-wide leading-none shrink-0 ${tag.bg} ${tag.textCol}`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${tag.dotCol}`} />
                                  <span>{tag.text}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {custom && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-institutional bg-institutional-subtle border border-institutional/20 px-2 py-0.5 rounded-md">
                              <CheckCircle2 size={11} />
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
                    className="w-full text-center py-2 text-xs font-semibold text-institutional hover:bg-institutional-subtle/50 transition-colors duration-150 motion-reduce:transition-none border border-dashed border-institutional/30 rounded-md bg-institutional-subtle/20 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
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
