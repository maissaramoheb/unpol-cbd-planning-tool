import React, { useId } from 'react';
import { MissionExplorerEntry } from '../types/explorer';
import { resolvePlanningContext } from '../lib/planningContext';
import { getSearchMatchReason } from '../lib/explorerFilters';
import { Badge } from '../ui/Badge';
import { Check } from 'lucide-react';

interface MissionExplorerListProps {
  entries: MissionExplorerEntry[];
  filterOptionsEntries: MissionExplorerEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  hoveredEntryId: string | null;
  onHoverEntry: (id: string | null) => void;
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
  selectedVerification?: 'all' | 'current-reference' | 'review-required' | 'training-only';
  onVerificationChange?: (val: 'all' | 'current-reference' | 'review-required' | 'training-only') => void;
  compareIds?: string[];
  onToggleCompare?: (id: string) => void;
}

export const MissionExplorerList: React.FC<MissionExplorerListProps> = ({
  entries,
  filterOptionsEntries,
  selectedEntryId,
  onSelectEntry,
  hoveredEntryId,
  onHoverEntry,
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  showFictional,
  onShowFictionalChange,
  selectedVerification = 'all',
  onVerificationChange,
  compareIds = [],
  onToggleCompare
}) => {
  const fieldIdPrefix = useId();

  // Extract unique regions, types, and statuses for filter dropdowns
  const regions = Array.from(new Set(filterOptionsEntries.map((entry) => entry.region).filter(Boolean)));
  const types = Array.from(new Set(filterOptionsEntries.map((entry) => entry.missionType).filter(Boolean)));
  const statuses = Array.from(new Set(filterOptionsEntries.map((entry) => entry.status).filter(Boolean)));

  const formatStatus = (status: string) => status.replaceAll('-', ' ');
  const getCoverageBadge = (entry: MissionExplorerEntry) => {
    if (entry.coverageScope === 'current-peacekeeping-reference') {
      return {
        label: 'Current UN Peacekeeping reference',
        variant: 'green' as const
      };
    }
    if (entry.isFictionalScenario) {
      return {
        label: 'Fictional Scenario',
        variant: 'rose' as const
      };
    }
    return {
      label: 'Unofficial starter planning profile',
      variant: 'blue' as const
    };
  };

  const getVerificationBadge = (entry: MissionExplorerEntry) => {
    const ctx = resolvePlanningContext(entry.id);
    const vStatus = ctx?.verificationStatus ?? (entry.isFictionalScenario ? 'training-only' : 'review-required');
    switch (vStatus) {
      case 'current-reference':
        return { label: 'Verified reference', variant: 'green' as const };
      case 'review-required':
        return { label: 'Review required', variant: 'amber' as const };
      case 'training-only':
        return { label: 'Training scenario', variant: 'slate' as const };
      case 'custom':
      default:
        return { label: 'Custom', variant: 'blue' as const };
    }
  };

  const quickFilterOptions: Array<{
    id: 'all' | 'current-reference' | 'review-required' | 'training-only';
    label: string;
  }> = [
    { id: 'all', label: 'All Contexts' },
    { id: 'current-reference', label: 'Current Reference' },
    { id: 'review-required', label: 'Review Required' },
    { id: 'training-only', label: 'Training Scenario' }
  ];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* Quick Filter Chips */}
      {onVerificationChange && (
        <div className="flex flex-wrap items-center gap-1.5 px-0.5" role="group" aria-label="Quick filters">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Quick filter:</span>
          {quickFilterOptions.map((opt) => {
            const isActive = selectedVerification === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onVerificationChange(opt.id)}
                aria-pressed={isActive}
                className={`
                  text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors border
                  ${isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Toolbar Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        {/* Search */}
        <div className="flex flex-col gap-1">
          <label htmlFor={`${fieldIdPrefix}-search`} className="text-xs font-bold text-slate-700">Search</label>
          <input
            id={`${fieldIdPrefix}-search`}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Country, acronym, question..."
            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Region */}
        <div className="flex flex-col gap-1">
          <label htmlFor={`${fieldIdPrefix}-region`} className="text-xs font-bold text-slate-700">Region</label>
          <select
            id={`${fieldIdPrefix}-region`}
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
          <label htmlFor={`${fieldIdPrefix}-type`} className="text-xs font-bold text-slate-700">Mandate type</label>
          <select
            id={`${fieldIdPrefix}-type`}
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
          <label htmlFor={`${fieldIdPrefix}-status`} className="text-xs font-bold text-slate-700">Status</label>
          <select
            id={`${fieldIdPrefix}-status`}
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </select>
        </div>

        {/* Classification */}
        <div className="flex flex-col gap-1">
          <label htmlFor={`${fieldIdPrefix}-classification`} className="text-xs font-bold text-slate-700">Context classification</label>
          <select
            id={`${fieldIdPrefix}-classification`}
            value={showFictional}
            onChange={(e) => onShowFictionalChange(e.target.value as 'all' | 'real' | 'fictional')}
            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Contexts</option>
            <option value="real">Reference and starter profiles</option>
            <option value="fictional">Fictional Training Scenarios</option>
          </select>
        </div>
      </div>

      {/* Grid List representation */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 flex flex-col gap-2.5">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 italic bg-white border border-slate-200 rounded-xl">
            No planning contexts match the selected filters.
          </div>
        ) : (
          entries.map((entry) => {
            const isSelected = selectedEntryId === entry.id;
            const isHovered = hoveredEntryId === entry.id;
            const isCompared = compareIds.includes(entry.id);
            const coverageBadge = getCoverageBadge(entry);
            const verificationBadge = getVerificationBadge(entry);
            const matchReason = getSearchMatchReason(entry, searchQuery);

            return (
              <div
                key={entry.id}
                onMouseEnter={() => onHoverEntry(entry.id)}
                onMouseLeave={() => onHoverEntry(null)}
                className={`
                  w-full p-3.5 rounded-xl border transition-colors duration-150 motion-reduce:transition-none flex justify-between items-start gap-3
                  ${isSelected
                    ? 'border-blue-600 bg-blue-50/45 shadow-sm ring-1 ring-blue-500/20'
                    : isHovered
                      ? 'border-blue-300 bg-blue-50/25'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }
                `}
              >
                {/* Main clickable area to inspect context */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`Inspect ${entry.missionAcronym} (${entry.country})`}
                  onClick={() => onSelectEntry(entry.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectEntry(entry.id);
                    }
                  }}
                  className="flex-1 flex flex-col gap-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-lg p-0.5"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      {entry.missionAcronym}
                    </span>
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase">|</span>
                    <span className="text-xs font-semibold text-slate-700">{entry.country}</span>
                    <Badge variant={coverageBadge.variant} className="text-[10px] py-0.5 leading-none">
                      {coverageBadge.label}
                    </Badge>
                    <Badge variant={verificationBadge.variant} className="text-[10px] py-0.5 leading-none">
                      {verificationBadge.label}
                    </Badge>
                  </div>
                  <h4 className="text-xs text-slate-600 leading-tight font-medium">
                    {entry.missionName}
                  </h4>
                  <span className="text-[11px] text-slate-600 font-semibold mt-0.5 block">
                    {entry.region} · {entry.sourceCategory}
                  </span>
                  {matchReason && (
                    <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80 inline-block mt-1 self-start">
                      {matchReason}
                    </span>
                  )}
                </div>

                {/* Secondary Actions */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {onToggleCompare && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompare(entry.id);
                      }}
                      aria-pressed={isCompared}
                      aria-label={`${isCompared ? 'Remove' : 'Add'} ${entry.missionAcronym} ${isCompared ? 'from' : 'to'} comparison`}
                      className={`
                        px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring
                        ${isCompared
                          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                        }
                      `}
                    >
                      <span className={`w-3 h-3 rounded flex items-center justify-center border text-[9px] ${isCompared ? 'bg-white text-blue-600 border-white' : 'border-slate-400 bg-white'}`}>
                        {isCompared && <Check size={10} strokeWidth={3} />}
                      </span>
                      <span>Compare</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectEntry(entry.id)}
                    aria-label={`Inspect ${entry.missionAcronym}`}
                    className={`
                      px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider transition-colors
                      ${isSelected
                        ? 'text-blue-700 bg-blue-100/60'
                        : 'text-slate-400 hover:text-slate-600'
                      }
                    `}
                  >
                    {isSelected ? 'Inspecting' : 'Inspect'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
