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
    <div className="w-full flex flex-col gap-4">
      {/* Coherent Analytical Grid */}
      <div className="w-full overflow-x-auto rounded-lg border border-border-default bg-surface-card shadow-subtle">
        <div className="min-w-[980px] grid grid-cols-[170px_repeat(6,minmax(135px,1fr))] gap-px bg-border-default">
          {/* Corner Cell */}
          <div className="bg-surface-subtle p-3 text-center flex flex-col justify-center items-center text-text-muted text-[11px] font-semibold uppercase tracking-wider h-20">
            <span>Analytical Lenses &rarr;</span>
            <span className="mt-1 border-t border-border-default pt-1 w-full text-[10px] text-text-muted">Key Areas &darr;</span>
          </div>

          {/* Column Headers */}
          {columns.map((col) => {
            const isActive = selectedMode === 'dimension' && selectedKey === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => onSelectDimension(col.id)}
                aria-pressed={isActive}
                className={`
                  h-20 p-2 text-center text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none flex flex-col justify-center items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring
                  ${isActive
                    ? 'bg-institutional-subtle text-institutional font-bold ring-2 ring-inset ring-institutional z-10'
                    : 'bg-surface-subtle hover:bg-surface-hover text-text-default'
                  }
                `}
              >
                <span className="uppercase tracking-wider text-[10px] text-text-muted block mb-0.5">Lens</span>
                <span className="line-clamp-2 leading-tight font-semibold text-xs">{shortColName(col.name)}</span>
              </button>
            );
          })}

          {/* Rows */}
          {rows.map((row) => (
            <React.Fragment key={row.id}>
              {/* Row Header */}
              <button
                key={row.id}
                type="button"
                onClick={() => onSelectKeyArea(row.id)}
                aria-pressed={selectedMode === 'keyArea' && selectedKey === row.id}
                className={`
                  h-24 p-3 text-left text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none flex flex-col justify-center border-l-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring
                  ${selectedMode === 'keyArea' && selectedKey === row.id
                    ? 'border-l-institutional bg-institutional-subtle text-institutional font-bold ring-2 ring-inset ring-institutional z-10'
                    : 'border-l-institutional/60 bg-surface-subtle hover:bg-surface-hover text-text-default'
                  }
                `}
              >
                <span className="uppercase tracking-wider text-[10px] text-text-muted block mb-0.5">Key Area</span>
                <span className="line-clamp-2 leading-tight font-semibold text-xs">{shortRowName(row.name)}</span>
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
                    type="button"
                    onClick={() => onSelectCell(row.id, col.id)}
                    aria-pressed={selected}
                    aria-label={`${row.name} × ${col.name}. ${custom ? 'Customized analysis available. ' : 'Standard template. '}${tags.map(t => t.text).join(', ')}`}
                    className={`
                      h-24 p-2.5 text-left transition-colors duration-150 motion-reduce:transition-none flex flex-col justify-between relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring
                      ${selected
                        ? 'ring-2 ring-inset ring-institutional bg-institutional-subtle text-institutional z-10'
                        : highlighted
                          ? 'bg-institutional-subtle/25 text-text-default hover:bg-institutional-subtle/40'
                          : 'bg-surface-card hover:bg-surface-subtle text-text-default'
                      }
                    `}
                  >
                    {/* Top status indicator: customized dot */}
                    <div className="flex justify-between items-center w-full">
                      {custom ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-institutional">
                          <span className="h-2 w-2 rounded-full bg-institutional shrink-0" />
                          <span>Customized</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-muted">Standard</span>
                      )}
                    </div>

                    {/* Center / Bottom: Heatmap tags */}
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-auto w-full">
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
                    ) : (
                      <div className="mt-auto text-[11px] text-text-muted/60">No tags</div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="p-3 bg-surface-subtle border border-border-default rounded-lg text-xs flex flex-wrap gap-4 items-center justify-center font-medium text-text-muted">
        <span className="font-semibold text-text-default uppercase tracking-wider text-[11px]">Heatmap Legend:</span>
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-amber-600" />
          <span className="text-[11px]">High Priority</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          <span className="text-[11px]">Quick Win</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-rose-600" />
          <span className="text-[11px]">Leadership-Sensitive</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-indigo-600" />
          <span className="text-[11px]">Long-Term Reform</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-slate-500" />
          <span className="text-[11px]">Low Confidence</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary pl-2 border-l border-border-default">
          <span className="h-2 w-2 rounded-full bg-institutional" />
          <span className="text-[11px]">Customized Analysis</span>
        </div>
      </div>
    </div>
  );
};
