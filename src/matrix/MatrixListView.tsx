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
        return { text: tag, bg: 'bg-status-success-bg border-status-success-border', textCol: 'text-status-success', dotCol: 'bg-status-success' };
      case 'Sensitive Reform':
        return { text: 'Sensitive', bg: 'bg-status-danger-bg border-status-danger-border', textCol: 'text-status-danger', dotCol: 'bg-status-danger' };
      case 'Long-Term Reform':
        return { text: 'Long-term', bg: 'bg-accent-indigo-bg border-accent-indigo-border', textCol: 'text-accent-indigo', dotCol: 'bg-accent-indigo' };
      case 'Low Confidence':
        return { text: 'Low Conf', bg: 'bg-surface-subtle border-border-default', textCol: 'text-text-secondary', dotCol: 'bg-text-muted' };
      default:
        return { text: tag, bg: 'bg-status-warning-bg border-status-warning-border', textCol: 'text-status-warning', dotCol: 'bg-status-warning' };
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="bg-surface-active border border-status-info-border p-3 rounded-md text-text-primary text-xs flex items-start gap-2">
        <Layers size={16} className="shrink-0 mt-0.5 text-action-link" />
        <p>
          <strong className="font-semibold text-action-link">Mobile Matrix View:</strong> Tap any Key Area to expand, and select an intersection dimension to customize actions.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          const isExpanded = expandedRow === row.id;
          const isRowSelected = selectedMode === 'keyArea' && selectedKey === row.id;

          return (
            <div key={row.id} className="border border-border-strong rounded-md bg-surface-base overflow-hidden">
              {/* Row Header Accordion Trigger */}
              <button
                type="button"
                onClick={() => toggleRow(row.id)}
                aria-expanded={isExpanded}
                className={`
                  w-full px-4 py-3 flex items-center justify-between text-start font-semibold text-xs transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring
                  ${isRowSelected
                    ? 'bg-surface-active text-action-link border-s-4 border-s-action-link font-bold'
                    : 'hover:bg-surface-hover text-text-primary bg-surface-base border-s-2 border-s-action-link/60'
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
                          w-full p-3 rounded-md text-start text-xs font-medium border transition-colors duration-150 motion-reduce:transition-none flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                          ${selected
                            ? 'border-action-link bg-status-info-bg text-action-link font-semibold ring-1 ring-focus-ring shadow-subtle'
                            : 'border-border-default hover:bg-surface-hover bg-surface-base text-text-primary'
                          }
                        `}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted">Analytical Lens</span>
                          <span className="font-semibold text-text-primary text-xs">{col.name}</span>
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
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-action-link bg-surface-active border border-status-info-border px-2 py-0.5 rounded-md">
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
                    className="w-full text-center py-2 text-xs font-semibold text-action-link hover:bg-surface-active/50 transition-colors duration-150 motion-reduce:transition-none border border-dashed border-action-link/30 rounded-md bg-surface-active/20 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
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
