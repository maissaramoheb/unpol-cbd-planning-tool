import React, { useState } from 'react';
import { PlanningContext } from '../types/explorer';
import {
  getContextDifferences,
  getContextSourceCoverage,
  getContextSpecificStakeholderCategories,
  getContextSpecificThemes,
  getSharedStakeholderCategories,
  getSharedPlanningThemes,
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
  const sharedThemes = getSharedPlanningThemes(contexts);
  const specificThemes = getContextSpecificThemes(contexts);
  const sharedStakeholderCats = getSharedStakeholderCategories(contexts);
  const specificStakeholderCats = getContextSpecificStakeholderCategories(contexts);
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
        return { label: 'REAL REFERENCE', variant: 'green' as const };
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
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50/50">
      {/* Top sticky navigation bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
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
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Planning Context Comparison
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Read-only analytical reference matrix across {contexts.length} planning environments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
            Framing:
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
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
            className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-950 text-xs flex items-start gap-3"
          >
            <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Mixed Context Comparison Notice</p>
              <p className="mt-0.5 leading-relaxed text-amber-800">
                You are comparing reference contexts with fictional training material.
                Use the comparison for methodological discussion, not factual equivalence.
              </p>
            </div>
          </div>
        )}

        {/* Section: Context Headers / Summary Cards */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
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
                  className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-slate-900 tracking-wide">
                        {ctx.identity.missionAcronym}
                      </span>
                      <Badge variant={vBadge.variant} className="text-[10px] font-bold">
                        {vBadge.label}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 leading-snug">
                      {ctx.identity.missionName}
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      {ctx.identity.countryArea} · {ctx.identity.region}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Type</span>
                      <span className="font-semibold text-slate-700">{ctx.identity.missionType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Status</span>
                      <span className="font-semibold text-slate-700 capitalize">{ctx.operationalStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Last Reviewed</span>
                      <span className="font-medium text-slate-600">
                        {ctx.provenance.profileLastReviewed || 'Not recorded'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Sources</span>
                      <span className="font-medium text-slate-600">
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
          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-blue-600" />
              <h3 id="section-a-heading" className="text-xs font-black uppercase tracking-wider text-slate-900">
                Section A — Context Profile Comparison
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Mandates, counterparts, and strategic relevance
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <caption className="sr-only">Side-by-side context profile comparison</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th scope="col" className="p-3 font-bold text-slate-700 w-1/4">Profile Dimension</th>
                  {contexts.map((ctx) => (
                    <th key={ctx.id} scope="col" className="p-3 font-black text-slate-900">
                      {ctx.identity.missionAcronym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <th scope="row" className="p-3 font-bold text-slate-600 bg-slate-50/30">
                    Mandate Type
                    {differences.typeDiffers && (
                      <span className="block text-[10px] font-normal text-amber-700">Differs across contexts</span>
                    )}
                  </th>
                  {contexts.map((ctx) => (
                    <td key={ctx.id} className="p-3 font-medium">
                      {ctx.identity.missionType}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-slate-600 bg-slate-50/30">
                    Region / Area
                    {differences.regionDiffers && (
                      <span className="block text-[10px] font-normal text-amber-700">Differs across contexts</span>
                    )}
                  </th>
                  {contexts.map((ctx) => (
                    <td key={ctx.id} className="p-3 font-medium">
                      {ctx.identity.region}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-slate-600 bg-slate-50/30">
                    Operational Status
                    {differences.statusDiffers && (
                      <span className="block text-[10px] font-normal text-amber-700">Differs across contexts</span>
                    )}
                  </th>
                  {contexts.map((ctx) => (
                    <td key={ctx.id} className="p-3 font-medium capitalize">
                      {ctx.operationalStatus}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-slate-600 bg-slate-50/30">
                    Verification Status
                    {differences.verificationDiffers && (
                      <span className="block text-[10px] font-normal text-amber-700">Differs across contexts</span>
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
                  <th scope="row" className="p-3 font-bold text-slate-600 bg-slate-50/30">Coverage Scope</th>
                  {contexts.map((ctx) => (
                    <td key={ctx.id} className="p-3 font-medium">
                      {getCoverageLabel(ctx.provenance.coverageScope)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-bold text-slate-600 bg-slate-50/30 align-top">
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
                  <th scope="row" className="p-3 font-bold text-slate-600 bg-slate-50/30 align-top">
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
                  <th scope="row" className="p-3 font-bold text-slate-600 bg-slate-50/30 align-top">
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
              <div key={dimension.title} className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                  <h4 className="text-xs font-bold text-slate-800">{dimension.title}</h4>
                  {dimension.differ && (
                    <span className="text-[10px] text-amber-700 font-semibold">Differs</span>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  {contexts.map((ctx) => (
                    <div key={ctx.id} className="bg-white border border-slate-200/80 rounded-lg p-2.5">
                      <span className="font-bold text-slate-900 block text-[11px] mb-1">
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
          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              <h3 id="section-b-heading" className="text-xs font-black uppercase tracking-wider text-slate-900">
                Section B — Planning Themes Matrix
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Exact normalized thematic overlap
            </span>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            Comparison is derived strictly from exact theme matching. No semantic equivalences or scores are manufactured.
          </div>

          {/* Theme Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <caption className="sr-only">Planning themes presence matrix across compared contexts</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th scope="col" className="p-3 font-bold text-slate-700 w-1/3">Planning Theme / Consideration</th>
                  {contexts.map((ctx) => (
                    <th key={ctx.id} scope="col" className="p-3 font-black text-slate-900 text-center">
                      {ctx.identity.missionAcronym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {allThemes.map((theme) => {
                  const norm = normalizeComparisonTerm(theme);
                  return (
                    <tr key={theme} className="hover:bg-slate-50/40">
                      <th scope="row" className="p-3 font-semibold text-slate-800">
                        {theme}
                      </th>
                      {contexts.map((ctx) => {
                        const hasTheme = (ctx.reference.planningThemes || []).some(
                          (t) => normalizeComparisonTerm(t) === norm
                        );
                        return (
                          <td key={ctx.id} className="p-3 text-center">
                            {hasTheme ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700">
                                <Check size={14} aria-hidden="true" />
                                <span className="sr-only">Present in {ctx.identity.missionAcronym}</span>
                              </span>
                            ) : (
                              <span className="text-slate-300">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Shared Planning Themes ({sharedThemes.length})
              </h4>
              {sharedThemes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {sharedThemes.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-semibold px-2.5 py-1 bg-white border border-blue-200 text-blue-800 rounded-lg shadow-2xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No themes are shared universally across all {contexts.length} selected contexts.
                </p>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Context-Specific Themes
              </h4>
              <div className="space-y-2">
                {specificThemes.map((st) => {
                  const ctx = contexts.find((c) => c.id === st.contextId);
                  return (
                    <div key={st.contextId} className="text-xs">
                      <span className="font-bold text-slate-900 block mb-1">
                        {ctx?.identity.missionAcronym}:
                      </span>
                      {st.themes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {st.themes.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] font-medium px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">All themes shared</span>
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
          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HelpCircle size={16} className="text-blue-600" />
              <h3 id="section-c-heading" className="text-xs font-black uppercase tracking-wider text-slate-900">
                Section C — PESTEL-S Planning Questions
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Side-by-side strategic cues across 7 factors
            </span>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-200/70">
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
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                >
                  <button
                    type="button"
                    onClick={() => toggleFactor(factor.key)}
                    aria-expanded={isExpanded}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-100/70 text-left transition-colors"
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                      {factor.label}
                    </span>
                    <span className="text-slate-500">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 border-t border-slate-200 bg-white">
                      <div className={`grid ${gridColsClass} gap-4`}>
                        {contexts.map((ctx) => {
                          const promptInfo = ctx.planningPrompts.pestelsPrompts?.[factor.key];
                          return (
                            <div
                              key={ctx.id}
                              className="bg-slate-50/60 border border-slate-200 rounded-lg p-3 space-y-2 text-xs"
                            >
                              <span className="font-black text-slate-900 block text-[11px] uppercase tracking-wide border-b border-slate-200 pb-1">
                                {ctx.identity.missionAcronym}
                              </span>
                              <div>
                                <span className="font-bold text-slate-700 block text-[10px] uppercase text-slate-500">
                                  Question to Investigate:
                                </span>
                                <p className="text-slate-800 leading-relaxed mt-0.5">
                                  {promptInfo?.prompt || 'No specific prompt recorded.'}
                                </p>
                              </div>
                              {promptInfo?.whyPrompt && (
                                <div className="pt-1.5 border-t border-slate-200/60">
                                  <span className="font-bold text-slate-700 block text-[10px] uppercase text-slate-500">
                                    Why it Matters:
                                  </span>
                                  <p className="text-slate-600 leading-relaxed mt-0.5 italic">
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
          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              <h3 id="section-d-heading" className="text-xs font-black uppercase tracking-wider text-slate-900">
                Section D — Stakeholder Landscape Comparison
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Candidate actors & role questions without ratings
            </span>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            Compares suggested categories and candidate institutions to verify during planning.
            Does not infer power, posture, capacity, or legitimacy.
          </div>

          {/* Actor Categories Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Shared Actor Categories ({sharedStakeholderCats.length})
              </h4>
              {sharedStakeholderCats.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {sharedStakeholderCats.map((c) => (
                    <span
                      key={c}
                      className="text-xs font-semibold px-2.5 py-1 bg-white border border-blue-200 text-blue-800 rounded-lg shadow-2xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No actor categories shared across all {contexts.length} selected contexts.
                </p>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Context-Specific Actor Categories
              </h4>
              <div className="space-y-2">
                {specificStakeholderCats.map((sc) => {
                  const ctx = contexts.find((c) => c.id === sc.contextId);
                  return (
                    <div key={sc.contextId} className="text-xs">
                      <span className="font-bold text-slate-900 block mb-1">
                        {ctx?.identity.missionAcronym}:
                      </span>
                      {sc.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sc.categories.map((c) => (
                            <span
                              key={c}
                              className="text-[11px] font-medium px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">All categories shared</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Candidate Actors Side-by-Side */}
          <div className={`grid ${gridColsClass} gap-4 pt-2 border-t border-slate-100`}>
            {contexts.map((ctx) => (
              <div
                key={ctx.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-xs font-black uppercase text-slate-900 block">
                    {ctx.identity.missionAcronym} Stakeholder Prompts
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {(ctx.planningPrompts.stakeholderPrompts || []).length} prompt categories
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {(ctx.planningPrompts.stakeholderPrompts || []).map((sp) => (
                    <div
                      key={sp.category}
                      className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs">
                          {sp.category}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed italic">
                        {sp.rolePrompt}
                      </p>
                      {sp.suggestedStakeholders && sp.suggestedStakeholders.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                            Candidate Actors to Verify:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {sp.suggestedStakeholders.map((sh) => (
                              <span
                                key={sh}
                                className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
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
          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <h3 id="section-e-heading" className="text-xs font-black uppercase tracking-wider text-slate-900">
                Section E — Sources & Currency
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Provenance and data currency indicators
            </span>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
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
                  className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-900">
                        {ctx.identity.missionAcronym}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Last reviewed: {coverage.lastReviewed || 'Not recorded'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white border border-slate-200 p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Sources</span>
                        <span className="text-sm font-black text-slate-800">{coverage.sourceCount}</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Limitations</span>
                        <span className="text-sm font-black text-slate-800">{coverage.limitationsCount}</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase block">Supported Stmts</span>
                        <span className="text-sm font-black text-emerald-700">{coverage.supportedStatementsCount}</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-amber-700 uppercase block">Review Required</span>
                        <span className="text-sm font-black text-amber-800">{coverage.unsupportedStatementsCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Source Ledger */}
                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => toggleSourceLedger(ctx.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-blue-700 hover:text-blue-800 py-1"
                      aria-expanded={isLedgerOpen}
                    >
                      <span>Source Ledger ({coverage.sources.length})</span>
                      {isLedgerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isLedgerOpen && (
                      <div className="mt-2 space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
                        {coverage.sources.length === 0 ? (
                          <p className="text-slate-400 italic text-[11px]">No external sources catalogued.</p>
                        ) : (
                          coverage.sources.map((src) => (
                            <div
                              key={src.id}
                              className="bg-white border border-slate-200 rounded p-2 text-[11px] space-y-1"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-semibold text-slate-800 leading-snug">
                                  {src.title}
                                </span>
                                {src.url && (
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 shrink-0 mt-0.5"
                                    title="Open source reference in new tab"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                              <div className="text-slate-500 flex flex-wrap gap-2 text-[10px]">
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
          className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-blue-600" />
              <h3 id="section-f-heading" className="text-xs font-black uppercase tracking-wider text-slate-900">
                Section F — Transfer Check
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Methodological checklist before cross-context lesson transfer
            </span>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900">
              Questions Before Applying Lessons Across Contexts
            </h4>
            <p className="text-slate-600">
              This is a static methodological checklist to verify whether conditions are genuinely comparable.
              These questions are not scored or automatically answered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {transferQuestions.map((tq, index) => (
              <div
                key={tq.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                    {index + 1}. {tq.category}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-snug mt-1">
                    {tq.question}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 italic block pt-1 border-t border-slate-200/60">
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
