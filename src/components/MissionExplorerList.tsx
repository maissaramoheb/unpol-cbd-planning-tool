import React from 'react';
import { MissionExplorerEntry } from '../types/explorer';
import { Badge } from '../ui/Badge';

interface MissionExplorerListProps {
  entries: MissionExplorerEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  showFictional: 'all' | 'real' | 'fictional';
  onShowFictionalChange: (val: 'all' | 'real' | 'fictional') => void;
}

export const MissionExplorerList: React.FC<MissionExplorerListProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  showFictional,
  onShowFictionalChange
}) => {
  // Extract unique regions, types, and statuses for filter dropdowns
  const regions = Array.from(new Set(entries.map((e) => e.region).filter(Boolean)));
  const types = Array.from(new Set(entries.map((e) => e.missionType).filter(Boolean)));
  const statuses = Array.from(new Set(entries.map((e) => e.status).filter(Boolean)));

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.missionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.missionAcronym.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = selectedRegion === 'all' || entry.region === selectedRegion;
    const matchesType = selectedType === 'all' || entry.missionType === selectedType;
    const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;

    const matchesFictional =
      showFictional === 'all' ||
      (showFictional === 'real' && !entry.isFictionalScenario) ||
      (showFictional === 'fictional' && entry.isFictionalScenario);

    return matchesSearch && matchesRegion && matchesType && matchesStatus && matchesFictional;
  });

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Filter Toolbar Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        {/* Search */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search country/acronym..."
            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Region */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Mission Type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mandate Type</label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Classification */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Context Classification</label>
          <select
            value={showFictional}
            onChange={(e) => onShowFictionalChange(e.target.value as 'all' | 'real' | 'fictional')}
            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Contexts</option>
            <option value="real">Real UN Mission Seeds</option>
            <option value="fictional">Fictional Training Scenarios</option>
          </select>
        </div>
      </div>

      {/* Grid List representation */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 flex flex-col gap-2.5">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 italic bg-white border border-slate-200 rounded-xl">
            No planning contexts match the selected filters.
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = selectedEntryId === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelectEntry(entry.id)}
                className={`
                  w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-start gap-4 focus:outline-none
                  ${isSelected
                    ? 'border-blue-600 bg-blue-50/45 shadow-sm ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }
                `}
              >
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      {entry.missionAcronym}
                    </span>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase">|</span>
                    <span className="text-xs font-semibold text-slate-700">{entry.country}</span>
                    {entry.isFictionalScenario ? (
                      <Badge variant="rose" className="text-[8px] uppercase tracking-wider py-0.5 leading-none">
                        Fictional Scenario
                      </Badge>
                    ) : (
                      <Badge variant="blue" className="text-[8px] uppercase tracking-wider py-0.5 leading-none">
                        UN Seed Context
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-xs text-slate-500 leading-tight font-medium">
                    {entry.missionName}
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">
                    Region: {entry.region} | Type: {entry.missionType}
                  </span>
                </div>
                <div className="shrink-0 flex items-center justify-center p-2 rounded-lg bg-slate-50 border border-slate-100 font-extrabold text-[9px] text-blue-600 uppercase tracking-wider">
                  Select
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
