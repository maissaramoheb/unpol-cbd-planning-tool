'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { ModuleTabs } from './ModuleTabs';
import { Dashboard } from './Dashboard';
import { MissionProfile } from './MissionProfile';
import { SituationalAnalysis } from './SituationalAnalysis';
import { StakeholderMapping } from './StakeholderMapping';
import { CBDMatrix } from '../matrix/CBDMatrix';
import { PrioritySequencing } from './PrioritySequencing';
import { ExportBrief } from './ExportBrief';
import { MissionExplorer } from './MissionExplorer';
import { applyMissionSeed } from '../lib/applyMissionSeed';
import { UnpolProjectData, MissionProfile as ProfileType, PestelsItem, Stakeholder, CbdCell, PriorityBrief } from '../types';
import { loadProjectData, saveProjectData, getInitialProjectData } from '../lib/storage';
import { matrixRows, matrixColumns } from '../data/cbdMatrixData';

export const AppShell: React.FC = () => {
  const [data, setData] = useState<UnpolProjectData | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);

  // Initialize data on client mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loadProjectData());
  }, []);

  // Sync with localStorage on changes
  useEffect(() => {
    if (data) {
      saveProjectData(data);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-600">Initializing UNPOL CBD Planning Framework...</span>
        </div>
      </div>
    );
  }

  const handleProfileChange = (newProfile: ProfileType) => {
    setData({
      ...data,
      profile: newProfile
    });
  };

  const handleTemplateChange = (templateId: string) => {
    if (confirm('Switching templates will reset all current findings. Would you like to proceed?')) {
      const freshData = getInitialProjectData(templateId);
      setData(freshData);
      setCurrentStep(1);
    }
  };

  const handlePestelsChange = (id: string, updatedItem: PestelsItem) => {
    setData({
      ...data,
      pestels: {
        ...data.pestels,
        [id]: updatedItem
      }
    });
  };

  const handleAddStakeholder = (newStakeholder: Stakeholder) => {
    setData({
      ...data,
      stakeholders: [...data.stakeholders, newStakeholder]
    });
  };

  const handleUpdateStakeholder = (updatedStakeholder: Stakeholder) => {
    setData({
      ...data,
      stakeholders: data.stakeholders.map(s => s.id === updatedStakeholder.id ? updatedStakeholder : s)
    });
  };

  const handleDeleteStakeholder = (id: string) => {
    setData({
      ...data,
      stakeholders: data.stakeholders.filter(s => s.id !== id)
    });
  };

  const handleUpdateCell = (key: string, updatedCell: CbdCell) => {
    setData({
      ...data,
      customCells: {
        ...data.customCells,
        [key]: updatedCell
      }
    });
  };

  const handlePriorityBriefChange = (newBrief: PriorityBrief) => {
    setData({
      ...data,
      priorityBrief: newBrief
    });
  };

  const handleResetModule = () => {
    if (!confirm('Are you sure you want to reset the current step module to its default configurations?')) {
      return;
    }

    const fresh = getInitialProjectData(data.profile.templateId);

    switch (currentStep) {
      case 1:
        if (confirm('This will wipe all modifications and reset the entire planning project. Continue?')) {
          setData(fresh);
        }
        break;
      case 2:
        setData({ ...data, profile: fresh.profile });
        break;
      case 3:
        setData({ ...data, pestels: fresh.pestels });
        break;
      case 4:
        setData({ ...data, stakeholders: fresh.stakeholders });
        break;
      case 5:
        setData({ ...data, customCells: fresh.customCells });
        break;
      case 6:
        setData({ ...data, priorityBrief: fresh.priorityBrief });
        break;
      case 7:
        if (confirm('This will wipe all modifications and reset the entire planning project. Continue?')) {
          setData(fresh);
          setCurrentStep(1);
        }
        break;
      default:
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Dashboard
            data={data}
            onNavigateToStep={setCurrentStep}
            onOpenExplorer={() => setIsExplorerOpen(true)}
          />
        );
      case 2:
        return (
          <MissionProfile
            profile={data.profile}
            onChange={handleProfileChange}
            onTemplateChange={handleTemplateChange}
            onOpenExplorer={() => setIsExplorerOpen(true)}
            onNext={() => setCurrentStep(3)}
          />
        );
      case 3:
        return (
          <SituationalAnalysis
            pestels={data.pestels}
            onChange={handlePestelsChange}
            onNext={() => setCurrentStep(4)}
            onPrev={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <StakeholderMapping
            stakeholders={data.stakeholders}
            onAdd={handleAddStakeholder}
            onUpdate={handleUpdateStakeholder}
            onDelete={handleDeleteStakeholder}
            onNext={() => setCurrentStep(5)}
            onPrev={() => setCurrentStep(3)}
          />
        );
      case 5:
        return (
          <CBDMatrix
            rows={matrixRows}
            columns={matrixColumns}
            customCells={data.customCells}
            pestels={data.pestels}
            stakeholders={data.stakeholders}
            onUpdateCell={handleUpdateCell}
            onNext={() => setCurrentStep(6)}
            onPrev={() => setCurrentStep(4)}
          />
        );
      case 6:
        return (
          <PrioritySequencing
            brief={data.priorityBrief}
            customCells={data.customCells}
            onChange={handlePriorityBriefChange}
            onNext={() => setCurrentStep(7)}
            onPrev={() => setCurrentStep(5)}
          />
        );
      case 7:
        return (
          <ExportBrief
            data={data}
            onImportSuccess={(imported) => {
              setData(imported);
              setCurrentStep(7);
            }}
            onPrev={() => setCurrentStep(6)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 print:bg-white print:text-black">
      {/* Top Header */}
      <Header
        onReset={handleResetModule}
        missionName={data.profile.missionName}
        analystName={data.profile.analystName}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 print:py-0 print:px-0">
        {/* Step Tabs Indicator (Hidden in print) */}
        <div className="print:hidden">
          <ModuleTabs currentStep={currentStep} onStepChange={setCurrentStep} />
        </div>

        {/* Active Module Panel */}
        <div className="flex-1">
          {renderStepContent()}
        </div>
      </main>

      {/* Footer (Hidden in print) */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-center text-xs print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex flex-col gap-3">
          <p className="font-semibold text-slate-300">
            Educational planning-support framework developed by <span className="text-white">Lt.Col Maissara Selim</span>
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
            This tool is an educational and planning-support prototype. It is not official United Nations doctrine and does not replace mission mandate, official guidance, host-state law, human rights due diligence, command approval, or verified country analysis. Users should verify all context-specific findings through official and current sources before operational or policy use.
          </p>
          <div className="mt-2 text-slate-400 font-bold bg-slate-800/50 inline-block px-3 py-1 rounded-full border border-slate-800/80 mx-auto">
            v0.3.0 — Visual Workspace & Mission Explorer Upgrade
          </div>
        </div>
      </footer>

      {isExplorerOpen && (
        <MissionExplorer
          onUseProfile={(entry) => {
            const seeded = applyMissionSeed(entry);
            setData(seeded);
            setIsExplorerOpen(false);
            setCurrentStep(1); // Redirect to Dashboard
          }}
          onClose={() => setIsExplorerOpen(false)}
        />
      )}
    </div>
  );
};
