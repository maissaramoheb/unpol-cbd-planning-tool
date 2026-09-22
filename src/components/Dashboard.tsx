import React, { useState } from 'react';
import { UnpolProjectData } from '../types';
import { calculateQualityWarnings } from '../lib/warnings';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { evaluateCbdCell } from '../lib/scoring';
import { EXPORT_VIEW, getDashboardContinueStep } from '../lib/workflow';
import { StakeholderDecisionSupport } from './StakeholderDecisionSupport';
import {
  Users,
  Grid,
  ListTodo,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  Globe,
  FileText,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { HOW_IT_WORKS_DEFAULT_OPEN, ORIENTATION_STEPS, shouldShowBlankWelcome } from '../lib/guidance';

interface DashboardProps {
  data: UnpolProjectData;
  onNavigateToStep: (step: number) => void;
  onOpenExplorer: () => void;
  onLoadDemoTemplate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onNavigateToStep, onOpenExplorer, onLoadDemoTemplate }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(HOW_IT_WORKS_DEFAULT_OPEN);
  const { profile, pestels, stakeholders, customCells, priorityBrief, analysisSynthesis } = data;

  const warnings = calculateQualityWarnings(data);

  // Determine if it is an empty state
  const isProfileEmpty = !profile.countryName && !profile.missionName;
  const isPestelsEmpty = Object.values(pestels).every(p => p.finding === '');
  const isStakeholdersEmpty = stakeholders.length === 0;
  const isCustomCellsEmpty = Object.keys(customCells).length === 0;
  const isSequencingEmpty = ![
    ...priorityBrief.topPriorities,
    ...priorityBrief.quickWins,
    ...priorityBrief.sensitiveReforms,
    ...priorityBrief.longerTermReforms,
    ...priorityBrief.risksAssumptions,
    priorityBrief.sequencingRecommendation
  ].some(value => value.trim());

  const isSynthesisEmpty = analysisSynthesis.swotFindings.length === 0 && analysisSynthesis.strategicOptions.length === 0;
  const isEmptyState = isProfileEmpty && isPestelsEmpty && isStakeholdersEmpty && isCustomCellsEmpty && isSynthesisEmpty;
  const isDemoTemplate = profile.templateId === 'fictional-carana-demo';

  if (shouldShowBlankWelcome(isEmptyState)) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="py-6 sm:py-8 border-b border-border-default max-w-4xl">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-action-primary">
              Institutional Planning Workbench
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
              UNPOL CBD Integrated Planning Tool
            </h1>
            <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-text-secondary">
              Structure the reasoning from evidence and context to capacity-building priorities, responsibilities, sequencing and a professional planning brief.
            </p>
            <div className="mt-3.5 inline-flex items-center gap-2 text-xs text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>Unofficial planning-support prototype · Use fictional or public/unclassified information only</span>
            </div>
          </div>

          {/* Action Hierarchy: Primary > Secondary > Tertiary */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigateToStep(1)}
              className="px-5 font-bold"
            >
              Start a New CBD Plan <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onLoadDemoTemplate}
              className="px-4"
            >
              <BookOpen size={16} className="mr-2 text-action-primary" /> Explore CARANA
            </Button>
            <Button
              variant="tertiary"
              size="lg"
              onClick={() => setShowHowItWorks(value => !value)}
              aria-expanded={showHowItWorks}
              aria-controls="how-it-works-orientation"
            >
              <FileText size={16} className="mr-2 text-text-muted" /> How It Works
              <ChevronDown size={15} className={`ml-1.5 transition-transform duration-150 ${showHowItWorks ? 'rotate-180' : ''}`} />
            </Button>
            <div className="h-5 w-px bg-border-default hidden sm:block mx-1" aria-hidden="true" />
            <Button variant="link" onClick={onOpenExplorer} className="text-xs">
              <Globe size={14} className="mr-1.5" /> Open Mission Explorer
            </Button>
          </div>
        </div>

        {showHowItWorks && (
          <div id="how-it-works-orientation" className="rounded-lg border border-border-strong bg-surface-raised p-5 sm:p-6">
            <div className="border-b border-border-default pb-3">
              <h2 className="text-base font-bold text-text-primary">How the planning journey works</h2>
              <p className="mt-0.5 text-xs text-text-muted">Move through the reasoning in order, then revisit earlier steps as evidence improves.</p>
            </div>
            <div className="pt-4">
              <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
                {ORIENTATION_STEPS.map((step, index) => (
                  <li key={step.title} className="rounded-md border border-border-default bg-surface-subtle p-3 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-action-primary">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-1.5 text-xs font-bold leading-snug text-text-primary">{step.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-text-muted">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-col gap-3 border-t border-border-default pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs sm:text-sm font-medium text-text-secondary">
                  The tool structures professional judgement from diagnosis to implementation planning; it does not make the judgement for you.
                </p>
                <Button variant="primary" size="sm" onClick={() => onNavigateToStep(1)} className="shrink-0">
                  Start Planning <ArrowRight size={13} className="ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- COMPUTE KPI METRICS ---
  const customInterventionsCount = Object.keys(customCells).length;
  const criticalWarnings = warnings.filter(w => w.type === 'warning').length;
  
  // Calculate average confidence
  let totalConfidenceSum = 0;
  let confidenceItemsCount = 0;
  Object.values(pestels).forEach(p => {
    if (p.finding) {
      totalConfidenceSum += p.rating.confidence;
      confidenceItemsCount++;
    }
  });
  Object.values(customCells).forEach(c => {
    totalConfidenceSum += c.confidence;
    confidenceItemsCount++;
  });
  const avgConfidence = confidenceItemsCount > 0 ? (totalConfidenceSum / confidenceItemsCount).toFixed(1) : '3.0';
  const evidenceNotesCount =
    Object.values(pestels).reduce((sum, item) => sum + (item.evidenceNotes?.length || 0), 0) +
    stakeholders.reduce((sum, item) => sum + (item.evidenceNotes?.length || 0), 0) +
    Object.values(customCells).reduce((sum, item) => sum + (item.evidenceNotes?.length || 0), 0);

  const continueStep = getDashboardContinueStep({
    isProfileEmpty,
    isPestelsEmpty,
    isStakeholdersEmpty,
    isCustomCellsEmpty,
    isSequencingEmpty
  });

  // --- COMPUTE TOP 3 PRESSURES ---
  const sortedPressures = Object.values(pestels)
    .filter(p => p.finding !== '')
    .map(p => ({
      ...p,
      score: p.rating.impact * p.rating.urgency
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // --- COMPUTE TOP 5 STAKEHOLDER RISKS ---
  const stakeholderRisks = stakeholders
    .filter(s => s.position === 'Spoiler risk' || s.position === 'Blocker')
    .sort((a, b) => {
      const getInfluenceVal = (inf: string) => (inf === 'High' ? 3 : inf === 'Medium' ? 2 : 1);
      return getInfluenceVal(b.influence) - getInfluenceVal(a.influence);
    })
    .slice(0, 5);

  // --- COMPUTE TOP 5 CBD PRIORITIES ---
  const scoredCells = Object.keys(customCells).map(key => {
    const cell = customCells[key];
    const assessment = evaluateCbdCell(cell);
    return { key, cell, score: assessment.score };
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Editorial Executive Lead */}
      <div className="flex flex-col gap-3.5 border-b border-border-default pb-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue">Home · Planning Overview</Badge>
            {isDemoTemplate ? (
              <Badge variant="amber">Fictional demonstration material</Badge>
            ) : null}
            {profile.sourceCategory ? (
              <Badge variant="slate">{profile.sourceCategory}</Badge>
            ) : null}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              {profile.missionName || 'Planning context in progress'}
            </h1>
            <p className="mt-0.5 text-xs font-medium text-text-muted">
              {profile.countryName || 'Country / area not set'} · {profile.region || 'Region not set'}
            </p>
          </div>
          <p className="max-w-3xl text-xs leading-relaxed text-text-secondary">
            Continue refining the context, evidence base, stakeholder assumptions, synthesis, CBD priorities and implementation readiness. Ratings and findings remain analytical judgements requiring review.
          </p>
        </div>

        {/* Consolidated Status & Action Strip */}
        <div className="rounded-lg border border-border-strong bg-surface-raised px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 divide-x divide-border-default">
            <div>
              <span className="text-[11px] font-semibold text-text-muted">Evidence:</span>
              <span className="font-mono tabular-nums font-bold text-xs text-text-primary ml-1.5">{evidenceNotesCount} citations</span>
            </div>
            <div className="pl-4 sm:pl-6">
              <span className="text-[11px] font-semibold text-text-muted">Warnings:</span>
              <span className="font-mono tabular-nums font-bold text-xs text-text-primary ml-1.5">{warnings.length}</span>
            </div>
            <div className="pl-4 sm:pl-6">
              <span className="text-[11px] font-semibold text-text-muted">Confidence:</span>
              <span className="font-mono tabular-nums font-bold text-xs text-text-primary ml-1.5">{avgConfidence}/5.0</span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigateToStep(continueStep)}
            className="gap-1.5 font-bold"
          >
            <span>Continue to Stage {continueStep}</span>
            <ArrowRight size={13} />
          </Button>
        </div>
      </div>

      {/* Unified Diagnostic Metrics Strip */}
      <div className="rounded-lg border border-border-strong bg-surface-raised grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border-default overflow-hidden">
        {[
          { label: 'Mapped Actors', val: stakeholders.length, sub: `${stakeholders.filter(s => s.position === 'Spoiler risk').length} Spoiler risks`, icon: <Users size={18} className="text-text-muted" /> },
          { label: 'Priorities Configured', val: customInterventionsCount, sub: `${Object.keys(customCells).length} matrix cells edited`, icon: <Grid size={18} className="text-text-muted" /> },
          { label: 'Diagnostic Warnings', val: warnings.length, sub: `${criticalWarnings} critical cautions`, icon: <AlertTriangle size={18} className={warnings.length > 0 ? "text-amber-600" : "text-text-muted"} /> },
          { label: 'Verification Confidence', val: `${avgConfidence}/5.0`, sub: 'Based on evidence logs', icon: <TrendingUp size={18} className="text-text-muted" /> }
        ].map((kpi, idx) => (
          <div key={idx} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted truncate">{kpi.label}</span>
              <span className="font-mono tabular-nums text-xl font-bold text-text-primary leading-tight">{kpi.val}</span>
              <span className="text-[11px] text-text-secondary truncate">{kpi.sub}</span>
            </div>
            <div className="p-2 rounded-md bg-surface-subtle text-text-muted shrink-0">{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Main Analysis Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Side: Pressures and Stakeholder Risks */}
        <div className="flex flex-col gap-5">
          {/* Top 3 PESTEL-S Pressures */}
          <div className="rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-default bg-surface-subtle px-4 py-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <Activity size={15} className="text-action-primary" />
                Critical Contextual Pressures (Top 3)
              </h4>
              <Button variant="secondary" size="sm" onClick={() => onNavigateToStep(2)}>
                Edit PESTEL-S
              </Button>
            </div>
            <div className="divide-y divide-border-default">
              {sortedPressures.length === 0 ? (
                <p className="p-4 text-xs text-text-muted italic">No findings configured in PESTEL-S step.</p>
              ) : (
                sortedPressures.map(p => (
                  <div key={p.id} className="p-3.5 flex flex-col gap-1 hover:bg-surface-subtle/50 transition-colors">
                    <div className="flex justify-between items-center w-full gap-2">
                      <span className="font-semibold text-xs text-text-primary">{p.name}</span>
                      <div className="flex gap-1.5 shrink-0">
                        <Badge variant="rose">Pressure: {p.score}/25</Badge>
                        <Badge variant="slate">Confidence: {p.rating.confidence}/5</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{p.finding}</p>
                    <span className="text-[11px] text-text-muted">
                      Evidence: {p.evidenceNotes?.length || 0} citations
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Stakeholder Risks */}
          <div className="rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-default bg-surface-subtle px-4 py-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-600" />
                Key Stakeholder Spoilers / Blockers
              </h4>
              <Button variant="secondary" size="sm" onClick={() => onNavigateToStep(3)}>
                Edit Stakeholders
              </Button>
            </div>
            <div className="divide-y divide-border-default">
              {stakeholderRisks.length === 0 ? (
                <p className="p-4 text-xs text-text-muted italic">No blockers or spoiler risks identified in the actors database.</p>
              ) : (
                stakeholderRisks.map(s => (
                  <div key={s.id} className="p-3.5 flex flex-col gap-1 hover:bg-surface-subtle/50 transition-colors">
                    <div className="flex justify-between items-start w-full gap-2">
                      <div>
                        <span className="font-semibold text-xs text-text-primary block leading-tight">{s.name}</span>
                        <span className="text-[11px] text-text-muted block mt-0.5">{s.category}</span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Badge variant="rose">{s.position}</Badge>
                        <Badge variant="slate">Influence: {s.influence}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary italic leading-relaxed">&ldquo;{s.risk}&rdquo;</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: CBD Priorities and Sequencing */}
        <div className="flex flex-col gap-5">
          {/* Top 5 CBD Priorities */}
          <div className="rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-default bg-surface-subtle px-4 py-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <Layers size={15} className="text-action-primary" />
                Indicative Matrix Priorities (Top 5)
              </h4>
              <Button variant="secondary" size="sm" onClick={() => onNavigateToStep(5)}>
                Open Matrix Grid
              </Button>
            </div>
            <div className="divide-y divide-border-default">
              {scoredCells.length === 0 ? (
                <p className="p-4 text-xs text-text-muted italic">No customized matrix intersections defined.</p>
              ) : (
                scoredCells.map(({ key, cell, score }) => (
                  <div key={key} className="p-3.5 flex flex-col gap-1 hover:bg-surface-subtle/50 transition-colors">
                    <div className="flex justify-between items-center w-full gap-2">
                      <span className="font-semibold text-xs text-text-primary">{key.replace('|', ' × ')}</span>
                      <div className="flex gap-1.5 shrink-0">
                        <Badge variant="blue">Priority: {score.toFixed(1)}/5</Badge>
                        <Badge variant="slate">Confidence: {cell.confidence}/5</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-1">{cell.why}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Wins & Sensitive Reforms */}
          <div className="rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-default bg-surface-subtle px-4 py-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <ListTodo size={15} className="text-action-primary" />
                Strategic Sequencing Targets
              </h4>
              <Button variant="secondary" size="sm" onClick={() => onNavigateToStep(6)}>
                Review Sequencing
              </Button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-border-default">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-emerald-800 block pb-1">
                  Quick Wins (High Feasibility)
                </span>
                {priorityBrief.quickWins?.length === 0 ? (
                  <span className="text-xs text-text-muted italic">None configured</span>
                ) : (
                  <ul className="text-xs text-text-secondary flex flex-col gap-1 list-disc pl-4 leading-normal">
                    {priorityBrief.quickWins?.slice(0, 3).map((qw, i) => (
                      <li key={i} className="line-clamp-2">{qw}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-2 md:pl-4 pt-3 md:pt-0">
                <span className="text-xs font-semibold text-amber-800 block pb-1">
                  Sensitive Reforms (Requires Cover)
                </span>
                {priorityBrief.sensitiveReforms?.length === 0 ? (
                  <span className="text-xs text-text-muted italic">None configured</span>
                ) : (
                  <ul className="text-xs text-text-secondary flex flex-col gap-1 list-disc pl-4 leading-normal">
                    {priorityBrief.sensitiveReforms?.slice(0, 3).map((sr, i) => (
                      <li key={i} className="line-clamp-2">{sr}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stakeholder Position Quadrants */}
      <div className="rounded-lg border border-border-strong bg-surface-raised overflow-hidden">
        <div className="border-b border-border-default bg-surface-subtle px-4 py-3">
          <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
            <Users size={15} className="text-action-primary" />
            Stakeholder Position Quadrants
          </h4>
          <p className="mt-0.5 text-xs text-text-muted">
            Decision-support views derived from the current stakeholder ratings and recorded engagement assumptions.
          </p>
        </div>
        <div className="p-4">
          <StakeholderDecisionSupport stakeholders={stakeholders} />
        </div>
      </div>

      {/* QC warnings panel */}
      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/20 p-4">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600" />
              Strategic Planning Quality-Control Cautions ({warnings.length})
            </h4>
          </div>
          <div className="pt-3 flex flex-col gap-2">
            {warnings.map((warn) => (
              <div
                key={warn.id}
                className={`
                  p-3 border rounded-md flex items-start gap-2.5 text-xs leading-relaxed
                  ${warn.type === 'warning'
                    ? 'border-amber-200/80 bg-amber-50/60 text-amber-900'
                    : 'border-border-default bg-surface-subtle text-text-secondary'
                  }
                `}
              >
                <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${warn.type === 'warning' ? 'text-amber-600' : 'text-text-muted'}`} />
                <div className="flex-1">
                  <span className="font-medium block">{warn.message}</span>
                </div>
                {warn.category === 'profile' && (
                  <Button variant="link" size="sm" onClick={() => onNavigateToStep(1)}>
                    Fix &rarr;
                  </Button>
                )}
                {warn.category === 'pestels' && (
                  <Button variant="link" size="sm" onClick={() => onNavigateToStep(2)}>
                    Review &rarr;
                  </Button>
                )}
                {warn.category === 'matrix' && (
                  <Button variant="link" size="sm" onClick={() => onNavigateToStep(5)}>
                    Adjust &rarr;
                  </Button>
                )}
                {warn.category === 'sequencing' && (
                  <Button variant="link" size="sm" onClick={() => onNavigateToStep(6)}>
                    Align &rarr;
                  </Button>
                )}
                {warn.category === 'synthesis' && (
                  <Button variant="link" size="sm" onClick={() => onNavigateToStep(4)}>
                    Address &rarr;
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview navigation shortcuts */}
      <div className="rounded-lg border border-border-default bg-surface-raised p-3 sm:p-4 flex flex-wrap gap-2 justify-center items-center">
        <span className="text-xs font-semibold text-text-muted mr-1">Go to Module:</span>
        {[
          { label: 'Context & Mandate', step: 1 },
          { label: 'Diagnostic Analysis', step: 2 },
          { label: 'Stakeholders & Ownership', step: 3 },
          { label: 'Analysis Synthesis', step: 4 },
          { label: 'CBD Priorities', step: 5 },
          { label: 'Prioritize & Sequence', step: 6 },
          { label: 'Results & Implementation', step: 7 },
          { label: 'Export Planning Brief', step: EXPORT_VIEW }
        ].map(shortcut => (
          <Button
            key={shortcut.step}
            variant="secondary"
            size="sm"
            onClick={() => onNavigateToStep(shortcut.step)}
          >
            {shortcut.label}
            <ChevronRight size={12} className="ml-1 text-text-muted" />
          </Button>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenExplorer}
        >
          Browse Mission Explorer
          <Globe size={12} className="ml-1 text-action-primary" />
        </Button>
      </div>
    </div>
  );
};
