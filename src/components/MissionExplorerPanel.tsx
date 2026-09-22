import React, { useState } from 'react';
import { MissionExplorerEntry, ContextSource } from '../types/explorer';
import { resolvePlanningContext } from '../lib/planningContext';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  ShieldAlert,
  BookOpen,
  ArrowRight,
  Search,
  MapPinned,
  ExternalLink,
  FileText,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck
} from 'lucide-react';

interface MissionExplorerPanelProps {
  entry: MissionExplorerEntry | null;
  onUseProfile: (entry: MissionExplorerEntry) => void;
  onClearSelection: () => void;
}

type TabKey = 'overview' | 'signals' | 'sources' | 'preview';

export const MissionExplorerPanel: React.FC<MissionExplorerPanelProps> = ({
  entry,
  onUseProfile,
  onClearSelection
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  if (!entry) {
    return (
      <Card className="h-full border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
          <BookOpen size={24} />
        </div>
        <div className="text-center">
          <h4 className="text-sm font-extrabold text-slate-900">Select a planning context</h4>
          <p className="text-xs text-slate-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Review a selected reference entry, starter profile, or training scenario before starting a plan.
          </p>
        </div>
        <div className="grid w-full max-w-xs grid-cols-1 gap-2 text-left text-xs text-slate-700">
          <div className="flex items-start gap-2 rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
            <Search size={14} className="mt-0.5 shrink-0 text-blue-600" />
            Search or filter the available planning contexts.
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
            <MapPinned size={14} className="mt-0.5 shrink-0 text-blue-600" />
            Select a list entry or map location to inspect sources, guidance, and boundaries.
          </div>
        </div>
      </Card>
    );
  }

  const context = resolvePlanningContext(entry.id);

  // Coverage badge
  const coverageBadge = (() => {
    if (entry.coverageScope === 'current-peacekeeping-reference') {
      return { label: 'Current UN Peacekeeping reference', variant: 'green' as const };
    }
    if (entry.isFictionalScenario) {
      return { label: 'Fictional Training Scenario', variant: 'rose' as const };
    }
    return { label: 'Unofficial starter planning profile', variant: 'blue' as const };
  })();

  // Verification status badge
  const verificationBadge = (() => {
    const status = context?.verificationStatus ?? (entry.isFictionalScenario ? 'training-only' : 'review-required');
    switch (status) {
      case 'current-reference':
        return { label: 'Current reference', variant: 'green' as const };
      case 'custom':
        return { label: 'Custom', variant: 'blue' as const };
      case 'training-only':
        return { label: 'Training scenario', variant: 'slate' as const };
      case 'review-required':
      default:
        return { label: 'Review required', variant: 'amber' as const };
    }
  })();

  const sourcesList: ContextSource[] = context?.provenance?.sources ?? [];
  const limitationsList: string[] = context?.provenance?.limitations ?? (entry.sourceNote ? [entry.sourceNote] : []);

  // Statement source badge renderer
  const renderSourceBadges = (sourceIds: string[]) => {
    if (!sourceIds || sourceIds.length === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
          Verification required
        </span>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 flex-wrap">
        {sourceIds.map((srcId) => {
          const matchedSource = sourcesList.find((s) => s.id === srcId);
          const label = matchedSource ? matchedSource.title.split('—')[0].split(':')[0].trim() : srcId;
          return (
            <button
              key={srcId}
              type="button"
              onClick={() => setActiveTab('sources')}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              title={matchedSource ? `${matchedSource.title} (${matchedSource.organization})` : srcId}
            >
              <FileText size={10} className="shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const pestelPrompts = context?.planningPrompts?.pestelsPrompts ?? entry.starterPestelsPrompts ?? {};
  const stage1Guidance = context?.planningPrompts?.stage1Guidance ?? {
    mandateEnvironmentPrompt: entry.starterProfile?.mandateEnvironment,
    conflictContextPrompt: entry.starterProfile?.conflictContext,
    planningPurposePrompt: entry.starterProfile?.planningPurpose
  };
  const suggestedStakeholders =
    context?.planningPrompts?.suggestedStakeholderCategories ?? entry.suggestedStakeholderCategories ?? [];
  const stakeholderPrompts =
    context?.planningPrompts?.stakeholderPrompts ?? entry.starterStakeholderPrompts ?? [];

  return (
    <Card className="h-full border-slate-200 bg-white shadow-sm flex flex-col justify-between overflow-hidden">
      {/* Header Bar */}
      <CardHeader className="border-b border-slate-100 pb-3 flex flex-col gap-2 shrink-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {entry.missionAcronym}
              </span>
              <span className="text-xs text-slate-500 font-bold">|</span>
              <span className="text-xs font-bold text-slate-600">{entry.country}</span>
            </div>
            <h4 className="text-xs text-slate-700 font-semibold leading-snug mt-1">
              {entry.missionName}
            </h4>
          </div>
          <Button
            variant="tertiary"
            size="sm"
            onClick={onClearSelection}
            aria-label={`Clear selected profile ${entry.missionAcronym}`}
          >
            Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1">
          <Badge variant={coverageBadge.variant} className="text-[10px]">
            {coverageBadge.label}
          </Badge>
          <Badge variant={verificationBadge.variant} className="text-[10px]">
            {verificationBadge.label}
          </Badge>
          <Badge variant="slate" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">
            {entry.status.replaceAll('-', ' ')}
          </Badge>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex border-b border-slate-200 -mx-4 -mb-3 px-4 pt-2 gap-1 bg-slate-50/70" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'signals'}
            onClick={() => setActiveTab('signals')}
            className={`px-2.5 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'signals'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Planning Signals
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sources'}
            onClick={() => setActiveTab('sources')}
            className={`px-2.5 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'sources'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Sources</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700">
              {sourcesList.length}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'preview'}
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Starter Preview
          </button>
        </div>
      </CardHeader>

      {/* Main Tab View Content */}
      <CardBody className="p-4 flex-1 overflow-y-auto max-h-[440px] flex flex-col gap-4 text-xs leading-relaxed">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4">
            {/* Disclaimer / Notice */}
            <div className="p-3 border border-amber-200 bg-amber-50/60 text-xs text-amber-900 rounded-xl flex items-start gap-2.5 leading-relaxed">
              <ShieldAlert size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="font-semibold italic">{entry.disclaimer}</p>
            </div>

            {/* Mandate Summary Statement */}
            <div className="flex flex-col gap-1.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Mandate / Operational Context
                </span>
                {context?.reference ? renderSourceBadges(context.reference.mandateSummary.sourceIds) : null}
              </div>
              <p className="text-slate-700 italic leading-relaxed mt-1">
                &ldquo;
                {context?.reference?.mandateSummary.text || entry.starterProfile.mandateEnvironment}
                &rdquo;
              </p>
            </div>

            {/* Police / CBD Relevance Statement */}
            <div className="flex flex-col gap-1.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Police / CBD Relevance
                </span>
                {context?.reference ? renderSourceBadges(context.reference.policeRelevance.sourceIds) : null}
              </div>
              <p className="text-slate-700 leading-relaxed mt-1">
                {context?.reference?.policeRelevance.text ||
                  'Specialized advisory focus on institutional police development, executive law enforcement mentorship, and community-oriented reform.'}
              </p>
            </div>

            {/* Host-State Police Institution Statement */}
            <div className="flex flex-col gap-1.5 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Host-State Police / Counterpart
                </span>
                {context?.reference ? renderSourceBadges(context.reference.hostStatePolice.sourceIds) : null}
              </div>
              <p className="text-slate-700 font-semibold leading-relaxed mt-1">
                {context?.reference?.hostStatePolice.text || entry.hostStatePoliceInstitution || 'To be verified'}
              </p>
            </div>

            {/* Context Identity Metadata */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-[11px]">
              <div>
                <span className="font-bold text-slate-600 block">Mission Type</span>
                <span className="text-slate-800 font-semibold">{entry.missionType}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600 block">Region</span>
                <span className="text-slate-800 font-semibold">{entry.region}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600 block">Source Category</span>
                <span className="text-slate-800 font-semibold">{entry.sourceCategory}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600 block">Last Reviewed</span>
                <span className="text-slate-800 font-semibold">{entry.profileLastReviewed || 'Pending review'}</span>
              </div>
            </div>

            {/* Mandate Themes */}
            {entry.planningThemes && entry.planningThemes.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-600 block mb-1">Planning Themes</span>
                <div className="flex flex-wrap gap-1">
                  {entry.planningThemes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PLANNING SIGNALS */}
        {activeTab === 'signals' && (
          <div className="flex flex-col gap-4">
            {/* Institutional Framing Notice */}
            <div className="p-3 border border-blue-200 bg-blue-50/60 rounded-xl flex items-start gap-2.5 leading-relaxed text-blue-950">
              <Compass size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-black text-xs uppercase tracking-wider text-blue-900">
                  Planning Questions — Not Analyst Findings
                </h5>
                <p className="text-[11px] text-blue-800 mt-0.5 leading-normal">
                  These investigation prompts guide your situational inquiry. They are prompts to verify in the field, not pre-assessed findings, ratings, or stakeholder positions.
                </p>
              </div>
            </div>

            {/* Stage 1 Profile Guidance */}
            <div className="flex flex-col gap-2">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Stage 1 — Profile Guidance Prompts
              </span>
              <div className="space-y-2 pl-2 border-l-2 border-blue-200 text-xs">
                {stage1Guidance.mandateEnvironmentPrompt && (
                  <div>
                    <span className="font-semibold text-slate-700">Mandate guidance: </span>
                    <span className="text-slate-600 italic">&ldquo;{stage1Guidance.mandateEnvironmentPrompt}&rdquo;</span>
                  </div>
                )}
                {stage1Guidance.conflictContextPrompt && (
                  <div>
                    <span className="font-semibold text-slate-700">Conflict context prompt: </span>
                    <span className="text-slate-600 italic">&ldquo;{stage1Guidance.conflictContextPrompt}&rdquo;</span>
                  </div>
                )}
                {stage1Guidance.planningPurposePrompt && (
                  <div>
                    <span className="font-semibold text-slate-700">Planning purpose prompt: </span>
                    <span className="text-slate-600 italic">&ldquo;{stage1Guidance.planningPurposePrompt}&rdquo;</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stage 2 PESTEL-S Diagnostic Questions */}
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Stage 2 — PESTEL-S Diagnostic Questions (7 Factors)
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Why it matters included</span>
              </div>
              <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                {Object.keys(pestelPrompts).map((key) => {
                  const item = pestelPrompts[key];
                  return (
                    <div key={key} className="text-xs leading-relaxed">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 uppercase tracking-wide">{key}</span>
                      </div>
                      <p className="text-slate-700 mt-0.5">{item.prompt}</p>
                      {item.whyPrompt && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          <strong>Why this matters:</strong> {item.whyPrompt}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage 3 Suggested Stakeholders */}
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Stage 3 — Candidate Actors & Categories to Verify
              </span>
              <p className="text-[11px] text-slate-600">
                Candidate institutions and local actors to verify in the field. When added to your plan, all stakeholder postures, influence levels, and engagement strategies start unassessed for your determination.
              </p>
              {suggestedStakeholders.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {suggestedStakeholders.map((actor, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              )}
              {stakeholderPrompts.length > 0 && (
                <div className="space-y-2 mt-2 pl-2 border-l-2 border-slate-200 text-xs text-slate-600">
                  {stakeholderPrompts.map((prompt, idx) => (
                    <div key={idx} className="flex flex-col gap-0.5">
                      <div>
                        <span className="font-bold text-slate-800">{prompt.category}: </span>
                        <span>{prompt.rolePrompt}</span>
                      </div>
                      {prompt.suggestedStakeholders && prompt.suggestedStakeholders.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5 pl-2">
                          {prompt.suggestedStakeholders.map((name, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SOURCES & CURRENCY */}
        {activeTab === 'sources' && (
          <div className="flex flex-col gap-4">
            {/* Provenance Overview */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-xs text-slate-800">Context Provenance & Currency</span>
                <Badge variant={verificationBadge.variant} className="text-[10px]">
                  {verificationBadge.label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="font-semibold block">Last Reviewed:</span>
                  <span>{entry.profileLastReviewed || 'Not independently verified'}</span>
                </div>
                <div>
                  <span className="font-semibold block">Coverage Scope:</span>
                  <span>{entry.coverageScope.replaceAll('-', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Document Sources List */}
            <div className="flex flex-col gap-2">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Document Sources ({sourcesList.length})
              </span>
              {sourcesList.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 italic bg-slate-50 border border-slate-200 rounded-lg">
                  No external document sources attached to this fictional training scenario.
                </div>
              ) : (
                <div className="space-y-2">
                  {sourcesList.map((src) => (
                    <div
                      key={src.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {src.id}
                            </span>
                            <span className="text-[11px] font-bold text-slate-800">{src.organization}</span>
                          </div>
                          <h6 className="text-xs font-semibold text-slate-900 mt-1">{src.title}</h6>
                        </div>
                        {src.url ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors shrink-0"
                            title="Open external source"
                            aria-label={`Open source: ${src.title}`}
                          >
                            <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap mt-0.5">
                        {src.publicationDate && <span>Published: {src.publicationDate}</span>}
                        {src.reviewedDate && <span>· Reviewed: {src.reviewedDate}</span>}
                        <span>· Type: {src.sourceType.replaceAll('-', ' ')}</span>
                      </div>

                      {src.supports && src.supports.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mt-1">
                          <span className="text-[10px] text-slate-500 font-medium">Supports:</span>
                          {src.supports.map((statementKey) => (
                            <span
                              key={statementKey}
                              className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200"
                            >
                              {statementKey}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scope Boundaries & Limitations */}
            {limitationsList.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Scope Boundaries & Limitations
                </span>
                <div className="space-y-1 pl-2 border-l-2 border-slate-200 text-xs text-slate-600">
                  {limitationsList.map((lim, idx) => (
                    <p key={idx}>• {lim}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STARTER PREVIEW */}
        {activeTab === 'preview' && (
          <div className="flex flex-col gap-4">
            <div>
              <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                What happens if I start a plan from this context?
              </h5>
              <p className="text-xs text-slate-600 mt-1">
                The UNPOL planning tool strictly separates source-backed reference metadata from your independent analytical judgement.
              </p>
            </div>

            {/* Real vs. Fictional Banner */}
            {entry.isFictionalScenario ? (
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5 text-purple-600" />
                <p>
                  <strong>Fictional Scenario:</strong> Designed strictly for classroom exercises and methodology training. Fictional facts and simulated counterparts are provided for testing.
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <ShieldCheck size={14} className="shrink-0 mt-0.5 text-emerald-600" />
                <p>
                  <strong>Real Mission Reference:</strong> Sourced from public UN documents. The analyst must independently assess and verify all current operational facts.
                </p>
              </div>
            )}

            {/* 3 Structured Columns / Cards */}
            <div className="space-y-3">
              {/* Will prefill */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 size={14} />
                  <span>Will Prefill in Stage 1</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                  <li>Country / Area: {entry.country}</li>
                  <li>Mission Name: {entry.missionAcronym} — {entry.missionName}</li>
                  <li>Mandate Environment reference summary</li>
                  <li>Host-state police counterpart name</li>
                  <li>Today&apos;s date as assessment baseline</li>
                </ul>
              </div>

              {/* Will provide as guidance */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                  <Compass size={14} />
                  <span>Will Provide as Guidance Prompts</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                  <li>Stage 1 investigation cues (mandate, conflict, purpose)</li>
                  <li>Stage 2 PESTEL-S diagnostic verification cues across all 7 factors</li>
                  <li>Stage 3 suggested counterpart actor names to verify in the field</li>
                </ul>
              </div>

              {/* Analyst assessment required */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                  <AlertTriangle size={14} />
                  <span>Analyst Assessment Required (No Default Data Created)</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                  <li>No analyst PESTEL-S findings or assessed ratings are created.</li>
                  <li>No stakeholder records, positions, influence ratings, or engagement strategies</li>
                  <li>No SWOT findings or TOWS strategic options</li>
                  <li>No CBD matrix capacity cells or prioritized interventions</li>
                  <li>No sequencing recommendations or results implementation activities</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Button - Always Present in CardBody Footer */}
        <div className="border-t border-slate-100 pt-3 mt-auto shrink-0">
          <Button
            variant="primary"
            fullWidth
            onClick={() => onUseProfile(entry)}
            className="font-bold py-2.5 text-xs shadow-sm"
          >
            <ArrowRight size={14} className="mr-1.5" />
            Start a Plan from This Context
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
