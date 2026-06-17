import React, { useMemo, useState } from 'react';
import { MissionExplorerEntry } from '../types/explorer';
import { defaultExplorerSeeds, PEACEKEEPING_REFERENCE_NOTICE } from '../data/explorerSeeds';
import { MissionExplorerMap } from './MissionExplorerMap';
import { MissionExplorerList } from './MissionExplorerList';
import { MissionExplorerPanel } from './MissionExplorerPanel';
import { Button } from '../ui/Button';
import { AlertTriangle, Globe, List, X } from 'lucide-react';
import { filterMissionExplorerEntries } from '../lib/explorerFilters';

interface MissionExplorerProps {
  onUseProfile: (entry: MissionExplorerEntry) => void;
  onClose: () => void;
}

export const MissionExplorer: React.FC<MissionExplorerProps> = ({ onUseProfile, onClose }) => {
  // UI State
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFictional, setShowFictional] = useState<'all' | 'real' | 'fictional'>('all');

  const filteredEntries = useMemo(
    () =>
      filterMissionExplorerEntries(defaultExplorerSeeds, {
        searchQuery,
        selectedRegion,
        selectedType,
        selectedStatus,
        showFictional
      }),
    [searchQuery, selectedRegion, selectedType, selectedStatus, showFictional]
  );

  const selectedEntry = filteredEntries.find((entry) => entry.id === selectedEntryId) || null;
  const shownCount = filteredEntries.length;
  const totalCount = defaultExplorerSeeds.length;

  const handleFilterChange = (updateFilter: () => void) => {
    updateFilter();
    setSelectedEntryId(null);
    setHoveredEntryId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-explorer-title"
        className="w-full max-w-7xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div>
              <h2 id="mission-explorer-title" className="text-sm sm:text-base font-black uppercase tracking-wider">
                Unofficial UNPOL Planning Context Explorer
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest leading-none mt-1">
                Selected starters, training scenarios, and peacekeeping reference entries
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Mission Explorer"
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Close Explorer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs leading-relaxed text-amber-950">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-700" />
            <p>
              <strong>Coverage notice:</strong> {PEACEKEEPING_REFERENCE_NOTICE} Selected non-peacekeeping starter profiles are not comprehensive DPPA/SPM coverage.
            </p>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Middle: Map & List Lookup */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold">
                Showing {shownCount} of {totalCount} contexts
              </span>
              <span className="text-slate-600">
                Filters apply to both the map pins and the list.
              </span>
            </div>

            {/* Tablet toggle; compact mobile remains list-first */}
            <div className="hidden sm:flex justify-between items-center lg:hidden bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
              <span className="text-xs font-bold text-slate-500 pl-2">Display Mode:</span>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'map' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="text-[10px] py-1 px-3"
                >
                  <Globe size={12} className="mr-1" />
                  World Map
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="text-[10px] py-1 px-3"
                >
                  <List size={12} className="mr-1" />
                  Search List
                </Button>
              </div>
            </div>

            {/* Render Map / List based on viewMode */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Map panel: desktop always visible, tablet toggle, compact mobile hidden */}
              <div className={`${viewMode === 'map' ? 'hidden sm:block' : 'hidden'} lg:block`}>
                <MissionExplorerMap
                  entries={filteredEntries}
                  selectedEntryId={selectedEntryId}
                  onSelectEntry={setSelectedEntryId}
                  hoveredEntryId={hoveredEntryId}
                  onHoverEntry={setHoveredEntryId}
                />
              </div>

              {/* List and filters: desktop always visible and compact mobile default */}
              <div className={`${viewMode === 'list' ? 'block' : 'hidden'} lg:block flex-1`}>
                <MissionExplorerList
                  entries={filteredEntries}
                  filterOptionsEntries={defaultExplorerSeeds}
                  selectedEntryId={selectedEntryId}
                  onSelectEntry={setSelectedEntryId}
                  hoveredEntryId={hoveredEntryId}
                  onHoverEntry={setHoveredEntryId}
                  searchQuery={searchQuery}
                  onSearchChange={(value) => handleFilterChange(() => setSearchQuery(value))}
                  selectedRegion={selectedRegion}
                  onRegionChange={(value) => handleFilterChange(() => setSelectedRegion(value))}
                  selectedType={selectedType}
                  onTypeChange={(value) => handleFilterChange(() => setSelectedType(value))}
                  selectedStatus={selectedStatus}
                  onStatusChange={(value) => handleFilterChange(() => setSelectedStatus(value))}
                  showFictional={showFictional}
                  onShowFictionalChange={(value) => handleFilterChange(() => setShowFictional(value))}
                />
              </div>
            </div>
          </div>

          {/* Right Area: Selected Detail Pane */}
          <div className="lg:col-span-1 h-full min-h-[320px]">
            <MissionExplorerPanel
              entry={selectedEntry}
              onUseProfile={onUseProfile}
              onClearSelection={() => setSelectedEntryId(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
