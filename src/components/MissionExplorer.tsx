import React, { useState } from 'react';
import { MissionExplorerEntry } from '../types/explorer';
import { defaultExplorerSeeds } from '../data/explorerSeeds';
import { MissionExplorerMap } from './MissionExplorerMap';
import { MissionExplorerList } from './MissionExplorerList';
import { MissionExplorerPanel } from './MissionExplorerPanel';
import { Button } from '../ui/Button';
import { Globe, List, X } from 'lucide-react';

interface MissionExplorerProps {
  onUseProfile: (entry: MissionExplorerEntry) => void;
  onClose: () => void;
}

export const MissionExplorer: React.FC<MissionExplorerProps> = ({ onUseProfile, onClose }) => {
  // UI State
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFictional, setShowFictional] = useState<'all' | 'real' | 'fictional'>('all');

  const selectedEntry = defaultExplorerSeeds.find((e) => e.id === selectedEntryId) || null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-7xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider">
                UNPOL Context & Mission Explorer
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest leading-none mt-1">
                Select baseline planning starter profile or generic training template
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white focus:outline-none"
            title="Close Explorer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Middle: Map & List Lookup */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* View Mode Toggle (Mobile / Tablet only) */}
            <div className="flex justify-between items-center lg:hidden bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
              <span className="text-xs font-bold text-slate-500 pl-2">Display Mode:</span>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'map' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="text-[10px] py-1 px-3"
                >
                  <Globe size={12} className="mr-1" />
                  Map Pin Grid
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
              {/* Map Panel (Desktop always visible, mobile responsive toggle) */}
              <div className={`${viewMode === 'map' ? 'block' : 'hidden'} lg:block`}>
                <MissionExplorerMap
                  entries={defaultExplorerSeeds}
                  selectedEntryId={selectedEntryId}
                  onSelectEntry={setSelectedEntryId}
                  hoveredEntryId={hoveredEntryId}
                  onHoverEntry={setHoveredEntryId}
                />
              </div>

              {/* List & Filters (Desktop always visible, mobile responsive toggle) */}
              <div className={`${viewMode === 'list' ? 'block' : 'hidden'} lg:block flex-1`}>
                <MissionExplorerList
                  entries={defaultExplorerSeeds}
                  selectedEntryId={selectedEntryId}
                  onSelectEntry={setSelectedEntryId}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedRegion={selectedRegion}
                  onRegionChange={setSelectedRegion}
                  selectedType={selectedType}
                  onTypeChange={setSelectedType}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  showFictional={showFictional}
                  onShowFictionalChange={setShowFictional}
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
