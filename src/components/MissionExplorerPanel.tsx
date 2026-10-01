import React, { useId, useState } from 'react';
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
  const tabId = useId();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  if (!entry) {
    return (
      <Card className="h-full border-border-default bg-surface-subtle p-6 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surface-base border border-border-default flex items-center justify-center text-action-link shadow-sm">
          <BookOpen size={24} />
        </div>
        <div className="text-center">
          <h4 className="text-sm font-extrabold text-text-primary">Select a planning context</h4>
          <p className="text-xs text-text-secondary mt-1.5 max-w-xs mx-auto leading-relaxed">
            Review a selected reference entry, starter profile, or training scenario before starting a plan.
          </p>
        </div>
        <div className="grid w-full max-w-xs grid-cols-1 gap-2 text-left text-xs text-text-secondary">
          <div className="flex items-start gap-2 rounded-lg bg-surface-base p-2.5 ring-1 ring-focus-ring">
            <Search size={14} className="mt-0.5 shrink-0 text-action-link" />
            Search or filter the available planning contexts.
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-surface-base p-2.5 ring-1 ring-focus-ring">
            <MapPinned size={14} className="mt-0.5 shrink-0 text-action-link" />
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
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-subtle text-text-muted border border-border-default">
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
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-status-info-bg text-action-link border border-status-info-border hover:bg-status-info-bg hover:text-action-link transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring"
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
    <Card className="h-full border-border-default bg-surface-base shadow-sm flex flex-col overflow-hidden">
      {/* Header Bar */}
      <CardHeader className="border-b border-border-subtle pb-3 flex flex-col gap-2 shrink-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-text-primary uppercase tracking-tight">
                {entry.missionAcronym}
              </span>
              <span className="text-xs text-text-muted font-bold">|</span>
              <span className="text-xs font-bold text-text-secondary">{entry.country}</span>
            </div>
            <h4 className="text-xs text-text-secondary font-semibold leading-snug mt-1">
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
          <Badge variant="slate" className="text-[10px] bg-surface-subtle text-text-secondary border-border-default">
            {entry.status.replaceAll('-', ' ')}
          </Badge>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex border-b border-border-default -mx-4 -mb-3 px-4 pt-2 gap-1 overflow-x-auto bg-surface-subtle" role="tablist" aria-label="Planning context details" onKeyDown={event => {
          const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
          const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
          const direction = document.documentElement.dir === 'rtl' ? -1 : 1;
          let next = current;
          if (event.key === 'ArrowRight') next = (current + direction + tabs.length) % tabs.length;
          else if (event.key === 'ArrowLeft') next = (current - direction + tabs.length) % tabs.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = tabs.length - 1;
          else return;
          event.preventDefault(); tabs[next]?.focus(); tabs[next]?.click();
        }}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            id={`${tabId}-overview`} aria-controls={`${tabId}-panel`} tabIndex={activeTab === 'overview' ? 0 : -1}
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-action-link text-action-link bg-surface-base'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'signals'}
            id={`${tabId}-signals`} aria-controls={`${tabId}-panel`} tabIndex={activeTab === 'signals' ? 0 : -1}
            onClick={() => setActiveTab('signals')}
            className={`px-2.5 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'signals'
                ? 'border-action-link text-action-link bg-surface-base'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Planning Signals
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sources'}
            id={`${tabId}-sources`} aria-controls={`${tabId}-panel`} tabIndex={activeTab === 'sources' ? 0 : -1}
            onClick={() => setActiveTab('sources')}
            className={`px-2.5 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'sources'
                ? 'border-action-link text-action-link bg-surface-base'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Sources</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-surface-hover text-text-secondary">
              {sourcesList.length}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'preview'}
            id={`${tabId}-preview`} aria-controls={`${tabId}-panel`} tabIndex={activeTab === 'preview' ? 0 : -1}
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'border-action-link text-action-link bg-surface-base'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Starter Preview
          </button>
        </div>
      </CardHeader>

      {/* Main Tab View Content */}
      <CardBody role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-${activeTab}`} tabIndex={0} className="p-4 flex-1 overflow-y-auto xl:max-h-[560px] flex flex-col gap-4 text-xs leading-relaxed">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4">
            {/* Disclaimer / Notice */}
            <div className="p-3 border border-status-warning-border bg-status-warning-bg text-xs text-status-warning rounded-lg flex items-start gap-2.5 leading-relaxed">
              <ShieldAlert size={15} className="text-status-warning shrink-0 mt-0.5" />
              <p className="font-semibold italic">{entry.disclaimer}</p>
            </div>

            {/* Mandate Summary Statement */}
            <div className="flex flex-col gap-1.5 bg-surface-subtle p-3 rounded-lg border border-border-default">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-xs text-text-primary uppercase tracking-wide">
                  Mandate / Operational Context
                </span>
                {context?.reference ? renderSourceBadges(context.reference.mandateSummary.sourceIds) : null}
              </div>
              <p className="text-text-secondary italic leading-relaxed mt-1">
                &ldquo;
                {context?.reference?.mandateSummary.text || entry.starterProfile.mandateEnvironment}
                &rdquo;
              </p>
            </div>

            {/* Police / CBD Relevance Statement */}
            <div className="flex flex-col gap-1.5 bg-surface-subtle p-3 rounded-lg border border-border-default">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-xs text-text-primary uppercase tracking-wide">
                  Police / CBD Relevance
                </span>
                {context?.reference ? renderSourceBadges(context.reference.policeRelevance.sourceIds) : null}
              </div>
              <p className="text-text-secondary leading-relaxed mt-1">
                {context?.reference?.policeRelevance.text ||
                  'Specialized advisory focus on institutional police development, executive law enforcement mentorship, and community-oriented reform.'}
              </p>
            </div>

            {/* Host-State Police Institution Statement */}
            <div className="flex flex-col gap-1.5 bg-surface-subtle p-3 rounded-lg border border-border-default">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-xs text-text-primary uppercase tracking-wide">
                  Host-State Police / Counterpart
                </span>
                {context?.reference ? renderSourceBadges(context.reference.hostStatePolice.sourceIds) : null}
              </div>
              <p className="text-text-secondary font-semibold leading-relaxed mt-1">
                {context?.reference?.hostStatePolice.text || entry.hostStatePoliceInstitution || 'To be verified'}
              </p>
            </div>

            {/* Context Identity Metadata */}
            <div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-3 text-[11px]">
              <div>
                <span className="font-bold text-text-secondary block">Mission Type</span>
                <span className="text-text-primary font-semibold">{entry.missionType}</span>
              </div>
              <div>
                <span className="font-bold text-text-secondary block">Region</span>
                <span className="text-text-primary font-semibold">{entry.region}</span>
              </div>
              <div>
                <span className="font-bold text-text-secondary block">Source Category</span>
                <span className="text-text-primary font-semibold">{entry.sourceCategory}</span>
              </div>
              <div>
                <span className="font-bold text-text-secondary block">Last Reviewed</span>
                <span className="text-text-primary font-semibold">{entry.profileLastReviewed || 'Pending review'}</span>
              </div>
            </div>

            {/* Mandate Themes */}
            {entry.planningThemes && entry.planningThemes.length > 0 && (
              <div className="border-t border-border-subtle pt-3">
                <span className="font-bold text-text-secondary block mb-1">Planning Themes</span>
                <div className="flex flex-wrap gap-1">
                  {entry.planningThemes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="bg-surface-subtle text-text-secondary px-2 py-0.5 rounded text-[10px] font-medium border border-border-default"
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
            <div className="p-3 border border-status-info-border bg-status-info-bg rounded-lg flex items-start gap-2.5 leading-relaxed text-action-link">
              <Compass size={16} className="text-action-link shrink-0 mt-0.5" />
              <div>
                <h5 className="font-black text-xs uppercase tracking-wider text-action-link">
                  Planning Questions — Not Analyst Findings
                </h5>
                <p className="text-[11px] text-action-link mt-0.5 leading-normal">
                  These investigation prompts guide your situational inquiry. They are prompts to verify in the field, not pre-assessed findings, ratings, or stakeholder positions.
                </p>
              </div>
            </div>

            {/* Stage 1 Profile Guidance */}
            <div className="flex flex-col gap-2">
              <span className="font-bold text-xs text-text-primary uppercase tracking-wider">
                Stage 1 — Profile Guidance Prompts
              </span>
              <div className="space-y-2 pl-2 border-l-2 border-status-info-border text-xs">
                {stage1Guidance.mandateEnvironmentPrompt && (
                  <div>
                    <span className="font-semibold text-text-secondary">Mandate guidance: </span>
                    <span className="text-text-secondary italic">&ldquo;{stage1Guidance.mandateEnvironmentPrompt}&rdquo;</span>
                  </div>
                )}
                {stage1Guidance.conflictContextPrompt && (
                  <div>
                    <span className="font-semibold text-text-secondary">Conflict context prompt: </span>
                    <span className="text-text-secondary italic">&ldquo;{stage1Guidance.conflictContextPrompt}&rdquo;</span>
                  </div>
                )}
                {stage1Guidance.planningPurposePrompt && (
                  <div>
                    <span className="font-semibold text-text-secondary">Planning purpose prompt: </span>
                    <span className="text-text-secondary italic">&ldquo;{stage1Guidance.planningPurposePrompt}&rdquo;</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stage 2 PESTEL-S Diagnostic Questions */}
            <div className="flex flex-col gap-2 border-t border-border-subtle pt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-text-primary uppercase tracking-wider">
                  Stage 2 — PESTEL-S Diagnostic Questions (7 Factors)
                </span>
                <span className="text-[10px] text-text-muted font-medium">Why it matters included</span>
              </div>
              <div className="space-y-3 pl-2 border-l-2 border-border-default">
                {Object.keys(pestelPrompts).map((key) => {
                  const item = pestelPrompts[key];
                  return (
                    <div key={key} className="text-xs leading-relaxed">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-text-primary uppercase tracking-wide">{key}</span>
                      </div>
                      <p className="text-text-secondary mt-0.5">{item.prompt}</p>
                      {item.whyPrompt && (
                        <p className="text-[11px] text-text-muted italic mt-0.5">
                          <strong>Why this matters:</strong> {item.whyPrompt}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage 3 Suggested Stakeholders */}
            <div className="flex flex-col gap-2 border-t border-border-subtle pt-3">
              <span className="font-bold text-xs text-text-primary uppercase tracking-wider">
                Stage 3 — Candidate Actors & Categories to Verify
              </span>
              <p className="text-[11px] text-text-secondary">
                Candidate institutions and local actors to verify in the field. When added to your plan, all stakeholder postures, influence levels, and engagement strategies start unassessed for your determination.
              </p>
              {suggestedStakeholders.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {suggestedStakeholders.map((actor, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-subtle text-text-secondary border border-border-default"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              )}
              {stakeholderPrompts.length > 0 && (
                <div className="space-y-2 mt-2 pl-2 border-l-2 border-border-default text-xs text-text-secondary">
                  {stakeholderPrompts.map((prompt, idx) => (
                    <div key={idx} className="flex flex-col gap-0.5">
                      <div>
                        <span className="font-bold text-text-primary">{prompt.category}: </span>
                        <span>{prompt.rolePrompt}</span>
                      </div>
                      {prompt.suggestedStakeholders && prompt.suggestedStakeholders.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5 pl-2">
                          {prompt.suggestedStakeholders.map((name, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-surface-subtle text-text-secondary border border-border-default font-medium"
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
            <div className="bg-surface-subtle p-3 rounded-lg border border-border-default flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-xs text-text-primary">Context Provenance & Currency</span>
                <Badge variant={verificationBadge.variant} className="text-[10px]">
                  {verificationBadge.label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-text-secondary">
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
              <span className="font-bold text-xs text-text-primary uppercase tracking-wider">
                Document Sources ({sourcesList.length})
              </span>
              {sourcesList.length === 0 ? (
                <div className="p-3 text-xs text-text-muted italic bg-surface-subtle border border-border-default rounded-lg">
                  No external document sources attached to this fictional training scenario.
                </div>
              ) : (
                <div className="space-y-2">
                  {sourcesList.map((src) => (
                    <div
                      key={src.id}
                      className="p-3 rounded-lg border border-border-default bg-surface-base shadow-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-action-link bg-status-info-bg px-1.5 py-0.5 rounded border border-status-info-border">
                              {src.id}
                            </span>
                            <span className="text-[11px] font-bold text-text-primary">{src.organization}</span>
                          </div>
                          <h6 className="text-xs font-semibold text-text-primary mt-1">{src.title}</h6>
                        </div>
                        {src.url ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-action-link hover:text-action-link p-1 hover:bg-status-info-bg rounded transition-colors shrink-0"
                            title="Open external source"
                            aria-label={`Open source: ${src.title}`}
                          >
                            <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-text-muted flex-wrap mt-0.5">
                        {src.publicationDate && <span>Published: {src.publicationDate}</span>}
                        {src.reviewedDate && <span>· Reviewed: {src.reviewedDate}</span>}
                        <span>· Type: {src.sourceType.replaceAll('-', ' ')}</span>
                      </div>

                      {src.supports && src.supports.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mt-1">
                          <span className="text-[10px] text-text-muted font-medium">Supports:</span>
                          {src.supports.map((statementKey) => (
                            <span
                              key={statementKey}
                              className="text-[9px] font-semibold bg-surface-subtle text-text-secondary px-1.5 py-0.2 rounded border border-border-default"
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
              <div className="flex flex-col gap-2 border-t border-border-subtle pt-3">
                <span className="font-bold text-xs text-text-primary uppercase tracking-wider">
                  Scope Boundaries & Limitations
                </span>
                <div className="space-y-1 pl-2 border-l-2 border-border-default text-xs text-text-secondary">
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
              <h5 className="font-bold text-xs text-text-primary uppercase tracking-wider">
                What happens if I start a plan from this context?
              </h5>
              <p className="text-xs text-text-secondary mt-1">
                The UNPOL planning tool strictly separates source-backed reference metadata from your independent analytical judgement.
              </p>
            </div>

            {/* Real vs. Fictional Banner */}
            {entry.isFictionalScenario ? (
              <div className="p-2.5 rounded-lg bg-accent-purple-bg border border-accent-purple-border text-xs text-accent-purple flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5 text-accent-purple" />
                <p>
                  <strong>Fictional Scenario:</strong> Designed strictly for classroom exercises and methodology training. Fictional facts and simulated counterparts are provided for testing.
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-status-success-bg border border-status-success-border text-xs text-status-success flex items-start gap-2">
                <ShieldCheck size={14} className="shrink-0 mt-0.5 text-status-success" />
                <p>
                  <strong>Real Mission Reference:</strong> Sourced from public UN documents. The analyst must independently assess and verify all current operational facts.
                </p>
              </div>
            )}

            {/* 3 Structured Columns / Cards */}
            <div className="space-y-3">
              {/* Will prefill */}
              <div className="p-3 rounded-lg border border-border-default bg-surface-base flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-status-success font-bold text-xs">
                  <CheckCircle2 size={14} />
                  <span>Will Prefill in Stage 1</span>
                </div>
                <ul className="text-xs text-text-secondary space-y-1 pl-5 list-disc">
                  <li>Country / Area: {entry.country}</li>
                  <li>Mission Name: {entry.missionAcronym} — {entry.missionName}</li>
                  <li>Mandate Environment reference summary</li>
                  <li>Host-state police counterpart name</li>
                  <li>Today&apos;s date as assessment baseline</li>
                </ul>
              </div>

              {/* Will provide as guidance */}
              <div className="p-3 rounded-lg border border-border-default bg-surface-base flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-action-link font-bold text-xs">
                  <Compass size={14} />
                  <span>Will Provide as Guidance Prompts</span>
                </div>
                <ul className="text-xs text-text-secondary space-y-1 pl-5 list-disc">
                  <li>Stage 1 investigation cues (mandate, conflict, purpose)</li>
                  <li>Stage 2 PESTEL-S diagnostic verification cues across all 7 factors</li>
                  <li>Stage 3 suggested counterpart actor names to verify in the field</li>
                </ul>
              </div>

              {/* Analyst assessment required */}
              <div className="p-3 rounded-lg border border-border-default bg-surface-base flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-status-warning font-bold text-xs">
                  <AlertTriangle size={14} />
                  <span>Analyst Assessment Required (No Default Data Created)</span>
                </div>
                <ul className="text-xs text-text-secondary space-y-1 pl-5 list-disc">
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
        <div className="border-t border-border-subtle pt-3 mt-auto shrink-0">
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
