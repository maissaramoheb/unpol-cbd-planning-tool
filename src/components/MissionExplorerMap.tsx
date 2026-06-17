import React from 'react';
import { MissionExplorerEntry } from '../types/explorer';
import { MISSION_MAP_POSITIONS } from '../data/missionMapPositions';
import type { MissionMapPosition } from '../data/missionMapPositions';

interface MissionExplorerMapProps {
  entries: MissionExplorerEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  hoveredEntryId: string | null;
  onHoverEntry: (id: string | null) => void;
}

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;
const LABEL_WIDTH = 104;
const LABEL_HEIGHT = 34;

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
  onHoverEntry
}) => {
  const geographicEntries = entries.filter(
    (entry) => !entry.isFictionalScenario && MISSION_MAP_POSITIONS[entry.id]
  );
  const selectedEntry = geographicEntries.find((entry) => entry.id === selectedEntryId) || null;
  const hoveredEntry = geographicEntries.find((entry) => entry.id === hoveredEntryId) || null;
  const previewEntry = selectedEntry || hoveredEntry;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-sm sm:p-4">
      <div className="relative">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="block h-auto w-full"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Static vector world map showing available mission starter profile locations"
        >
          <title>Mission Explorer world map</title>
          <image
            href="/mission-explorer-world-map.svg"
            x="0"
            y="0"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            preserveAspectRatio="xMidYMid meet"
          />

          {geographicEntries.map((entry) => {
            const position = MISSION_MAP_POSITIONS[entry.id];
            const { x, y } = projectPosition(position);
            const labelX = clampLabelPosition(x + position.labelOffset.x, LABEL_WIDTH, MAP_WIDTH);
            const labelY = clampLabelPosition(y + position.labelOffset.y, LABEL_HEIGHT, MAP_HEIGHT);
            const isSelected = selectedEntryId === entry.id;
            const isHovered = hoveredEntryId === entry.id;
            const isEmphasized = isSelected || isHovered;

            return (
              <g
                key={entry.id}
                className="cursor-pointer outline-none"
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
                <title>{`${entry.missionAcronym}: ${entry.missionName}, ${entry.country}`}</title>
                <line
                  x1={x}
                  y1={y}
                  x2={labelX}
                  y2={labelY}
                  stroke={isSelected ? '#93c5fd' : '#94a3b8'}
                  strokeWidth={isSelected ? 1.8 : 1.15}
                  strokeOpacity={isEmphasized ? 0.95 : 0.7}
                  className="transition-opacity duration-150 motion-reduce:transition-none"
                />
                {isEmphasized ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 14 : 10}
                    fill="none"
                    stroke={isSelected ? '#bfdbfe' : '#cbd5e1'}
                    strokeWidth="2"
                    className="transition-all duration-150 motion-reduce:transition-none"
                  />
                ) : null}
                {isSelected ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={20}
                    fill="none"
                    stroke="#60a5fa"
                    strokeOpacity="0.28"
                    strokeWidth="5"
                    className="transition-opacity duration-150 motion-reduce:transition-none"
                  />
                ) : null}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 8 : isHovered ? 7 : 6}
                  fill={isSelected ? '#60a5fa' : '#cbd5e1'}
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  className="transition-all duration-150 motion-reduce:transition-none"
                />
                <rect
                  x={labelX - LABEL_WIDTH / 2}
                  y={labelY - LABEL_HEIGHT / 2}
                  width={LABEL_WIDTH}
                  height={LABEL_HEIGHT}
                  rx="6"
                  fill={isSelected ? '#1e3a8a' : '#172033'}
                  fillOpacity="0.97"
                  stroke={isSelected ? '#93c5fd' : isHovered ? '#cbd5e1' : '#64748b'}
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-colors duration-150 motion-reduce:transition-none"
                />
                <text
                  x={labelX}
                  y={labelY - 2}
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                >
                  {entry.missionAcronym}
                </text>
                <text
                  x={labelX}
                  y={labelY + 10}
                  fill={isSelected ? '#dbeafe' : '#cbd5e1'}
                  fontSize="7.5"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                >
                  {entry.country.length > 24 ? `${entry.country.slice(0, 23)}…` : entry.country}
                </text>
              </g>
            );
          })}
        </svg>

        {geographicEntries.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <span className="rounded-lg border border-slate-600 bg-slate-900/95 px-3 py-2 text-xs font-semibold text-slate-200 shadow-sm">
              No geographic planning contexts match the selected filters.
            </span>
          </div>
        ) : null}

        {previewEntry ? (
          <div className="absolute left-3 top-3 max-w-[min(22rem,calc(100%-1.5rem))] rounded-xl border border-slate-600 bg-slate-950/95 p-3 text-left text-xs text-slate-100 shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black uppercase tracking-wide text-white">
                {previewEntry.missionAcronym}
              </span>
              <span className="rounded-full border border-blue-400/40 bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-100">
                {getCoverageLabel(previewEntry)}
              </span>
            </div>
            <p className="mt-1 font-semibold leading-snug text-slate-200">
              {previewEntry.country}
            </p>
            <p className="mt-1 line-clamp-2 leading-relaxed text-slate-400">
              {previewEntry.missionName}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-col gap-1 border-t border-slate-700 pt-2 text-[10px] font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Static vector world map — planning orientation only. Use Tab, Enter, or Space to inspect pins.</span>
        <span aria-live="polite" className={selectedEntry ? 'text-blue-200' : undefined}>
          {selectedEntry
            ? `Selected: ${selectedEntry.missionAcronym} · ${selectedEntry.country}`
            : 'Local map asset · No external map service'}
        </span>
      </div>
    </div>
  );
};
