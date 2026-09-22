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
  Compass,
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
        <div className="rounded-lg border border-border-default bg-surface-raised p-6 sm:p-8 lg:p-10">
          <div className="max-w-4xl">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-action-primary">
              Institutional Planning Workbench
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
              UNPOL CBD Integrated Planning Tool
            </h1>
            <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-text-secondary">
              Structure the reasoning from evidence and context to capacity-building priorities, responsibilities, sequencing and a professional planning brief.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-xs font-medium text-amber-900">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0" />
              <span>Unofficial planning-support prototype · Use fictional or public/unclassified information only</span>
            </div>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-[1.15fr_1fr_0.85fr]">
            <button
              type="button"
              onClick={() => onNavigateToStep(1)}
              className="group rounded-lg border border-action-primary bg-action-primary p-4 sm:p-5 text-left text-text-inverse transition-colors hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
            >
              <span className="flex items-center justify-between gap-3">
                <Compass size={20} />
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
              </span>
              <strong className="mt-4 block text-sm sm:text-base font-bold">Start a New CBD Plan</strong>
              <span className="mt-1 block text-xs leading-relaxed text-blue-100">Begin a blank professional planning workspace.</span>
            </button>
            <button
              type="button"
              onClick={onLoadDemoTemplate}
              className="rounded-lg border border-border-default bg-surface-raised p-4 sm:p-5 text-left text-text-primary transition-colors hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <BookOpen size={20} className="text-action-primary" />
              <strong className="mt-4 block text-sm sm:text-base font-bold">Explore CARANA</strong>
              <span className="mt-1 block text-xs leading-relaxed text-text-muted">Open the fictional demonstration and see how the planning logic works.</span>
            </button>
            <button
              type="button"
              onClick={() => setShowHowItWorks(value => !value)}
              aria-expanded={showHowItWorks}
              aria-controls="how-it-works-orientation"
              className="rounded-lg border border-border-default bg-surface-raised p-4 sm:p-5 text-left text-text-primary transition-colors hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <span className="flex items-center justify-between gap-3">
                <FileText size={20} className="text-text-muted" />
                <ChevronDown size={16} className={`transition-transform duration-150 motion-reduce:transition-none ${showHowItWorks ? 'rotate-180' : ''}`} />
              </span>
              <strong className="mt-4 block text-sm sm:text-base font-bold">How It Works</strong>
              <span className="mt-1 block text-xs leading-relaxed text-text-muted">See the planning journey before you begin.</span>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <span>Additional starting point:</span>
            <Button variant="link" onClick={onOpenExplorer} className="text-xs">
              <Globe size={13} className="mr-1" />Open Mission Explorer
            </Button>
          </div>
        </div>

        {showHowItWorks && (
          <div id="how-it-works-orientation" className="rounded-lg border border-border-default bg-surface-raised p-5 sm:p-6">
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
      {/* Executive Briefing Lead Card */}
      <div className="rounded-lg border border-border-default bg-surface-raised p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
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

          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:min-w-[420px]">
            <div className="rounded-md border border-border-default bg-surface-subtle p-3">
              <span className="text-xs font-semibold text-text-muted">Evidence notes</span>
              <strong className="font-mono tabular-nums mt-1 block text-lg font-bold text-text-primary">{evidenceNotesCount}</strong>
            </div>
            <div className="rounded-md border border-border-default bg-surface-subtle p-3">
              <span className="text-xs font-semibold text-text-muted">Warnings</span>
              <strong className="font-mono tabular-nums mt-1 block text-lg font-bold text-text-primary">{warnings.length}</strong>
            </div>
            <div className="rounded-md border border-border-default bg-surface-subtle p-3">
              <span className="text-xs font-semibold text-text-muted">Confidence</span>
              <strong className="font-mono tabular-nums mt-1 block text-lg font-bold text-text-primary">{avgConfidence}/5</strong>
            </div>
            <Button
              variant="primary"
              onClick={() => onNavigateToStep(continueStep)}
              className="min-h-[64px] rounded-md text-xs font-bold flex flex-col justify-center items-center"
            >
              <span>Continue</span>
              <span className="text-[11px] font-normal opacity-90 flex items-center mt-0.5">
                Stage {continueStep} <ArrowRight size={12} className="ml-1" />
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Diagnostic KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Mapped Actors', val: stakeholders.length, sub: `${stakeholders.filter(s => s.position === 'Spoiler risk').length} Spoiler risks`, icon: <Users size={18} className="text-text-muted" /> },
          { label: 'Priorities Configured', val: customInterventionsCount, sub: `${Object.keys(customCells).length} matrix cells edited`, icon: <Grid size={18} className="text-text-muted" /> },
          { label: 'Diagnostic Warnings', val: warnings.length, sub: `${criticalWarnings} critical cautions`, icon: <AlertTriangle size={18} className={warnings.length > 0 ? "text-amber-600" : "text-text-muted"} /> },
          { label: 'Verification Confidence', val: `${avgConfidence}/5.0`, sub: 'Based on evidence logs', icon: <TrendingUp size={18} className="text-text-muted" /> }
        ].map((kpi, idx) => (
          <div key={idx} className="rounded-lg border border-border-default bg-surface-raised p-3.5 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-text-muted">{kpi.label}</span>
              <span className="font-mono tabular-nums text-xl font-bold text-text-primary leading-tight">{kpi.val}</span>
              <span className="text-xs text-text-secondary">{kpi.sub}</span>
            </div>
            <div className="p-2 rounded-md bg-surface-subtle border border-border-default shrink-0">{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Main Analysis Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Side: Pressures and Stakeholder Risks */}
        <div className="flex flex-col gap-5">
          {/* Top 3 PESTEL-S Pressures */}
          <div className="rounded-lg border border-border-default bg-surface-raised overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-default bg-surface-subtle px-4 py-3">
              <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <Activity size={15} className="text-action-primary" />
                Critical Contextual Pressures (Top 3)
              </h4>
              <Button variant="secondary" size="sm" onClick={() => onNavigateToStep(2)}>
                Edit PESTEL-S
              </Button>
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              {sortedPressures.length === 0 ? (
                <p className="text-xs text-text-muted italic">No findings configured in PESTEL-S step.</p>
              ) : (
                sortedPressures.map(p => (
                  <div key={p.id} className="p-3 bg-surface-subtle border border-border-default rounded-md flex flex-col gap-1">
                    <div className="flex justify-between items-center w-full gap-2">
                      <span className="font-bold text-xs text-text-primary">{p.name}</span>
                      <div className="flex gap-1.5 shrink-0">
                        <Badge variant="rose">Pressure: {p.score}/25</Badge>
                        <Badge variant="slate">Confidence: {p.rating.confidence}/5</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed mt-1 line-clamp-2">{p.finding}</p>
                    <span className="text-xs text-text-muted mt-0.5">
                      Evidence: {p.evidenceNotes?.length || 0} citations
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Stakeholder Risks */}
          <div className="rounded-lg border border-border-default bg-surface-raised overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-default bg-surface-subtle px-4 py-3">
              <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-600" />
                Key Stakeholder Spoilers / Blockers
              </h4>
              <Button variant="secondary" size="sm" onClick={() => onNavigateToStep(3)}>
                Edit Stakeholders
              </Button>
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              {stakeholderRisks.length === 0 ? (
                <p className="text-xs text-text-muted italic">No blockers or spoiler risks identified in the actors database.</p>
              ) : (
                stakeholderRisks.map(s => (
                  <div key={s.id} className="p-3 bg-surface-subtle border border-border-default rounded-md flex flex-col gap-1">
                    <div className="flex justify-between items-start w-full gap-2">
                      <div>
                        <span className="font-bold text-xs text-text-primary block leading-tight">{s.name}</span>
                        <span className="text-xs text-text-muted block mt-0.5">{s.category}</span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Badge variant="rose">{s.position}</Badge>
                        <Badge variant="slate">Influence: {s.influence}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary italic leading-relaxed mt-0.5">&ldquo;{s.risk}&rdquo;</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: CBD Priorities and Sequencing */}
        <div className="flex flex-col gap-5">
          {/* Top 5 CBD Priorities */}
          <div className="rounded-lg border border-border-default bg-surface-raised overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-default bg-surface-subtle px-4 py-3">
              <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <Layers size={15} className="text-action-primary" />
                Indicative Matrix Priorities (Top 5)
              </h4>
              <Button variant="secondary" size="sm" onClick={() => onNavigateToStep(5)}>
                Open Matrix Grid
              </Button>
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              {scoredCells.length === 0 ? (
                <p className="text-xs text-text-muted italic">No customized matrix intersections defined.</p>
              ) : (
                scoredCells.map(({ key, cell, score }) => (
                  <div key={key} className="p-3 bg-surface-subtle border border-border-default rounded-md flex flex-col gap-1">
                    <div className="flex justify-between items-center w-full gap-2">
                      <span className="font-bold text-xs text-text-primary">{key.replace('|', ' × ')}</span>
                      <div className="flex gap-1.5 shrink-0">
                        <Badge variant="blue">Priority: {score.toFixed(1)}/5</Badge>
                        <Badge variant="slate">Confidence: {cell.confidence}/5</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed mt-0.5 line-clamp-1">{cell.why}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Wins & Sensitive Reforms */}
          <div className="rounded-lg border border-border-default bg-surface-raised overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-default bg-surface-subtle px-4 py-3">
              <h4 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                <ListTodo size={15} className="text-action-primary" />
                Strategic Sequencing Targets
              </h4>
              <Button variant="secondary" size="sm" onClick={() => onNavigateToStep(6)}>
                Review Sequencing
              </Button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-emerald-800 block border-b border-border-default pb-1">
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
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-amber-800 block border-b border-border-default pb-1">
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
      <div className="rounded-lg border border-border-default bg-surface-raised overflow-hidden">
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
