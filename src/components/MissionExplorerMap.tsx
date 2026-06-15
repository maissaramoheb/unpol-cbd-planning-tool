import React from 'react';
import { MissionExplorerEntry } from '../types/explorer';

interface MissionExplorerMapProps {
  entries: MissionExplorerEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  hoveredEntryId: string | null;
  onHoverEntry: (id: string | null) => void;
}

export const MissionExplorerMap: React.FC<MissionExplorerMapProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  hoveredEntryId,
  onHoverEntry
}) => {
  // Filter for real-world scenarios that have actual geographic coordinates
  const geographicEntries = entries.filter((e) => !e.isFictionalScenario);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-inner relative overflow-hidden select-none min-h-[300px] md:min-h-[440px] flex flex-col justify-between">
      {/* Background Tech Merdians/Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex flex-col justify-between p-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-full h-px bg-white" />
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex justify-between p-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-px h-full bg-white" />
        ))}
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-auto relative z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gridded Background Lines */}
        <g stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.05" fill="none">
          {/* Equator */}
          <line x1="0" y1="250" x2="1000" y2="250" strokeDasharray="4,4" />
          {/* Prime Meridian */}
          <line x1="500" y1="0" x2="500" y2="500" strokeDasharray="4,4" />
        </g>

        {/* Abstract Stylized Continents */}
        <g fill="#334155" fillOpacity="0.35" stroke="#475569" strokeWidth="1.2" strokeLinejoin="round">
          {/* North America */}
          <path d="M 120 100 L 250 80 L 320 120 L 350 160 L 310 200 L 270 200 L 250 250 L 210 240 L 190 200 L 120 180 Z" />
          {/* South America */}
          <path d="M 270 280 L 320 300 L 340 330 L 350 370 L 310 450 L 290 480 L 280 440 L 250 370 L 240 320 Z" />
          {/* Eurasia (Europe + Asia) */}
          <path d="M 400 120 L 520 80 L 680 70 L 840 90 L 900 130 L 920 180 L 880 230 L 820 260 L 760 290 L 680 280 L 580 270 L 520 280 L 460 260 L 440 210 L 420 180 Z" />
          {/* Africa */}
          <path d="M 450 240 L 520 240 L 570 270 L 580 300 L 560 350 L 510 420 L 490 440 L 480 410 L 460 380 L 430 360 L 410 320 L 410 280 Z" />
          {/* Australia */}
          <path d="M 760 360 L 820 360 L 840 390 L 830 420 L 790 420 L 750 390 Z" />
        </g>

        {/* Clickable pins and labels */}
        {geographicEntries.map((entry) => {
          const x = (entry.coordinates.x / 100) * 1000;
          const y = (entry.coordinates.y / 100) * 500;
          const isSelected = selectedEntryId === entry.id;
          const isHovered = hoveredEntryId === entry.id;

          return (
            <g
              key={entry.id}
              className="cursor-pointer group"
              onClick={() => onSelectEntry(entry.id)}
              onMouseEnter={() => onHoverEntry(entry.id)}
              onMouseLeave={() => onHoverEntry(null)}
            >
              {/* Pulse Ring */}
              {(isSelected || isHovered) && (
                <circle
                  cx={x}
                  cy={y}
                  r="20"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="animate-ping origin-center"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              )}

              {/* Pin Base Shadow */}
              <circle cx={x} cy={y} r="8" fill="#020617" fillOpacity="0.4" />

              {/* Pin Interactive Center */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? '7' : '5'}
                fill={isSelected ? '#3b82f6' : '#64748b'}
                stroke={isSelected ? '#ffffff' : '#94a3b8'}
                strokeWidth="1.5"
                className="transition-all duration-200 group-hover:scale-125 group-hover:fill-blue-500"
                style={{ transformOrigin: `${x}px ${y}px` }}
              />

              {/* Mini Label (Visible always in high contrast slate or on hover/select) */}
              <g transform={`translate(${x}, ${y - 14})`}>
                {/* Background tag */}
                <rect
                  x="-35"
                  y="-10"
                  width="70"
                  height="16"
                  rx="3"
                  fill={isSelected ? '#1e3a8a' : '#1e293b'}
                  fillOpacity="0.9"
                  stroke={isSelected ? '#3b82f6' : '#475569'}
                  strokeWidth="1"
                />
                {/* Acronym Text */}
                <text
                  x="0"
                  y="1"
                  fill={isSelected ? '#ffffff' : '#cbd5e1'}
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {entry.missionAcronym}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* SVG Map Scale & Info Tag */}
      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono relative z-20 border-t border-slate-800/80 pt-2 mt-2">
        <span>PROJECTION: ORTHOGRAPHIC FLAT VECTOR GRID</span>
        <span>SCALE: NON-AUTHORITATIVE TRAINING GRID</span>
      </div>
    </div>
  );
};
