import React from 'react';
import { MissionExplorerEntry } from '../types/explorer';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ShieldAlert, BookOpen, AlertCircle, ArrowRight, Search, MapPinned } from 'lucide-react';

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
      <Card className="h-full border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
          <BookOpen size={24} />
        </div>
        <div className="text-center">
          <h4 className="text-sm font-extrabold text-slate-900">Select a planning context</h4>
          <p className="text-xs text-slate-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Review a selected starter profile before loading its editable prompts into the workspace.
          </p>
        </div>
        <div className="grid w-full max-w-xs grid-cols-1 gap-2 text-left text-xs text-slate-700">
          <div className="flex items-start gap-2 rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
            <Search size={14} className="mt-0.5 shrink-0 text-blue-600" />
            Search or filter the available starter contexts.
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
            <MapPinned size={14} className="mt-0.5 shrink-0 text-blue-600" />
            Select a list entry or map location to inspect sources and prompts.
          </div>
        </div>
      </Card>
    );
  }

  const formattedStatus = entry.status.replaceAll('-', ' ');
  const formattedCoverageScope = entry.coverageScope.replaceAll('-', ' ');

  return (
    <Card className="h-full border-slate-200 bg-white shadow-sm flex flex-col justify-between">
      <CardHeader className="border-b border-slate-100 pb-3 flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {entry.missionAcronym}
              </span>
              <span className="text-xs text-slate-300 font-bold">|</span>
              <span className="text-xs font-bold text-slate-600">{entry.country}</span>
            </div>
            <h4 className="text-xs text-slate-600 font-semibold leading-snug mt-1">
              {entry.missionName}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            aria-label={`Clear selected profile ${entry.missionAcronym}`}
            className="rounded px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1">
          {entry.isFictionalScenario ? (
            <Badge variant="rose" className="text-[10px]">
              Fictional Training Context
            </Badge>
          ) : (
            <Badge variant="blue" className="text-[10px]">
              Unofficial starter planning profile
            </Badge>
          )}
          <Badge variant="slate" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">
            {formattedStatus}
          </Badge>
          <Badge variant="slate" className="text-[10px] bg-white text-slate-700 border-slate-200">
            {entry.sourceCategory}
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="p-4 flex-1 overflow-y-auto max-h-[460px] flex flex-col gap-4 text-xs leading-relaxed">
        {/* Scenario Warning Disclaimer */}
        <div className="p-3 border border-amber-200 bg-amber-50/60 text-xs text-amber-900 rounded-xl flex items-start gap-2.5 leading-relaxed">
          <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="font-semibold italic">{entry.disclaimer}</p>
        </div>

        {/* Mandate & Conflict Overview */}
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-xs text-slate-700">
            Mandate Environment Guidance
          </span>
          <p className="text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 italic">
            &ldquo;{entry.starterProfile.mandateEnvironment}&rdquo;
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-xs text-slate-700">
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
          <span className="font-bold text-xs text-slate-700">
            PESTEL-S Verification Prompts (Starter)
          </span>
          <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-slate-200">
            {Object.keys(entry.starterPestelsPrompts).slice(0, 3).map((key) => {
              const p = entry.starterPestelsPrompts[key];
              return (
                <div key={key} className="text-xs leading-relaxed">
                  <span className="font-bold text-slate-700 uppercase">{key}:</span>{' '}
                  <span className="text-slate-500">{p.prompt}</span>
                </div>
              );
            })}
            {Object.keys(entry.starterPestelsPrompts).length > 3 && (
              <span className="text-xs text-slate-500 font-semibold italic">
                + {Object.keys(entry.starterPestelsPrompts).length - 3} more prompts will be loaded...
              </span>
            )}
          </div>
        </div>

        {/* Source note */}
        {entry.sourceNote && (
          <div className="border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-blue-600" />
            <div className="flex flex-col gap-1">
              <span><strong>Source note:</strong> {entry.sourceNote}</span>
              <span><strong>Source category:</strong> {entry.sourceCategory}</span>
              <span><strong>Coverage scope:</strong> {formattedCoverageScope}</span>
              <span><strong>Source date:</strong> {entry.sourceDate || 'Not provided'}</span>
              <span><strong>Profile last reviewed:</strong> {entry.profileLastReviewed || 'Not independently verified'}</span>
              {entry.sourceUrl ? (
                <a
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Open official reference source
                </a>
              ) : null}
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
            <ArrowRight size={14} />
            Use This Starter Profile
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
