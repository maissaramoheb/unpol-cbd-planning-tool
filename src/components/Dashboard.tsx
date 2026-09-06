import React, { useState } from 'react';
import { UnpolProjectData } from '../types';
import { calculateQualityWarnings } from '../lib/warnings';
import { Card, CardBody, CardHeader } from '../ui/Card';
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
        <Card className="overflow-hidden border-blue-100 bg-white shadow-sm">
          <CardBody className="p-6 sm:p-8 lg:p-10">
            <div className="max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Professional planning workspace</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">UNPOL CBD Integrated Planning Tool</h1>
              <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">Structure the reasoning from evidence and context to capacity-building priorities, responsibilities, sequencing and a professional planning brief.</p>
              <p className="mt-4 inline-flex rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-950">Unofficial planning-support prototype · Use fictional or public/unclassified information only</p>
            </div>

            <div className="mt-8 grid gap-3 lg:grid-cols-[1.15fr_1fr_0.85fr]">
              <button type="button" onClick={() => onNavigateToStep(1)} className="group rounded-xl border border-blue-700 bg-blue-700 p-5 text-left text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <span className="flex items-center justify-between gap-3"><Compass size={20} /><ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" /></span>
                <strong className="mt-5 block text-base">Start a New CBD Plan</strong>
                <span className="mt-1 block text-xs leading-relaxed text-blue-100">Begin a blank professional planning workspace.</span>
              </button>
              <button type="button" onClick={onLoadDemoTemplate} className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left text-slate-900 transition-colors hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <BookOpen size={20} className="text-blue-700" />
                <strong className="mt-5 block text-base">Explore CARANA</strong>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">Open the fictional demonstration and see how the planning logic works.</span>
              </button>
              <button type="button" onClick={() => setShowHowItWorks(value => !value)} aria-expanded={showHowItWorks} aria-controls="how-it-works-orientation" className="rounded-xl border border-slate-200 bg-white p-5 text-left text-slate-900 transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <span className="flex items-center justify-between gap-3"><FileText size={20} className="text-slate-600" /><ChevronDown size={17} className={`transition-transform motion-reduce:transition-none ${showHowItWorks ? 'rotate-180' : ''}`} /></span>
                <strong className="mt-5 block text-base">How It Works</strong>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">See the planning journey before you begin.</span>
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Additional starting point:</span>
              <button type="button" onClick={onOpenExplorer} className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Globe size={14} />Open Mission Explorer</button>
            </div>
          </CardBody>
        </Card>

        {showHowItWorks && (
          <Card id="how-it-works-orientation" className="border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-3"><h2 className="text-base font-black text-slate-950">How the planning journey works</h2><p className="mt-1 text-xs text-slate-600">Move through the reasoning in order, then revisit earlier steps as evidence improves.</p></CardHeader>
            <CardBody className="p-5">
              <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
                {ORIENTATION_STEPS.map((step, index) => <li key={step.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"><span className="text-[11px] font-black tracking-wider text-blue-700">{String(index + 1).padStart(2, '0')}</span><h3 className="mt-2 text-xs font-black leading-snug text-slate-900">{step.title}</h3><p className="mt-1 text-[11px] leading-relaxed text-slate-600">{step.description}</p></li>)}
              </ol>
              <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-bold text-slate-800">The tool structures professional judgement from diagnosis to implementation planning; it does not make the judgement for you.</p><Button variant="primary" onClick={() => onNavigateToStep(1)} className="shrink-0">Start Planning <ArrowRight size={14} /></Button></div>
            </CardBody>
          </Card>
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
    <div className="flex flex-col gap-6 w-full">
      <Card className="border-blue-100 bg-white">
        <CardBody className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
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
              <h1 className="text-xl font-black tracking-tight text-slate-950">
                {profile.missionName || 'Planning context in progress'}
              </h1>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                {profile.countryName || 'Country / area not set'} · {profile.region || 'Region not set'}
              </p>
            </div>
            <p className="max-w-3xl text-xs leading-relaxed text-slate-600">
              Continue refining the context, evidence base, stakeholder assumptions, synthesis, CBD priorities and implementation readiness. Ratings and findings remain analytical judgements requiring review.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:min-w-[420px]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="font-black text-slate-500">Evidence notes</span>
              <strong className="mt-1 block text-lg text-slate-950">{evidenceNotesCount}</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="font-black text-slate-500">Warnings</span>
              <strong className="mt-1 block text-lg text-slate-950">{warnings.length}</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="font-black text-slate-500">Confidence</span>
              <strong className="mt-1 block text-lg text-slate-950">{avgConfidence}/5</strong>
            </div>
            <Button
              variant="primary"
              onClick={() => onNavigateToStep(continueStep)}
              className="min-h-[72px] rounded-xl text-xs font-black"
            >
              Continue
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Header Diagnostic Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Mapped Actors', val: stakeholders.length, sub: `${stakeholders.filter(s => s.position === 'Spoiler risk').length} Spoiler risks`, icon: <Users className="text-blue-500" /> },
          { label: 'Priorities Configured', val: customInterventionsCount, sub: `${Object.keys(customCells).length} matrix cells edited`, icon: <Grid className="text-indigo-500" /> },
          { label: 'Diagnostic Warnings', val: warnings.length, sub: `${criticalWarnings} critical cautions`, icon: <AlertTriangle className={warnings.length > 0 ? "text-amber-500" : "text-slate-400"} /> },
          { label: 'Verification Confidence', val: `${avgConfidence}/5.0`, sub: 'Based on evidence logs', icon: <TrendingUp className="text-emerald-500" /> }
        ].map((kpi, idx) => (
          <Card key={idx} className="bg-white border-slate-200">
            <CardBody className="p-4 flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <span className="text-xl font-extrabold text-slate-900 leading-tight">{kpi.val}</span>
                <span className="text-[10px] text-slate-600 font-semibold">{kpi.sub}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">{kpi.icon}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main Analysis Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Pressures and Stakeholder Risks */}
        <div className="flex flex-col gap-6">
          {/* Top 3 PESTEL-S Pressures */}
          <Card>
            <CardHeader className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <Activity size={16} className="text-blue-500" />
                Critical Contextual Pressures (Top 3)
              </h4>
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(2)} className="text-[11px] font-bold text-blue-600 py-0.5 px-2">
                Edit PESTEL-S
              </Button>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              {sortedPressures.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No findings configured in PESTEL-S step.</p>
              ) : (
                sortedPressures.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50/60 border border-slate-200 rounded-xl flex flex-col gap-1">
                    <div className="flex justify-between items-center w-full gap-2">
                      <span className="font-extrabold text-[11px] text-slate-800 uppercase tracking-tight">{p.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="rose">Pressure: {p.score}/25</Badge>
                        <Badge variant="slate">Confidence: {p.rating.confidence}/5</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1 line-clamp-2">{p.finding}</p>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">
                      Evidence: {p.evidenceNotes?.length || 0} citations
                    </span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {/* Top Stakeholder Risks */}
          <Card>
            <CardHeader className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Key Stakeholder Spoilers / Blockers
              </h4>
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(3)} className="text-[11px] font-bold text-blue-600 py-0.5 px-2">
                Edit Stakeholders
              </Button>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              {stakeholderRisks.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No blockers or spoiler risks identified in the actors database.</p>
              ) : (
                stakeholderRisks.map(s => (
                  <div key={s.id} className="p-3 bg-slate-50/60 border border-slate-200 rounded-xl flex flex-col gap-1.5">
                    <div className="flex justify-between items-start w-full gap-2">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block leading-tight">{s.name}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">{s.category}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Badge variant="rose">{s.position}</Badge>
                        <Badge variant="slate">Influence: {s.influence}</Badge>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 italic leading-relaxed">&ldquo;{s.risk}&rdquo;</p>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Side: CBD Priorities and Sequencing */}
        <div className="flex flex-col gap-6">
          {/* Top 5 CBD Priorities */}
          <Card>
            <CardHeader className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" />
                Indicative Matrix Priorities (Top 5)
              </h4>
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(5)} className="text-[11px] font-bold text-blue-600 py-0.5 px-2">
                Open Matrix Grid
              </Button>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              {scoredCells.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No customized matrix intersections defined.</p>
              ) : (
                scoredCells.map(({ key, cell, score }) => (
                  <div key={key} className="p-3 bg-slate-50/60 border border-slate-200 rounded-xl flex flex-col gap-1">
                    <div className="flex justify-between items-center w-full gap-2">
                      <span className="font-extrabold text-[10px] text-slate-900 uppercase tracking-tight">{key}</span>
                      <div className="flex gap-1 shrink-0">
                        <Badge variant="blue">Priority: {score.toFixed(1)}/5</Badge>
                        <Badge variant="slate">Confidence: {cell.confidence}/5</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-1">{cell.why}</p>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {/* Quick Wins & Sensitive Reforms */}
          <Card>
            <CardHeader className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <ListTodo size={16} className="text-emerald-500" />
                Strategic Sequencing Targets
              </h4>
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(6)} className="text-[11px] font-bold text-blue-600 py-0.5 px-2">
                Review Sequencing
              </Button>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block border-b border-emerald-100 pb-1">
                  Quick Wins (High Feasibility)
                </span>
                {priorityBrief.quickWins?.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">None configured</span>
                ) : (
                  <ul className="text-xs text-slate-600 flex flex-col gap-1 list-disc pl-4 leading-normal">
                    {priorityBrief.quickWins?.slice(0, 3).map((qw, i) => (
                      <li key={i} className="line-clamp-2">{qw}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block border-b border-amber-100 pb-1">
                  Sensitive Reforms (Requires Cover)
                </span>
                {priorityBrief.sensitiveReforms?.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">None configured</span>
                ) : (
                  <ul className="text-xs text-slate-600 flex flex-col gap-1 list-disc pl-4 leading-normal">
                    {priorityBrief.sensitiveReforms?.slice(0, 3).map((sr, i) => (
                      <li key={i} className="line-clamp-2">{sr}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Stakeholder Quadrant Visualizations */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            Stakeholder Position Quadrants
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Decision-support views derived from the current stakeholder ratings and recorded engagement assumptions.
          </p>
        </CardHeader>
        <CardBody>
          <StakeholderDecisionSupport stakeholders={stakeholders} />
        </CardBody>
      </Card>

      {/* QC warnings panel */}
      {warnings.length > 0 && (
        <Card className="border-amber-250 bg-amber-50/15">
          <CardHeader className="border-b border-amber-100/60 pb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Strategic Planning Quality-Control Cautions ({warnings.length})
            </h4>
          </CardHeader>
          <CardBody className="flex flex-col gap-2.5">
            {warnings.map((warn) => (
              <div
                key={warn.id}
                className={`
                  p-3 border rounded-xl flex items-start gap-2.5 text-xs leading-relaxed
                  ${warn.type === 'warning'
                    ? 'border-amber-200 bg-amber-50/40 text-amber-900'
                    : 'border-slate-200 bg-slate-50 text-slate-750'
                  }
                `}
              >
                <AlertTriangle size={15} className={`shrink-0 mt-0.5 ${warn.type === 'warning' ? 'text-amber-600' : 'text-slate-500'}`} />
                <div className="flex-1">
                  <span className="font-semibold block">{warn.message}</span>
                </div>
                {warn.category === 'profile' && (
                  <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(1)} className="text-[10px] font-bold text-blue-600 p-0 hover:bg-transparent leading-none">
                    Fix &rarr;
                  </Button>
                )}
                {warn.category === 'pestels' && (
                  <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(2)} className="text-[10px] font-bold text-blue-600 p-0 hover:bg-transparent leading-none">
                    Review &rarr;
                  </Button>
                )}
                {warn.category === 'matrix' && (
                  <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(5)} className="text-[10px] font-bold text-blue-600 p-0 hover:bg-transparent leading-none">
                    Adjust &rarr;
                  </Button>
                )}
                {warn.category === 'sequencing' && (
                  <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(6)} className="text-[10px] font-bold text-blue-600 p-0 hover:bg-transparent leading-none">
                    Resolve &rarr;
                  </Button>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Overview navigation buttons */}
      <Card>
        <CardBody className="p-4 flex flex-wrap gap-2.5 justify-center items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Go to Module:</span>
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
              variant="outline"
              size="sm"
              onClick={() => onNavigateToStep(shortcut.step)}
              className="text-xs font-bold text-slate-700 border-slate-200 hover:border-slate-350 hover:bg-slate-50/50"
            >
              {shortcut.label}
              <ChevronRight size={12} className="ml-1 text-slate-400" />
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenExplorer}
            className="text-xs font-bold text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50/50"
          >
            Browse Mission Explorer
            <Globe size={12} className="ml-1 text-blue-500" />
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};
