import React from 'react';
import { UnpolProjectData } from '../types';
import { calculateQualityWarnings } from '../lib/warnings';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { evaluateCbdCell } from '../lib/scoring';
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
  BookOpen
} from 'lucide-react';

interface DashboardProps {
  data: UnpolProjectData;
  onNavigateToStep: (step: number) => void;
  onOpenExplorer: () => void;
  onLoadDemoTemplate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onNavigateToStep, onOpenExplorer, onLoadDemoTemplate }) => {
  const { profile, pestels, stakeholders, customCells, priorityBrief } = data;

  const warnings = calculateQualityWarnings(data);

  // Determine if it is an empty state
  const isProfileEmpty = !profile.countryName && !profile.missionName;
  const isPestelsEmpty = Object.values(pestels).every(p => p.finding === '');
  const isStakeholdersEmpty = stakeholders.length === 0;
  const isCustomCellsEmpty = Object.keys(customCells).length === 0;

  const isEmptyState = isProfileEmpty && isPestelsEmpty && isStakeholdersEmpty && isCustomCellsEmpty;
  const isDemoTemplate = profile.templateId === 'demo-peacekeeping';

  const workflowSteps = [
    'Define mission context',
    'Scan PESTEL-S pressures',
    'Map actors and stakeholders',
    'Identify CBD priorities',
    'Sequence interventions',
    'Export planning brief'
  ];

  if (isEmptyState) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardBody className="p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="blue">Unofficial prototype</Badge>
                  <Badge variant="slate">Local browser workspace</Badge>
                  <Badge variant="amber">Verification required</Badge>
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    Planning Overview
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    This unofficial planning-support workspace helps structure UNPOL/CBD analysis from mission context to an exportable planning brief.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm leading-relaxed text-slate-700 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">For</span>
                    <p className="mt-1 font-semibold">Structured analysis, training, advisory planning, and workshop preparation.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">Output</span>
                    <p className="mt-1 font-semibold">Markdown/print planning brief plus JSON workspace backup.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">Boundary</span>
                    <p className="mt-1 font-semibold">Not UN doctrine, not an official UN system, and not verified country analysis.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-700" />
                  <div>
                    <h2 className="font-black uppercase tracking-wider">Trust and safety note</h2>
                    <p className="mt-2">
                      It is not UN doctrine, not an official UN system, not a complete UN mission database, and not verified country analysis. Mission status, mandate, and facts must be checked against current official sources before professional use.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="border-blue-200 bg-blue-50/35">
            <CardBody className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-blue-200 bg-white p-2.5 text-blue-700">
                  <Compass size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950">Start from Scratch</h2>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                    Use when starting a new mission, workshop, or advisory planning exercise.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => onNavigateToStep(2)}
                className="mt-auto w-full gap-1.5 font-bold"
              >
                Open Profile / Context Setup
                <ArrowRight size={14} />
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-blue-700">
                  <Globe size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950">Browse Mission Explorer</h2>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                    Review selected starter profiles, fictional training scenarios, and current UN Peacekeeping reference entries.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={onOpenExplorer}
                className="mt-auto w-full gap-1.5 border-blue-200 bg-white font-bold text-blue-700 hover:bg-blue-50"
              >
                Open Mission Explorer
                <Globe size={14} />
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950">Load Demo Template</h2>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                    Load demonstration material to understand the workflow quickly. Demo content is not country analysis.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={onLoadDemoTemplate}
                className="mt-auto w-full gap-1.5 bg-white font-bold text-slate-700"
              >
                Load Demonstration Data
                <FileText size={14} />
              </Button>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-950">How the workflow works</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Move left to right, then revisit earlier steps as evidence improves.
            </p>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {workflowSteps.map((step, index) => (
              <div key={step} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
                  {index + 1}
                </span>
                <p className="mt-3 text-xs font-bold leading-snug text-slate-800">{step}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card className="border-slate-200 bg-slate-900 text-white">
          <CardBody className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black">Output preview</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                The workspace produces an exportable planning brief with mission context, PESTEL-S prompts, stakeholder analysis, CBD priorities, sequencing notes, evidence gaps, and warnings.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200">
              <FileText size={15} />
              Markdown · Print · JSON
            </div>
          </CardBody>
        </Card>
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

  const continueStep = isProfileEmpty
    ? 2
    : isPestelsEmpty
      ? 3
      : isStakeholdersEmpty
        ? 4
        : isCustomCellsEmpty
          ? 5
          : 7;

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
              <Badge variant="blue">Planning Overview</Badge>
              {isDemoTemplate ? (
                <Badge variant="amber">Demonstration material</Badge>
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
              Continue refining the context, evidence base, stakeholder assumptions, CBD priorities, and export readiness. Ratings and findings remain analytical judgments requiring review.
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
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(3)} className="text-[11px] font-bold text-blue-600 py-0.5 px-2">
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
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(4)} className="text-[11px] font-bold text-blue-600 py-0.5 px-2">
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
                Scored Matrix Priorities (Top 5)
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
                  <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(2)} className="text-[10px] font-bold text-blue-600 p-0 hover:bg-transparent leading-none">
                    Fix &rarr;
                  </Button>
                )}
                {warn.category === 'pestels' && (
                  <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(3)} className="text-[10px] font-bold text-blue-600 p-0 hover:bg-transparent leading-none">
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
            { label: 'Complete Profile', step: 2 },
            { label: 'Review PESTEL-S', step: 3 },
            { label: 'Open Stakeholder Map', step: 4 },
            { label: 'Open CBD Matrix', step: 5 },
            { label: 'Review Export Brief', step: 7 }
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
