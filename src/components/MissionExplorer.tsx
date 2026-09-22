import React, { useMemo, useRef, useState } from 'react';
import { MissionExplorerEntry } from '../types/explorer';
import { UnpolProjectData } from '../types';
import { defaultExplorerSeeds, PEACEKEEPING_REFERENCE_NOTICE } from '../data/explorerSeeds';
import { MissionExplorerMap } from './MissionExplorerMap';
import { MissionExplorerList } from './MissionExplorerList';
import { MissionExplorerPanel } from './MissionExplorerPanel';
import { Button } from '../ui/Button';
import { AlertTriangle, Globe, List, X } from 'lucide-react';
import { filterMissionExplorerEntries } from '../lib/explorerFilters';
import { hasMeaningfulWork } from '../lib/planningContext';
import { useDialogA11y } from '../ui/useDialogA11y';

interface MissionExplorerProps {
  currentData?: UnpolProjectData | null;
  onUseProfile: (entry: MissionExplorerEntry) => void;
  onClose: () => void;
}

export const MissionExplorer: React.FC<MissionExplorerProps> = ({
  currentData,
  onUseProfile,
  onClose
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const confirmationDialogRef = useRef<HTMLDivElement>(null);
  const confirmationInitialFocusRef = useRef<HTMLButtonElement>(null);

  // UI State
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [pendingEntry, setPendingEntry] = useState<MissionExplorerEntry | null>(null);

  // Outer Explorer dialog trap: suspended while confirmation dialog is open
  useDialogA11y({
    isOpen: !pendingEntry,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef
  });

  // Confirmation dialog trap: active while pendingEntry is present
  useDialogA11y({
    isOpen: Boolean(pendingEntry),
    onClose: () => setPendingEntry(null),
    containerRef: confirmationDialogRef,
    initialFocusRef: confirmationInitialFocusRef
  });

  const hasExistingWork = hasMeaningfulWork(currentData);

  const handleConfirmStartPlan = () => {
    if (pendingEntry) {
      onUseProfile(pendingEntry);
      setPendingEntry(null);
    }
  };

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
        ref={dialogRef}
        role="dialog"
        aria-modal={!pendingEntry ? 'true' : undefined}
        aria-hidden={pendingEntry ? true : undefined}
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
          <Button
            ref={closeButtonRef}
            variant="quiet"
            size="icon"
            onClick={onClose}
            aria-label="Close Mission Explorer"
            className="text-slate-400 hover:text-white hover:bg-slate-800"
            title="Close Explorer"
          >
            <X size={18} />
          </Button>
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
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-bold block text-sm text-slate-900">
                  Showing {shownCount} of {totalCount} contexts
                </span>
                <span className="text-slate-500 font-medium mt-0.5 block leading-normal">
                  11 current UN Peacekeeping references · selected starter profiles · fictional training scenarios
                </span>
              </div>
              <span className="text-slate-600 text-[10px] font-semibold bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shrink-0">
                Filters apply to both the map pins and the list.
              </span>
            </div>

            {/* Tablet toggle; compact mobile remains list-first */}
            <div className="hidden sm:flex justify-between items-center lg:hidden bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
              <span className="text-xs font-bold text-slate-500 pl-2">Display Mode:</span>
              <div className="flex gap-1" role="group" aria-label="Select display mode">
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => setViewMode('map')}
                  aria-pressed={viewMode === 'map'}
                >
                  <Globe size={12} className="mr-1" />
                  World Map
                </Button>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
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
              onUseProfile={(entry) => setPendingEntry(entry)}
              onClearSelection={() => setSelectedEntryId(null)}
            />
          </div>
        </div>
      </div>

      {/* Safe Initialization Confirmation Modal */}
      {pendingEntry && (
        <div
          className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            ref={confirmationDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-plan-dialog-title"
            aria-describedby="confirm-plan-dialog-desc"
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4"
          >
            {hasExistingWork ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 id="confirm-plan-dialog-title" className="text-sm font-black text-slate-900">
                      Existing Plan Detected
                    </h3>
                    <span className="text-xs text-amber-800 font-semibold">
                      Current analytical work will be replaced
                    </span>
                  </div>
                </div>

                <div id="confirm-plan-dialog-desc" className="text-xs text-slate-700 leading-relaxed bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-2">
                  <p>
                    Your current workspace contains recorded analyst findings, stakeholder assessments, or CBD planning data.
                  </p>
                  <p className="font-semibold text-amber-950">
                    Starting a new plan from <strong>{pendingEntry.missionAcronym || pendingEntry.missionName}</strong> will initialize a fresh workspace and replace your current data.
                  </p>
                  <p className="text-[11px] text-amber-900 italic">
                    Export or save your current plan first if you need to retain it.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    ref={confirmationInitialFocusRef}
                    variant="tertiary"
                    size="sm"
                    onClick={() => setPendingEntry(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    onClick={handleConfirmStartPlan}
                  >
                    Replace Workspace & Start Plan
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 id="confirm-plan-dialog-title" className="text-sm font-black text-slate-900">
                      Start Plan from {pendingEntry.missionAcronym || pendingEntry.missionName}?
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {pendingEntry.country} · {pendingEntry.missionType}
                    </span>
                  </div>
                </div>

                <div id="confirm-plan-dialog-desc" className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <p>
                    This will set up your workspace profile with reference metadata from <strong>{pendingEntry.missionName}</strong> and provide planning prompts for your investigation.
                  </p>
                  <p className="font-medium text-slate-800">
                    No analyst PESTEL-S findings or assessed ratings are created. Stage findings, stakeholders, and CBD matrices will remain unassessed for your analysis.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    ref={confirmationInitialFocusRef}
                    variant="tertiary"
                    size="sm"
                    onClick={() => setPendingEntry(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConfirmStartPlan}
                  >
                    Start New Plan
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
