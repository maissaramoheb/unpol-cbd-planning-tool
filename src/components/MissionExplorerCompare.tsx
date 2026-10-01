import React, { useState } from 'react';
import { PlanningContext } from '../types/explorer';
import {
  getContextDifferences,
  getContextSourceCoverage,
  getPlanningThemeGroups,
  getStakeholderCategoryGroups,
  getTransferCheckQuestions,
  hasMixedOperationalStatus,
  normalizeComparisonTerm
} from '../lib/contextComparison';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Layers,
  Minus,
  Shield,
  Users
} from 'lucide-react';

interface MissionExplorerCompareProps {
  contexts: PlanningContext[];
  onBack: () => void;
}

export const MissionExplorerCompare: React.FC<MissionExplorerCompareProps> = ({
  contexts,
  onBack
}) => {
  const [expandedFactor, setExpandedFactor] = useState<Record<string, boolean>>({
    political: true,
    economic: true,
    social: true,
    technological: true,
    environmental: true,
    legal: true,
    security: true
  });
  const [expandedSourceLedger, setExpandedSourceLedger] = useState<Record<string, boolean>>({});

  const differences = getContextDifferences(contexts);
  const isMixed = hasMixedOperationalStatus(contexts);
  const themeGroups = getPlanningThemeGroups(contexts);
  const stakeholderGroups = getStakeholderCategoryGroups(contexts);
  const transferQuestions = getTransferCheckQuestions();

  // Aggregate all unique planning themes across contexts
  const allThemes: string[] = [];
  contexts.forEach((ctx) => {
    (ctx.reference.planningThemes || []).forEach((t) => {
      if (!allThemes.some((at) => normalizeComparisonTerm(at) === normalizeComparisonTerm(t))) {
        allThemes.push(t);
      }
    });
  });
  allThemes.sort((a, b) => a.localeCompare(b));

  const pestelFactors = [
    { key: 'political', label: 'Political Factor' },
    { key: 'economic', label: 'Economic Factor' },
    { key: 'social', label: 'Social Factor' },
    { key: 'technological', label: 'Technological Factor' },
    { key: 'environmental', label: 'Environmental Factor' },
    { key: 'legal', label: 'Legal Factor' },
    { key: 'security', label: 'Security Factor' }
  ];

  const getVerificationBadge = (context: PlanningContext) => {
    switch (context.verificationStatus) {
      case 'current-reference':
        return { label: 'REVIEWED REFERENCE', variant: 'green' as const };
      case 'review-required':
        return { label: 'REVIEW REQUIRED', variant: 'amber' as const };
      case 'training-only':
        return { label: 'TRAINING SCENARIO', variant: 'slate' as const };
      case 'custom':
      default:
        return { label: 'CUSTOM CONTEXT', variant: 'blue' as const };
    }
  };

  const getCoverageLabel = (scope: string) => {
    switch (scope) {
      case 'current-peacekeeping-reference':
        return 'Current UN Peacekeeping Reference';
      case 'selected-starter':
        return 'Selected Starter Profile';
      case 'training':
        return 'Training Scenario';
      default:
        return 'Custom Context';
    }
  };

  const toggleFactor = (key: string) => {
    setExpandedFactor((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSourceLedger = (contextId: string) => {
    setExpandedSourceLedger((prev) => ({ ...prev, [contextId]: !prev[contextId] }));
  };

  const gridColsClass = contexts.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-surface-subtle">
      {/* Top sticky navigation bar */}
      <div className="sticky top-0 z-20 bg-surface-base border-b border-border-default px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            className="text-xs font-semibold gap-1.5"
            aria-label="Back to Context Explorer"
          >
            <ArrowLeft size={14} />
            Back to Explorer
          </Button>
          <div className="h-5 w-px bg-surface-hover hidden sm:block" />
          <div>
            <h2 className="text-sm font-black text-text-primary uppercase tracking-wide">
              Planning Context Comparison
            </h2>
            <p className="text-[11px] text-text-muted font-medium">
              Read-only analytical reference matrix across {contexts.length} planning environments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-text-muted hidden sm:inline">
            Framing:
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-subtle text-text-secondary px-2.5 py-1 rounded-md border border-border-default">
            Compare → Understand Differences → Identify Questions to Verify
          </span>
        </div>
      </div>

      {/* Main Comparison Body */}
      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Mixed Context Notice */}
        {isMixed && (
          <div
            role="alert"
            className="p-4 rounded-lg border border-status-warning-border bg-status-warning-bg text-status-warning text-xs flex items-start gap-3"
          >
            <AlertTriangle size={18} className="text-status-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-status-warning">Mixed Context Comparison Notice</p>
              <p className="mt-0.5 leading-relaxed text-status-warning">
                You are comparing reference contexts with fictional training material.
                Use the comparison for methodological discussion, not factual equivalence.
              </p>
            </div>
          </div>
        )}

        {/* Section: Context Headers / Summary Cards */}
        <div className="bg-surface-base border border-border-default rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-action-link" />
              <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">
                Compared Planning Contexts ({contexts.length})
              </h3>
            </div>
            {differences.statusDiffers || differences.typeDiffers || differences.regionDiffers ? (
              <Badge variant="amber" className="text-[10px] font-semibold">
                Differences detected across profile fields
              </Badge>
            ) : null}
          </div>

          <div className={`grid ${gridColsClass} gap-4`}>
            {contexts.map((ctx) => {
              const vBadge = getVerificationBadge(ctx);
              return (
                <div
                  key={ctx.id}
                  className="bg-surface-subtle border border-border-default rounded-lg p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-text-primary tracking-wide">
                        {ctx.identity.missionAcronym}
                      </span>
                      <Badge variant={vBadge.variant} className="text-[10px] font-bold">
                        {vBadge.label}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-semibold text-text-primary leading-snug">
                      {ctx.identity.missionName}
                    </h4>
                    <p className="text-[11px] text-text-secondary">
                      {ctx.identity.countryArea} · {ctx.identity.region}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-border-default grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-text-muted font-medium block text-[10px] uppercase">Type</span>
                      <span className="font-semibold text-text-secondary">{ctx.identity.missionType}</span>
                    </div>
                    <div>
                      <span className="text-text-muted font-medium block text-[10px] uppercase">Status</span>
                      <span className="font-semibold text-text-secondary capitalize">{ctx.operationalStatus}</span>
                    </div>
                    <div>
                      <span className="text-text-muted font-medium block text-[10px] uppercase">Last Reviewed</span>
                      <span className="font-medium text-text-secondary">
                        {ctx.provenance.profileLastReviewed || 'Not recorded'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted font-medium block text-[10px] uppercase">Sources</span>
                      <span className="font-medium text-text-secondary">
                        {ctx.provenance.sources.length} reference records
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section A — Context Profile */}
        <section
          aria-labelledby="section-a-heading"
          className="bg-surface-base border border-border-default rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-action-link" />
              <h3 id="section-a-heading" className="text-xs font-black uppercase tracking-wider text-text-primary">
                Section A — Context Profile Comparison
              </h3>
            </div>
            <span className="text-[11px] text-text-muted font-medium">
              Mandates, counterparts, and strategic relevance
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full text-left border-collapse text-xs">
              <caption className="sr-only">Side-by-side context profile comparison</caption>
              <thead>
                <tr className="border-b border-border-default bg-surface-subtle">
                  <th scope="col" className="p-3 font-bold text-text-secondary w-1/4">Profile Dimension</th>
                  {contexts.map((ctx) => (
                    <th key={ctx.id} scope="col" className="p-3 font-black text-text-primary">
                      {ctx.identity.missionAcronym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-secondary">
                <tr>
                  <th scope="row" className="p-3 font-bold text-text-secondary bg-surface-subtle">
                    Mandate Type
                    {differences.typeDiffers && (
                      <span className="block text-[10px] font-normal text-status-warning">Differs across contexts</span>
                    )}
                  </th>
                  {contexts.map((ctx) => (
                    <td key={ctx.id} className="p-3 font-medium">
                      {ctx.identity.missionType}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-text-secondary bg-surface-subtle">
                    Region / Area
                    {differences.regionDiffers && (
                      <span className="block text-[10px] font-normal text-status-warning">Differs across contexts</span>
                    )}
                  </th>
                  {contexts.map((ctx) => (
                    <td key={ctx.id} className="p-3 font-medium">
                      {ctx.identity.region}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-text-secondary bg-surface-subtle">
                    Operational Status
                    {differences.statusDiffers && (
                      <span className="block text-[10px] font-normal text-status-warning">Differs across contexts</span>
                    )}
                  </th>
                  {contexts.map((ctx) => (
                    <td key={ctx.id} className="p-3 font-medium capitalize">
                      {ctx.operationalStatus}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-text-secondary bg-surface-subtle">
                    Verification Status
                    {differences.verificationDiffers && (
                      <span className="block text-[10px] font-normal text-status-warning">Differs across contexts</span>
                    )}
                  </th>
                  {contexts.map((ctx) => {
                    const badge = getVerificationBadge(ctx);
                    return (
                      <td key={ctx.id} className="p-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-text-secondary bg-surface-subtle">Coverage Scope</th>
                  {contexts.map((ctx) => (
                    <td key={ctx.id} className="p-3 font-medium">
                      {getCoverageLabel(ctx.provenance.coverageScope)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-text-secondary bg-surface-subtle align-top">
                    Mandate / Context Summary
                  </th>
                  {contexts.map((ctx) => {
                    const stmt = ctx.reference.mandateSummary;
                    const hasSource = stmt && Array.isArray(stmt.sourceIds) && stmt.sourceIds.length > 0;
                    return (
                      <td key={ctx.id} className="p-3 align-top leading-relaxed">
                        <p>{stmt.text}</p>
                        <div className="mt-2">
                          {hasSource ? (
                            <Badge variant="green" className="text-[10px]">
                              Supported by {stmt.sourceIds.length} source(s)
                            </Badge>
                          ) : (
                            <Badge variant="amber" className="text-[10px]">
                              Verification required
                            </Badge>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-text-secondary bg-surface-subtle align-top">
                    Police / CBD Relevance
                  </th>
                  {contexts.map((ctx) => {
                    const stmt = ctx.reference.policeRelevance;
                    const hasSource = stmt && Array.isArray(stmt.sourceIds) && stmt.sourceIds.length > 0;
                    return (
                      <td key={ctx.id} className="p-3 align-top leading-relaxed">
                        <p>{stmt.text}</p>
                        <div className="mt-2">
                          {hasSource ? (
                            <Badge variant="green" className="text-[10px]">
                              Supported by {stmt.sourceIds.length} source(s)
                            </Badge>
                          ) : (
                            <Badge variant="amber" className="text-[10px]">
                              Verification required
                            </Badge>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-text-secondary bg-surface-subtle align-top">
                    Host-State Police / Counterpart
                  </th>
                  {contexts.map((ctx) => {
                    const stmt = ctx.reference.hostStatePolice;
                    const hasSource = stmt && Array.isArray(stmt.sourceIds) && stmt.sourceIds.length > 0;
                    return (
                      <td key={ctx.id} className="p-3 align-top leading-relaxed">
                        <p>{stmt.text}</p>
                        <div className="mt-2">
                          {hasSource ? (
                            <Badge variant="green" className="text-[10px]">
                              Supported by {stmt.sourceIds.length} source(s)
                            </Badge>
                          ) : (
                            <Badge variant="amber" className="text-[10px]">
                              Verification required
                            </Badge>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Dimension-First Stacked View */}
          <div className="sm:hidden space-y-4">
            {[
              {
                title: 'Mandate Type',
                differ: differences.typeDiffers,
                getValue: (ctx: PlanningContext) => <span>{ctx.identity.missionType}</span>
              },
              {
                title: 'Region / Area',
                differ: differences.regionDiffers,
                getValue: (ctx: PlanningContext) => <span>{ctx.identity.region}</span>
              },
              {
                title: 'Operational Status',
                differ: differences.statusDiffers,
                getValue: (ctx: PlanningContext) => <span className="capitalize">{ctx.operationalStatus}</span>
              },
              {
                title: 'Verification Status',
                differ: differences.verificationDiffers,
                getValue: (ctx: PlanningContext) => {
                  const b = getVerificationBadge(ctx);
                  return <Badge variant={b.variant}>{b.label}</Badge>;
                }
              },
              {
                title: 'Mandate / Context Summary',
                differ: false,
                getValue: (ctx: PlanningContext) => {
                  const stmt = ctx.reference.mandateSummary;
                  const hasSource = stmt && Array.isArray(stmt.sourceIds) && stmt.sourceIds.length > 0;
                  return (
                    <div>
                      <p className="leading-relaxed">{stmt.text}</p>
                      <div className="mt-1">
                        {hasSource ? (
                          <Badge variant="green" className="text-[10px]">Supported by {stmt.sourceIds.length} source(s)</Badge>
                        ) : (
                          <Badge variant="amber" className="text-[10px]">Verification required</Badge>
                        )}
                      </div>
                    </div>
                  );
                }
              },
              {
                title: 'Police / CBD Relevance',
                differ: false,
                getValue: (ctx: PlanningContext) => {
                  const stmt = ctx.reference.policeRelevance;
                  const hasSource = stmt && Array.isArray(stmt.sourceIds) && stmt.sourceIds.length > 0;
                  return (
                    <div>
                      <p className="leading-relaxed">{stmt.text}</p>
                      <div className="mt-1">
                        {hasSource ? (
                          <Badge variant="green" className="text-[10px]">Supported by {stmt.sourceIds.length} source(s)</Badge>
                        ) : (
                          <Badge variant="amber" className="text-[10px]">Verification required</Badge>
                        )}
                      </div>
                    </div>
                  );
                }
              },
              {
                title: 'Host-State Police / Counterpart',
                differ: false,
                getValue: (ctx: PlanningContext) => {
                  const stmt = ctx.reference.hostStatePolice;
                  const hasSource = stmt && Array.isArray(stmt.sourceIds) && stmt.sourceIds.length > 0;
                  return (
                    <div>
                      <p className="leading-relaxed">{stmt.text}</p>
                      <div className="mt-1">
                        {hasSource ? (
                          <Badge variant="green" className="text-[10px]">Supported by {stmt.sourceIds.length} source(s)</Badge>
                        ) : (
                          <Badge variant="amber" className="text-[10px]">Verification required</Badge>
                        )}
                      </div>
                    </div>
                  );
                }
              }
            ].map((dimension) => (
              <div key={dimension.title} className="bg-surface-subtle border border-border-default rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-border-default pb-1.5">
                  <h4 className="text-xs font-bold text-text-primary">{dimension.title}</h4>
                  {dimension.differ && (
                    <span className="text-[10px] text-status-warning font-semibold">Differs</span>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  {contexts.map((ctx) => (
                    <div key={ctx.id} className="bg-surface-base border border-border-default rounded-lg p-2.5">
                      <span className="font-bold text-text-primary block text-[11px] mb-1">
                        {ctx.identity.missionAcronym}:
                      </span>
                      {dimension.getValue(ctx)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section B — Planning Themes */}
        <section
          aria-labelledby="section-b-heading"
          className="bg-surface-base border border-border-default rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-action-link" />
              <h3 id="section-b-heading" className="text-xs font-black uppercase tracking-wider text-text-primary">
                Section B — Planning Themes Matrix
              </h3>
            </div>
            <span className="text-[11px] text-text-muted font-medium">
              Exact normalized thematic overlap
            </span>
          </div>

          <div className="text-xs text-text-secondary leading-relaxed bg-surface-subtle p-3 rounded-lg border border-border-default">
            Comparison is derived strictly from exact theme matching. No semantic equivalences or scores are manufactured.
          </div>

          {/* Theme Matrix Table */}
          <div className="overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full text-left border-collapse text-xs">
              <caption className="sr-only">Planning themes presence matrix across compared contexts</caption>
              <thead>
                <tr className="border-b border-border-default bg-surface-subtle">
                  <th scope="col" className="p-3 font-bold text-text-secondary w-1/3">Planning Theme / Consideration</th>
                  {contexts.map((ctx) => (
                    <th key={ctx.id} scope="col" className="p-3 font-black text-text-primary text-center">
                      {ctx.identity.missionAcronym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-secondary">
                {allThemes.map((theme) => {
                  const norm = normalizeComparisonTerm(theme);
                  return (
                    <tr key={theme} className="hover:bg-surface-subtle">
                      <th scope="row" className="p-3 font-semibold text-text-primary">
                        {theme}
                      </th>
                      {contexts.map((ctx) => {
                        const hasTheme = (ctx.reference.planningThemes || []).some(
                          (t) => normalizeComparisonTerm(t) === norm
                        );
                        return (
                          <td key={ctx.id} className="p-3 text-center">
                            {hasTheme ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-status-info-bg text-action-link">
                                <Check size={14} aria-hidden="true" />
                                <span className="sr-only">Present in {ctx.identity.missionAcronym}</span>
                              </span>
                            ) : (
                              <span className="text-text-muted">
                                <Minus size={14} aria-hidden="true" className="mx-auto" />
                                <span className="sr-only">Not present in {ctx.identity.missionAcronym}</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Themes Summary Subpanels */}
          <div className={`grid grid-cols-1 ${contexts.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 pt-2 border-t border-border-subtle`}>
            {/* Shared Across All / Both */}
            <div className="bg-surface-subtle border border-border-default rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                {contexts.length === 2 ? 'Shared Across Both' : 'Shared Across All 3'} ({themeGroups.sharedAll.length})
              </h4>
              {themeGroups.sharedAll.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {themeGroups.sharedAll.map((p) => (
                    <span
                      key={p.term}
                      className="text-xs font-semibold px-2.5 py-1 bg-surface-base border border-status-info-border text-action-link rounded-lg shadow-2xs"
                    >
                      {p.term}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">
                  {contexts.length === 2
                    ? 'No themes shared across both contexts.'
                    : 'No themes shared universally across all 3 contexts.'}
                </p>
              )}
            </div>

            {/* Shared Across Some (relevant when 3 contexts are compared) */}
            {contexts.length === 3 && (
              <div className="bg-surface-subtle border border-border-default rounded-lg p-3.5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Shared Across Some ({themeGroups.sharedSome.length})
                </h4>
                {themeGroups.sharedSome.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {themeGroups.sharedSome.map((p) => {
                      const acronyms = p.contextIds
                        .map((id) => contexts.find((c) => c.id === id)?.identity.missionAcronym || id)
                        .join(' · ');
                      return (
                        <div
                          key={p.term}
                          className="bg-surface-base border border-border-default rounded-lg p-2 text-xs flex flex-col gap-0.5"
                        >
                          <span className="font-bold text-text-primary">{p.term}</span>
                          <span className="text-[10px] text-action-link font-semibold tracking-wide">
                            {acronyms}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">
                    No themes shared across 2 of 3 contexts.
                  </p>
                )}
              </div>
            )}

            {/* Unique by Context */}
            <div className="bg-surface-subtle border border-border-default rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Unique by Context
              </h4>
              <div className="space-y-2">
                {themeGroups.uniqueByContext.map((st) => {
                  const ctx = contexts.find((c) => c.id === st.contextId);
                  return (
                    <div key={st.contextId} className="text-xs">
                      <span className="font-bold text-text-primary block mb-1">
                        {ctx?.identity.missionAcronym}:
                      </span>
                      {st.terms.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {st.terms.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] font-medium px-2 py-0.5 bg-surface-base border border-border-default text-text-secondary rounded-md"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-text-muted italic text-[11px]">No unique themes</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section C — PESTEL-S Planning Questions */}
        <section
          aria-labelledby="section-c-heading"
          className="bg-surface-base border border-border-default rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <HelpCircle size={16} className="text-action-link" />
              <h3 id="section-c-heading" className="text-xs font-black uppercase tracking-wider text-text-primary">
                Section C — PESTEL-S Planning Questions
              </h3>
            </div>
            <span className="text-[11px] text-text-muted font-medium">
              Side-by-side strategic cues across 7 factors
            </span>
          </div>

          <div className="text-xs text-text-secondary leading-relaxed bg-status-info-bg p-3 rounded-lg border border-status-info-border">
            <strong>Methodological Note:</strong> These are context-specific questions, not comparative assessments.
            No ratings, scores, pressure levels, or findings are produced here.
          </div>

          {/* Collapsible Factor Cards */}
          <div className="space-y-3">
            {pestelFactors.map((factor) => {
              const isExpanded = expandedFactor[factor.key] ?? true;
              return (
                <div
                  key={factor.key}
                  className="border border-border-default rounded-lg overflow-hidden bg-surface-base"
                >
                  <button
                    type="button"
                    onClick={() => toggleFactor(factor.key)}
                    aria-expanded={isExpanded}
                    className="w-full flex items-center justify-between p-3.5 bg-surface-subtle hover:bg-surface-subtle text-left transition-colors"
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-text-primary">
                      {factor.label}
                    </span>
                    <span className="text-text-muted">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 border-t border-border-default bg-surface-base">
                      <div className={`grid ${gridColsClass} gap-4`}>
                        {contexts.map((ctx) => {
                          const promptInfo = ctx.planningPrompts.pestelsPrompts?.[factor.key];
                          return (
                            <div
                              key={ctx.id}
                              className="bg-surface-subtle border border-border-default rounded-lg p-3 space-y-2 text-xs"
                            >
                              <span className="font-black text-text-primary block text-[11px] uppercase tracking-wide border-b border-border-default pb-1">
                                {ctx.identity.missionAcronym}
                              </span>
                              <div>
                                <span className="font-bold text-text-secondary block text-[10px] uppercase text-text-muted">
                                  Question to Investigate:
                                </span>
                                <p className="text-text-primary leading-relaxed mt-0.5">
                                  {promptInfo?.prompt || 'No specific prompt recorded.'}
                                </p>
                              </div>
                              {promptInfo?.whyPrompt && (
                                <div className="pt-1.5 border-t border-border-default">
                                  <span className="font-bold text-text-secondary block text-[10px] uppercase text-text-muted">
                                    Why it Matters:
                                  </span>
                                  <p className="text-text-secondary leading-relaxed mt-0.5 italic">
                                    {promptInfo.whyPrompt}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section D — Stakeholder Landscape */}
        <section
          aria-labelledby="section-d-heading"
          className="bg-surface-base border border-border-default rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-action-link" />
              <h3 id="section-d-heading" className="text-xs font-black uppercase tracking-wider text-text-primary">
                Section D — Stakeholder Landscape Comparison
              </h3>
            </div>
            <span className="text-[11px] text-text-muted font-medium">
              Candidate actors & role questions without ratings
            </span>
          </div>

          <div className="text-xs text-text-secondary leading-relaxed bg-surface-subtle p-3 rounded-lg border border-border-default">
            Compares suggested categories and candidate institutions to verify during planning.
            Does not infer power, posture, capacity, or legitimacy.
          </div>

          {/* Actor Categories Summary */}
          <div className={`grid grid-cols-1 ${contexts.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
            {/* Shared Across All / Both */}
            <div className="bg-surface-subtle border border-border-default rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                {contexts.length === 2 ? 'Shared Across Both' : 'Shared Across All 3'} ({stakeholderGroups.sharedAll.length})
              </h4>
              {stakeholderGroups.sharedAll.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {stakeholderGroups.sharedAll.map((p) => (
                    <span
                      key={p.term}
                      className="text-xs font-semibold px-2.5 py-1 bg-surface-base border border-status-info-border text-action-link rounded-lg shadow-2xs"
                    >
                      {p.term}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">
                  {contexts.length === 2
                    ? 'No actor categories shared across both contexts.'
                    : 'No actor categories shared across all 3 contexts.'}
                </p>
              )}
            </div>

            {/* Shared Across Some (relevant when 3 contexts are compared) */}
            {contexts.length === 3 && (
              <div className="bg-surface-subtle border border-border-default rounded-lg p-3.5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Shared Across Some ({stakeholderGroups.sharedSome.length})
                </h4>
                {stakeholderGroups.sharedSome.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {stakeholderGroups.sharedSome.map((p) => {
                      const acronyms = p.contextIds
                        .map((id) => contexts.find((c) => c.id === id)?.identity.missionAcronym || id)
                        .join(' · ');
                      return (
                        <div
                          key={p.term}
                          className="bg-surface-base border border-border-default rounded-lg p-2 text-xs flex flex-col gap-0.5"
                        >
                          <span className="font-bold text-text-primary">{p.term}</span>
                          <span className="text-[10px] text-action-link font-semibold tracking-wide">
                            {acronyms}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">
                    No categories shared across exactly 2 contexts.
                  </p>
                )}
              </div>
            )}

            {/* Unique by Context */}
            <div className="bg-surface-subtle border border-border-default rounded-lg p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Unique by Context
              </h4>
              <div className="space-y-2">
                {stakeholderGroups.uniqueByContext.map((sc) => {
                  const ctx = contexts.find((c) => c.id === sc.contextId);
                  return (
                    <div key={sc.contextId} className="text-xs">
                      <span className="font-bold text-text-primary block mb-1">
                        {ctx?.identity.missionAcronym}:
                      </span>
                      {sc.terms.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sc.terms.map((c) => (
                            <span
                              key={c}
                              className="text-[11px] font-medium px-2 py-0.5 bg-surface-base border border-border-default text-text-secondary rounded-md"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-text-muted italic text-[11px]">No unique categories</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Candidate Actors Side-by-Side */}
          <div className={`grid ${gridColsClass} gap-4 pt-2 border-t border-border-subtle`}>
            {contexts.map((ctx) => (
              <div
                key={ctx.id}
                className="bg-surface-subtle border border-border-default rounded-lg p-4 space-y-3"
              >
                <div className="border-b border-border-default pb-2">
                  <span className="text-xs font-black uppercase text-text-primary block">
                    {ctx.identity.missionAcronym} Stakeholder Prompts
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {(ctx.planningPrompts.stakeholderPrompts || []).length} prompt categories
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {(ctx.planningPrompts.stakeholderPrompts || []).map((sp) => (
                    <div
                      key={sp.category}
                      className="bg-surface-base border border-border-default rounded-lg p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-text-primary text-xs">
                          {sp.category}
                        </span>
                      </div>
                      <p className="text-text-secondary text-[11px] leading-relaxed italic">
                        {sp.rolePrompt}
                      </p>
                      {sp.suggestedStakeholders && sp.suggestedStakeholders.length > 0 && (
                        <div className="pt-1.5 border-t border-border-subtle">
                          <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">
                            Candidate Actors to Verify:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {sp.suggestedStakeholders.map((sh) => (
                              <span
                                key={sh}
                                className="text-[10px] font-medium bg-surface-subtle text-text-secondary px-1.5 py-0.5 rounded border border-border-default"
                              >
                                {sh}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section E — Sources & Currency */}
        <section
          aria-labelledby="section-e-heading"
          className="bg-surface-base border border-border-default rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-action-link" />
              <h3 id="section-e-heading" className="text-xs font-black uppercase tracking-wider text-text-primary">
                Section E — Sources & Currency
              </h3>
            </div>
            <span className="text-[11px] text-text-muted font-medium">
              Provenance and data currency indicators
            </span>
          </div>

          <div className="text-xs text-text-secondary leading-relaxed bg-surface-subtle p-3 rounded-lg border border-border-default">
            <strong>Data-Quality Indicators:</strong> These metrics describe provenance documentation.
            They are NOT a trust score, evidence score, or confidence ranking.
          </div>

          {/* Indicators Summary Cards */}
          <div className={`grid ${gridColsClass} gap-4`}>
            {contexts.map((ctx) => {
              const coverage = getContextSourceCoverage(ctx);
              const isLedgerOpen = expandedSourceLedger[ctx.id] ?? false;
              return (
                <div
                  key={ctx.id}
                  className="bg-surface-subtle border border-border-default rounded-lg p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="border-b border-border-default pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-text-primary">
                        {ctx.identity.missionAcronym}
                      </span>
                      <span className="text-[11px] text-text-muted font-medium">
                        Last reviewed: {coverage.lastReviewed || 'Not recorded'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-surface-base border border-border-default p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-text-muted uppercase block">Sources</span>
                        <span className="text-sm font-black text-text-primary">{coverage.sourceCount}</span>
                      </div>
                      <div className="bg-surface-base border border-border-default p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-text-muted uppercase block">Limitations</span>
                        <span className="text-sm font-black text-text-primary">{coverage.limitationsCount}</span>
                      </div>
                      <div className="bg-surface-base border border-border-default p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-status-success uppercase block">Supported Stmts</span>
                        <span className="text-sm font-black text-status-success">{coverage.supportedStatementsCount}</span>
                      </div>
                      <div className="bg-surface-base border border-border-default p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-status-warning uppercase block">Review Required</span>
                        <span className="text-sm font-black text-status-warning">{coverage.unsupportedStatementsCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Source Ledger */}
                  <div className="pt-2 border-t border-border-default">
                    <button
                      type="button"
                      onClick={() => toggleSourceLedger(ctx.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-action-link hover:text-action-link py-1"
                      aria-expanded={isLedgerOpen}
                    >
                      <span>Source Ledger ({coverage.sources.length})</span>
                      {isLedgerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isLedgerOpen && (
                      <div className="mt-2 space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
                        {coverage.sources.length === 0 ? (
                          <p className="text-text-muted italic text-[11px]">No external sources catalogued.</p>
                        ) : (
                          coverage.sources.map((src) => (
                            <div
                              key={src.id}
                              className="bg-surface-base border border-border-default rounded p-2 text-[11px] space-y-1"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-semibold text-text-primary leading-snug">
                                  {src.title}
                                </span>
                                {src.url && (
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-action-link hover:text-action-link shrink-0 mt-0.5"
                                    title="Open source reference in new tab"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                              <div className="text-text-muted flex flex-wrap gap-2 text-[10px]">
                                <span>{src.organization}</span>
                                <span>·</span>
                                <span>{src.publicationDate || 'Undated'}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section F — Transfer Check */}
        <section
          aria-labelledby="section-f-heading"
          className="bg-surface-base border border-border-default rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-action-link" />
              <h3 id="section-f-heading" className="text-xs font-black uppercase tracking-wider text-text-primary">
                Section F — Transfer Check
              </h3>
            </div>
            <span className="text-[11px] text-text-muted font-medium">
              Methodological checklist before cross-context lesson transfer
            </span>
          </div>

          <div className="text-xs text-text-secondary leading-relaxed bg-surface-subtle p-3.5 rounded-lg border border-border-default space-y-1">
            <h4 className="font-bold text-text-primary">
              Questions Before Applying Lessons Across Contexts
            </h4>
            <p className="text-text-secondary">
              This is a static methodological checklist to verify whether conditions are genuinely comparable.
              These questions are not scored or automatically answered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {transferQuestions.map((tq, index) => (
              <div
                key={tq.id}
                className="bg-surface-subtle border border-border-default rounded-lg p-3.5 space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-action-link block">
                    {index + 1}. {tq.category}
                  </span>
                  <p className="text-xs font-semibold text-text-primary leading-snug mt-1">
                    {tq.question}
                  </p>
                </div>
                <span className="text-[10px] text-text-muted italic block pt-1 border-t border-border-default">
                  Verification check for analyst judgement
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
