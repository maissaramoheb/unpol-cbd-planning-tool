import React from 'react';
import { CbdAxis, CbdCell } from '../types';
import { evaluateCbdCell } from '../lib/scoring';

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
    <div className="w-full flex flex-col gap-3">
      {/* Coherent Analytical Grid */}
      <div className="w-full overflow-x-auto rounded-lg border border-border-strong bg-surface-card">
        <div className="min-w-[960px] grid grid-cols-[165px_repeat(6,minmax(130px,1fr))] gap-px bg-border-default">
          {/* Corner Cell */}
          <div className="bg-surface-subtle p-2 text-center flex flex-col justify-center items-center text-text-muted text-[11px] font-semibold uppercase tracking-wider h-16">
            <span>Analytical Lenses &rarr;</span>
            <span className="mt-1 border-t border-border-default pt-0.5 w-full text-[10px] text-text-muted">Key Areas &darr;</span>
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
                  h-16 p-2 text-center text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none flex flex-col justify-center items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring
                  ${isActive
                    ? 'bg-institutional-subtle text-institutional font-bold ring-2 ring-inset ring-blue-600 z-10'
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
                  h-[68px] px-3 py-2 text-left text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none flex flex-col justify-center border-l-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring
                  ${selectedMode === 'keyArea' && selectedKey === row.id
                    ? 'border-l-blue-600 bg-institutional-subtle text-institutional font-bold ring-2 ring-inset ring-blue-600 z-10'
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
                const cell = customCells[`${row.id}|${col.id}`];

                let primaryStatus: { text: string; bg: string; textCol: string; dotCol: string; borderCol: string } | null = null;
                let cellTint = 'bg-white';
                let accentBorder = '';
                let hasLowConf = false;

                if (cell) {
                  const assessment = evaluateCbdCell(cell);
                  hasLowConf = assessment.tags.includes('Low Confidence');
                  const primaryTag = assessment.tags.find((t) => t !== 'Low Confidence');

                  if (primaryTag === 'Quick Win') {
                    cellTint = 'bg-emerald-50/70';
                    accentBorder = 'border-l-2 border-l-emerald-500';
                    primaryStatus = {
                      text: 'Quick Win',
                      bg: 'bg-emerald-100/90',
                      textCol: 'text-emerald-800',
                      dotCol: 'bg-emerald-600',
                      borderCol: 'border-emerald-300/80'
                    };
                  } else if (primaryTag === 'Sensitive Reform') {
                    cellTint = 'bg-rose-50/70';
                    accentBorder = 'border-l-2 border-l-rose-500';
                    primaryStatus = {
                      text: 'Sensitive',
                      bg: 'bg-rose-100/90',
                      textCol: 'text-rose-800',
                      dotCol: 'bg-rose-600',
                      borderCol: 'border-rose-300/80'
                    };
                  } else if (primaryTag === 'Long-Term Reform') {
                    cellTint = 'bg-indigo-50/70';
                    accentBorder = 'border-l-2 border-l-indigo-500';
                    primaryStatus = {
                      text: 'Long-Term',
                      bg: 'bg-indigo-100/90',
                      textCol: 'text-indigo-800',
                      dotCol: 'bg-indigo-600',
                      borderCol: 'border-indigo-300/80'
                    };
                  } else if (primaryTag === 'Priority' || assessment.inputs.impact >= 4) {
                    cellTint = 'bg-amber-50/70';
                    accentBorder = 'border-l-2 border-l-amber-500';
                    primaryStatus = {
                      text: 'High Priority',
                      bg: 'bg-amber-100/90',
                      textCol: 'text-amber-900',
                      dotCol: 'bg-amber-600',
                      borderCol: 'border-amber-300/80'
                    };
                  } else {
                    // Configured standard cell
                    cellTint = 'bg-blue-50/35';
                    accentBorder = 'border-l-2 border-l-institutional';
                    primaryStatus = {
                      text: 'Configured',
                      bg: 'bg-blue-100/80',
                      textCol: 'text-institutional',
                      dotCol: 'bg-institutional',
                      borderCol: 'border-blue-200'
                    };
                  }
                } else if (highlighted) {
                  cellTint = 'bg-slate-50/80';
                }

                // Selected styling with crisp institutional blue inset outline
                const selectionClass = selected
                  ? 'ring-2 ring-inset ring-blue-600 z-20 shadow-xs'
                  : 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring';

                const ariaLabel = `${row.name} × ${col.name}. ${
                  custom
                    ? `Configured analysis. ${primaryStatus?.text ?? ''}${hasLowConf ? ', Low Confidence' : ''}`
                    : 'Default template.'
                }`;

                return (
                  <button
                    key={`${row.id}|${col.id}`}
                    type="button"
                    onClick={() => onSelectCell(row.id, col.id)}
                    aria-pressed={selected}
                    aria-label={ariaLabel}
                    className={`
                      h-[68px] p-2 text-left transition-colors duration-150 motion-reduce:transition-none flex flex-col justify-center items-start relative focus-visible:outline-none
                      ${cellTint} ${accentBorder} ${selectionClass}
                      ${!selected ? 'hover:bg-slate-50/90' : ''}
                    `}
                  >
                    {/* Corner indicator dot for configured cells */}
                    {custom && (
                      <span
                        className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"
                        title="Configured Analysis"
                        aria-hidden="true"
                      />
                    )}

                    {/* Status Badge */}
                    {primaryStatus ? (
                      <div className="flex flex-col gap-1 w-full pr-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border tracking-tight leading-none shrink-0 ${primaryStatus.bg} ${primaryStatus.textCol} ${primaryStatus.borderCol}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${primaryStatus.dotCol}`} />
                          <span className="truncate">{primaryStatus.text}</span>
                        </span>
                        {hasLowConf && (
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 pl-0.5">
                            <span className="h-1 w-1 rounded-full bg-slate-400" />
                            Low Conf
                          </span>
                        )}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="p-3 bg-surface-card border border-border-default rounded-lg text-xs flex flex-wrap gap-3.5 items-center justify-between shadow-subtle">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-default uppercase tracking-wider text-[11px]">
            Matrix Heatmap Legend
          </span>
          <span className="text-[10px] text-text-muted">(derived from planning heuristics &amp; cell configuration)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-300/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Quick Win
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-900 bg-amber-100/90 border border-amber-300/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            High Priority
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-rose-800 bg-rose-100/90 border border-rose-300/80">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            Sensitive Reform
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-indigo-800 bg-indigo-100/90 border border-indigo-300/80">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            Long-Term Reform
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-300/80">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            Low Confidence
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-institutional bg-blue-100/80 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Configured Analysis
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] text-text-muted bg-white border border-border-default">
            <span className="h-1.5 w-1.5 rounded-xs border border-border-default bg-white" />
            Untouched (Default)
          </span>
        </div>
      </div>
    </div>
  );
};
