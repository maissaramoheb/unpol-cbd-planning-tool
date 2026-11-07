import React, { useState, useRef } from 'react';
import { MissionExplorerEntry } from '../types/explorer';
import { MISSION_MAP_POSITIONS } from '../data/missionMapPositions';
import type { MissionMapPosition } from '../data/missionMapPositions';
import { useTheme } from '../ui/ThemeControl';

interface MissionExplorerMapProps {
  entries: MissionExplorerEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  hoveredEntryId: string | null;
  onHoverEntry: (id: string | null) => void;
  compareIds?: string[];
}

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

const projectPosition = ({ longitude, latitude }: MissionMapPosition) => ({
  x: ((longitude + 180) / 360) * MAP_WIDTH,
  y: ((90 - latitude) / 180) * MAP_HEIGHT
});

const clampLabelPosition = (value: number, labelSize: number, mapSize: number) =>
  Math.min(Math.max(value, labelSize / 2 + 8), mapSize - labelSize / 2 - 8);

const getCoverageLabel = (entry: MissionExplorerEntry) => {
  if (entry.coverageScope === 'current-peacekeeping-reference') {
    return 'Current UN Peacekeeping reference';
  }
  if (entry.isFictionalScenario) {
    return 'Fictional training scenario';
  }
  return 'Unofficial starter planning profile';
};

export const MissionExplorerMap: React.FC<MissionExplorerMapProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  hoveredEntryId,
  onHoverEntry,
  compareIds = []
}) => {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [prevSelectedId, setPrevSelectedId] = useState(selectedEntryId);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startCenter: { x: number; y: number } } | null>(null);

  // Synchronous theme resolution from application store
  const theme = useTheme();
  const isDark = theme === 'dark';

  // Auto-focus on selected mission when prop changes (React recommended render-time adjustment)
  if (selectedEntryId !== prevSelectedId) {
    setPrevSelectedId(selectedEntryId);
    if (selectedEntryId && MISSION_MAP_POSITIONS[selectedEntryId]) {
      const pos = projectPosition(MISSION_MAP_POSITIONS[selectedEntryId]);
      setCenter(pos);
      setZoom((prev) => Math.max(prev, 1.8));
    }
  }

  const geographicEntries = entries.filter(
    (entry) => !entry.isFictionalScenario && MISSION_MAP_POSITIONS[entry.id]
  );
  const selectedEntry = geographicEntries.find((entry) => entry.id === selectedEntryId) || null;
  const hoveredEntry = geographicEntries.find((entry) => entry.id === hoveredEntryId) || null;
  const previewEntry = selectedEntry || hoveredEntry;
  const anySelected = selectedEntryId !== null;

  // Compute dynamic viewBox with bounds clamping
  const boxWidth = MAP_WIDTH / zoom;
  const boxHeight = MAP_HEIGHT / zoom;
  const viewBoxX = Math.max(0, Math.min(MAP_WIDTH - boxWidth, center.x - boxWidth / 2));
  const viewBoxY = Math.max(0, Math.min(MAP_HEIGHT - boxHeight, center.y - boxHeight / 2));
  const viewBox = `${viewBoxX} ${viewBoxY} ${boxWidth} ${boxHeight}`;

  const handleZoomIn = () => {
    setZoom((z) => Math.min(3.5, Number((z + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(1, Number((z - 0.5).toFixed(1)));
      if (next === 1) {
        setCenter({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
      }
      return next;
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setCenter({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    if ((e.target as HTMLElement).closest('g[role="button"]')) return;
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startCenter: { ...center }
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const container = e.currentTarget as HTMLElement;
    const scaleX = boxWidth / (container.clientWidth || MAP_WIDTH);
    const scaleY = boxHeight / (container.clientHeight || MAP_HEIGHT);
    const dx = (e.clientX - dragStartRef.current.clientX) * scaleX;
    const dy = (e.clientY - dragStartRef.current.clientY) * scaleY;
    setCenter({
      x: Math.max(boxWidth / 2, Math.min(MAP_WIDTH - boxWidth / 2, dragStartRef.current.startCenter.x - dx)),
      y: Math.max(boxHeight / 2, Math.min(MAP_HEIGHT - boxHeight / 2, dragStartRef.current.startCenter.y - dy))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      handleZoomIn();
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      handleZoomOut();
    } else if (e.key === '0' || e.key === 'Escape') {
      e.preventDefault();
      handleResetView();
    } else if (zoom > 1) {
      const step = 40 / zoom;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCenter((c) => ({ ...c, x: Math.max(boxWidth / 2, c.x - step) }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCenter((c) => ({ ...c, x: Math.min(MAP_WIDTH - boxWidth / 2, c.x + step) }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCenter((c) => ({ ...c, y: Math.max(boxHeight / 2, c.y - step) }));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCenter((c) => ({ ...c, y: Math.min(MAP_HEIGHT - boxHeight / 2, c.y + step) }));
      }
    }
  };

  // Sort entries so hovered and selected entries are drawn last, placing them on top layer
  const sortedEntries = [...geographicEntries].sort((a, b) => {
    const aSelected = a.id === selectedEntryId;
    const bSelected = b.id === selectedEntryId;
    const aHovered = a.id === hoveredEntryId;
    const bHovered = b.id === hoveredEntryId;

    if (aSelected && !bSelected) return 1;
    if (!aSelected && bSelected) return -1;
    if (aHovered && !bHovered) return 1;
    if (!aHovered && bHovered) return -1;
    return 0;
  });

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Mission Explorer interactive world map; use Tab to navigate pins, +/- to zoom, arrow keys to pan when zoomed"
      className="w-full overflow-hidden rounded-2xl border border-border-default bg-surface-raised p-3 shadow-subtle sm:p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring relative select-none"
    >
      {/* Zoom and Pan Controls */}
      <div className="absolute right-3 top-3 flex flex-col items-center gap-1 rounded-xl border border-border-default bg-surface-base/95 p-1 shadow-subtle backdrop-blur-xs z-20">
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= 3.5}
          aria-label="Zoom in map"
          title="Zoom In (+)"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-text-primary hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-colors"
        >
          +
        </button>
        <div className="h-px w-full bg-border-subtle my-0.5" />
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= 1.0}
          aria-label="Zoom out map"
          title="Zoom Out (-)"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-text-primary hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-colors"
        >
          −
        </button>
        <div className="h-px w-full bg-border-subtle my-0.5" />
        <button
          type="button"
          onClick={handleResetView}
          aria-label="Reset map view"
          title="Fit World (Reset)"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-action-link hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-colors uppercase tracking-tight"
        >
          Fit
        </button>
        <span className="text-[9px] font-mono text-text-muted mt-0.5 select-none" title="Current zoom level">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div
        className="relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox={viewBox}
          className="block h-auto w-full select-none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Interactive vector world map showing peacekeeping mission starter profiles with zoom and pan"
          style={{
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
        >
          <title>Mission Explorer world map</title>

          {/* Clean Vector World Map (Restored from Pilot 01.2) */}
          <image
            href={isDark ? '/mission-explorer-world-map.svg' : '/mission-explorer-world-map-light.svg'}
            x="0"
            y="0"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            preserveAspectRatio="xMidYMid meet"
          />

          {sortedEntries.map((entry) => {
            const position = MISSION_MAP_POSITIONS[entry.id];
            const { x, y } = projectPosition(position);
            const isSelected = selectedEntryId === entry.id;
            const isHovered = hoveredEntryId === entry.id;
            const isCompared = compareIds.includes(entry.id);
            const isEmphasized = isSelected || isHovered;

            // Reduce default label clutter by showing a compact acronym-only label card by default.
            // Expand to show country details on hover or selection.
            const currentLabelWidth = isEmphasized ? 104 : 58;
            const currentLabelHeight = isEmphasized ? 34 : 20;

            const labelX = clampLabelPosition(x + position.labelOffset.x, currentLabelWidth, MAP_WIDTH);
            const labelY = clampLabelPosition(y + position.labelOffset.y, currentLabelHeight, MAP_HEIGHT);

            // Slightly dim non-selected labels/pins when one mission is selected (except hovered or compared ones)
            const isDimmed = anySelected && !isSelected && !isHovered && !isCompared;

            return (
              <g
                key={entry.id}
                className="cursor-pointer outline-none transition-[fill,stroke,opacity] duration-150 motion-reduce:transition-none"
                style={{ opacity: isDimmed ? 0.35 : 1 }}
                role="button"
                tabIndex={0}
                focusable="true"
                aria-label={`Select ${entry.missionAcronym} planning context for ${entry.country}`}
                aria-pressed={isSelected}
                onClick={() => onSelectEntry(entry.id)}
                onMouseEnter={() => onHoverEntry(entry.id)}
                onMouseLeave={() => onHoverEntry(null)}
                onFocus={() => onHoverEntry(entry.id)}
                onBlur={() => onHoverEntry(null)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectEntry(entry.id);
                  }
                }}
              >
                <title>{`${entry.missionAcronym}: ${entry.missionName}, ${entry.country}${isCompared ? ' (In comparison set)' : ''}`}</title>
                <line
                  x1={x}
                  y1={y}
                  x2={labelX}
                  y2={labelY}
                  stroke={isSelected ? '#2563eb' : isCompared ? '#0284c7' : '#64748b'}
                  strokeWidth={isSelected ? 2 : isCompared ? 1.5 : 1.15}
                  strokeOpacity={isEmphasized || isCompared ? 0.95 : 0.7}
                  className="transition-opacity duration-150 motion-reduce:transition-none dark:stroke-blue-400"
                />

                {/* Secondary Compare Ring */}
                {isCompared && !isSelected ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="transition-all duration-150 motion-reduce:transition-none dark:stroke-sky-400"
                  />
                ) : null}

                {/* Outer Glow Ring for Selected / Hovered Pin */}
                {isEmphasized ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 16 : 11}
                    fill="none"
                    stroke={isSelected ? '#2563eb' : '#94a3b8'}
                    strokeOpacity={isSelected ? 0.35 : 0.4}
                    strokeWidth="3.5"
                    className="transition-all duration-150 motion-reduce:transition-none dark:stroke-blue-400"
                  />
                ) : null}

                {isSelected ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={20}
                    fill="none"
                    stroke="#2563eb"
                    strokeOpacity="0.2"
                    strokeWidth="6"
                    className="transition-opacity duration-150 motion-reduce:transition-none dark:stroke-blue-500"
                  />
                ) : null}

                {/* Main Geographic Pin */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 8.5 : isHovered ? 7.5 : 6}
                  fill={isSelected ? '#1e40af' : isCompared ? '#0284c7' : '#475569'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150 motion-reduce:transition-none dark:fill-blue-500 dark:stroke-slate-950"
                />

                {/* Label Box */}
                <rect
                  x={labelX - currentLabelWidth / 2}
                  y={labelY - currentLabelHeight / 2}
                  width={currentLabelWidth}
                  height={currentLabelHeight}
                  rx="5"
                  fill={isSelected ? '#1e40af' : isCompared ? '#0369a1' : '#ffffff'}
                  fillOpacity="0.96"
                  stroke={isSelected ? '#172554' : isCompared ? '#0284c7' : isHovered ? '#2563eb' : '#cbd5e1'}
                  strokeWidth={isSelected ? 2 : isCompared ? 1.5 : 1}
                  strokeDasharray={isCompared && !isSelected ? '4 2' : undefined}
                  className="transition-all duration-150 motion-reduce:transition-none dark:fill-slate-900 dark:stroke-slate-700 shadow-sm"
                />

                {/* Mission Acronym */}
                <text
                  x={labelX}
                  y={isEmphasized ? labelY - 2 : labelY + 4}
                  fill={isSelected || isCompared ? '#ffffff' : '#0f172a'}
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  className={isSelected || isCompared ? 'fill-white' : 'fill-slate-900 dark:fill-slate-100'}
                >
                  {entry.missionAcronym}
                </text>

                {/* Expanded Country Label */}
                {isEmphasized ? (
                  <text
                    x={labelX}
                    y={labelY + 10}
                    fill={isSelected || isCompared ? '#dbeafe' : '#475569'}
                    fontSize="7.5"
                    fontWeight="600"
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    className={isSelected || isCompared ? 'fill-blue-100' : 'fill-slate-600 dark:fill-slate-300'}
                  >
                    {entry.country.length > 24 ? `${entry.country.slice(0, 23)}…` : entry.country}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {geographicEntries.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <span className="rounded-lg border border-border-default bg-surface-base/95 px-3 py-2 text-xs font-semibold text-text-primary shadow-subtle dark:border-slate-700 dark:bg-slate-900/95">
              No geographic planning contexts match the selected filters.
            </span>
          </div>
        ) : null}

        {previewEntry ? (
          <div className="absolute left-3 top-3 max-w-[min(22rem,calc(100%-1.5rem))] rounded-xl border border-border-default bg-surface-base/95 p-3 text-left text-xs text-text-primary shadow-raised backdrop-blur-xs dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-100 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black uppercase tracking-wide text-text-primary dark:text-white">
                {previewEntry.missionAcronym}
              </span>
              <span className="rounded-full border border-status-info-border bg-status-info-bg px-2 py-0.5 text-[10px] font-bold text-action-link dark:border-blue-400/40 dark:bg-blue-500/15 dark:text-blue-100">
                {getCoverageLabel(previewEntry)}
              </span>
            </div>
            <p className="mt-1 font-semibold leading-snug text-text-primary dark:text-slate-200">
              {previewEntry.country}
            </p>
            <p className="mt-1 line-clamp-2 leading-relaxed text-text-muted dark:text-slate-400">
              {previewEntry.missionName}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-col gap-1 border-t border-border-default pt-2 text-[10px] font-medium text-text-muted dark:border-slate-700 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Interactive vector world map. Use +, −, or Fit to adjust scale; drag or arrows to pan; Tab, Enter, or Space for pins.</span>
        <span aria-live="polite" className={selectedEntry ? 'text-action-link font-semibold dark:text-blue-200' : undefined}>
          {selectedEntry
            ? `Selected: ${selectedEntry.missionAcronym} · ${selectedEntry.country}`
            : 'Local vector asset · No external map service · No tracking'}
        </span>
      </div>
    </div>
  );
};
