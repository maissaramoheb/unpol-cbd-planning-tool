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
      <div tabIndex={0} role="region" aria-label="CBD analytical matrix; scroll horizontally to inspect all lenses" className="matrix-scroll w-full max-h-[420px] overflow-auto rounded-lg border border-border-strong bg-surface-base">
        <div className="min-w-[960px] grid grid-cols-[165px_repeat(6,minmax(130px,1fr))] gap-px bg-border-default">
          {/* Corner Cell */}
          <div className="sticky top-0 start-0 z-30 bg-surface-subtle p-2 text-center flex flex-col justify-center items-center text-text-muted text-[11px] font-semibold uppercase tracking-wider h-16">
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
                  sticky top-0 z-20 h-16 p-2 text-center text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none flex flex-col justify-center items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring
                  ${isActive
                    ? 'bg-surface-active text-action-link font-bold ring-2 ring-inset ring-focus-ring z-10'
                    : 'bg-surface-subtle hover:bg-surface-hover text-text-primary'
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
                  sticky start-0 z-10 h-[68px] px-3 py-2 text-start text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none flex flex-col justify-center border-s-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring
                  ${selectedMode === 'keyArea' && selectedKey === row.id
                    ? 'border-s-action-link bg-surface-active text-action-link font-bold ring-2 ring-inset ring-focus-ring z-10'
                    : 'border-s-action-link/60 bg-surface-subtle hover:bg-surface-hover text-text-primary'
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
                let cellTint = 'bg-surface-base';
                let accentBorder = '';
                let hasLowConf = false;

                if (cell) {
                  const assessment = evaluateCbdCell(cell);
                  hasLowConf = assessment.tags.includes('Low Confidence');
                  const primaryTag = assessment.tags.find((t) => t !== 'Low Confidence');

                  if (primaryTag === 'Quick Win') {
                    cellTint = 'bg-status-success-bg';
                    accentBorder = 'border-s-2 border-s-status-success';
                    primaryStatus = {
                      text: 'Quick Win',
                      bg: 'bg-status-success-bg',
                      textCol: 'text-status-success',
                      dotCol: 'bg-status-success',
                      borderCol: 'border-status-success-border'
                    };
                  } else if (primaryTag === 'Sensitive Reform') {
                    cellTint = 'bg-status-danger-bg';
                    accentBorder = 'border-s-2 border-s-status-danger';
                    primaryStatus = {
                      text: 'Sensitive',
                      bg: 'bg-status-danger-bg',
                      textCol: 'text-status-danger',
                      dotCol: 'bg-status-danger',
                      borderCol: 'border-status-danger-border'
                    };
                  } else if (primaryTag === 'Long-Term Reform') {
                    cellTint = 'bg-accent-indigo-bg';
                    accentBorder = 'border-s-2 border-s-accent-indigo';
                    primaryStatus = {
                      text: 'Long-Term',
                      bg: 'bg-accent-indigo-bg',
                      textCol: 'text-accent-indigo',
                      dotCol: 'bg-accent-indigo',
                      borderCol: 'border-accent-indigo-border'
                    };
                  } else if (primaryTag === 'Priority' || assessment.inputs.impact >= 4) {
                    cellTint = 'bg-status-warning-bg';
                    accentBorder = 'border-s-2 border-s-status-warning';
                    primaryStatus = {
                      text: 'High Priority',
                      bg: 'bg-status-warning-bg',
                      textCol: 'text-status-warning',
                      dotCol: 'bg-status-warning',
                      borderCol: 'border-status-warning-border'
                    };
                  } else {
                    // Configured standard cell
                    cellTint = 'bg-status-info-bg';
                    accentBorder = 'border-s-2 border-s-action-link';
                    primaryStatus = {
                      text: 'Configured',
                      bg: 'bg-status-info-bg',
                      textCol: 'text-action-link',
                      dotCol: 'bg-action-primary',
                      borderCol: 'border-status-info-border'
                    };
                  }
                } else if (highlighted) {
                  cellTint = 'bg-surface-subtle';
                }

                // Selected styling with crisp institutional blue inset outline
                const selectionClass = selected
                  ? 'ring-2 ring-inset ring-focus-ring z-20 shadow-xs'
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
                      h-[68px] p-2 text-start transition-colors duration-150 motion-reduce:transition-none flex flex-col justify-center items-start relative focus-visible:outline-none
                      ${cellTint} ${accentBorder} ${selectionClass}
                      ${!selected ? 'hover:brightness-95 dark:hover:brightness-110' : ''}
                    `}
                  >
                    {/* Corner indicator dot for configured cells */}
                    {custom && (
                      <span
                        className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-action-primary ring-2 ring-surface-base"
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
                          <span className="text-[10px] font-mono text-text-muted flex items-center gap-1 pl-0.5">
                            <span className="h-1 w-1 rounded-full bg-text-muted" />
                            Low Conf
                          </span>
                        )}
                      </div>
                    ) : <span className="text-[11px] text-text-muted">Template</span>}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-muted">Scroll across to inspect all six analytical lenses. Select a cell to review its rationale and response.</p>

      {/* Heatmap Legend */}
      <div className="p-3 bg-surface-base border border-border-default rounded-lg text-xs flex flex-wrap gap-3.5 items-center justify-between shadow-subtle">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
            Matrix Heatmap Legend
          </span>
          <span className="text-[10px] text-text-muted">(derived from planning heuristics &amp; cell configuration)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-status-success bg-status-success-bg border border-status-success-border">
            <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
            Quick Win
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-status-warning bg-status-warning-bg border border-status-warning-border">
            <span className="h-1.5 w-1.5 rounded-full bg-status-warning" />
            High Priority
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-status-danger bg-status-danger-bg border border-status-danger-border">
            <span className="h-1.5 w-1.5 rounded-full bg-status-danger" />
            Sensitive Reform
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-accent-indigo bg-accent-indigo-bg border border-accent-indigo-border">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-indigo" />
            Long-Term Reform
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-text-secondary bg-surface-subtle border border-border-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
            Low Confidence
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-action-link bg-status-info-bg border border-status-info-border">
            <span className="h-1.5 w-1.5 rounded-full bg-action-primary" />
            Configured Analysis
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] text-text-muted bg-surface-base border border-border-default">
            <span className="h-1.5 w-1.5 rounded-xs border border-border-default bg-surface-base" />
            Untouched (Default)
          </span>
        </div>
      </div>
    </div>
  );
};
