import React from 'react';
import { MissionExplorerEntry } from '../types/explorer';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ShieldAlert, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

interface MissionExplorerPanelProps {
  entry: MissionExplorerEntry | null;
  onUseProfile: (entry: MissionExplorerEntry) => void;
  onClearSelection: () => void;
}

export const MissionExplorerPanel: React.FC<MissionExplorerPanelProps> = ({
  entry,
  onUseProfile,
  onClearSelection
}) => {
  if (!entry) {
    return (
      <Card className="h-full border-dashed border-slate-300 bg-slate-50/20 text-center p-6 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
          <BookOpen size={24} />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">No Context Selected</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Select a point on the map or choose an entry from the search list to inspect planning parameters.
          </p>
        </div>
      </Card>
    );
  }

  const formattedStatus = entry.status.replaceAll('-', ' ');

  return (
    <Card className="h-full border-slate-200 bg-white shadow-sm flex flex-col justify-between">
      <CardHeader className="border-b border-slate-100 pb-3 flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {entry.missionAcronym}
              </span>
              <span className="text-[10px] text-slate-300 font-bold">|</span>
              <span className="text-xs font-bold text-slate-600">{entry.country}</span>
            </div>
            <h4 className="text-[11px] text-slate-500 font-semibold leading-tight mt-0.5">
              {entry.missionName}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            aria-label={`Clear selected profile ${entry.missionAcronym}`}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider leading-none"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1">
          {entry.isFictionalScenario ? (
            <Badge variant="rose" className="text-[8px] uppercase tracking-wider">
              Fictional Training Context
            </Badge>
          ) : (
            <Badge variant="blue" className="text-[8px] uppercase tracking-wider">
              Unofficial starter planning profile
            </Badge>
          )}
          <Badge variant="slate" className="text-[8px] uppercase tracking-wider bg-slate-100 text-slate-650 border-slate-200">
            {formattedStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto max-h-[460px] flex flex-col gap-4 text-xs leading-relaxed">
        {/* Scenario Warning Disclaimer */}
        <div className="p-3 border border-amber-200 bg-amber-50/40 text-[10px] text-amber-800 rounded-xl flex items-start gap-2.5 leading-relaxed">
          <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="font-semibold italic">{entry.disclaimer}</p>
        </div>

        {/* Mandate & Conflict Overview */}
        <div className="flex flex-col gap-1.5">
          <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
            Mandate Environment Guidance
          </span>
          <p className="text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 italic">
            &ldquo;{entry.starterProfile.mandateEnvironment}&rdquo;
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
            Conflict Context Assumptions
          </span>
          <p className="text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 italic">
            &ldquo;{entry.starterProfile.conflictContext}&rdquo;
          </p>
        </div>

        {/* Specific Fields */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-[11px]">
          <div>
            <span className="font-bold text-slate-500 block">Host-State Police force</span>
            <span className="text-slate-800 font-semibold">{entry.hostStatePoliceInstitution || 'N/A'}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block">Mandate Themes</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {entry.planningThemes.map((t, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded text-[9px] font-semibold border border-slate-150">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* PESTEL-S verify prompts previews */}
        <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
          <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
            PESTEL-S Verification Prompts (Starter)
          </span>
          <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-slate-200">
            {Object.keys(entry.starterPestelsPrompts).slice(0, 3).map((key) => {
              const p = entry.starterPestelsPrompts[key];
              return (
                <div key={key} className="text-[10px]">
                  <span className="font-bold text-slate-700 uppercase">{key}:</span>{' '}
                  <span className="text-slate-500">{p.prompt}</span>
                </div>
              );
            })}
            {Object.keys(entry.starterPestelsPrompts).length > 3 && (
              <span className="text-[9px] text-slate-400 font-bold italic">
                + {Object.keys(entry.starterPestelsPrompts).length - 3} more prompts will be loaded...
              </span>
            )}
          </div>
        </div>

        {/* Source note */}
        {entry.sourceNote && (
          <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-500 flex items-start gap-1">
            <AlertCircle size={10} className="shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span><strong>Source note:</strong> {entry.sourceNote}</span>
              <span><strong>Source date:</strong> {entry.sourceDate || 'Not provided'}</span>
              <span><strong>Profile last reviewed:</strong> {entry.profileLastReviewed || 'Not independently verified'}</span>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="border-t border-slate-100 pt-4 mt-2">
          <Button
            variant="primary"
            onClick={() => onUseProfile(entry)}
            className="w-full py-2.5 font-bold flex items-center justify-center gap-1.5 text-xs rounded-xl shadow-md shadow-blue-500/10"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            Use This Starter Profile
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
