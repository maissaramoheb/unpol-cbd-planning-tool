import React from 'react';
import { UnpolProjectData, Stakeholder } from '../types';
import { calculateQualityWarnings } from '../lib/warnings';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { evaluateCbdCell } from '../lib/scoring';
import {
  Shield,
  Users,
  Grid,
  ListTodo,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  Globe
} from 'lucide-react';

interface DashboardProps {
  data: UnpolProjectData;
  onNavigateToStep: (step: number) => void;
  onOpenExplorer: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onNavigateToStep, onOpenExplorer }) => {
  const { profile, pestels, stakeholders, customCells, priorityBrief } = data;

  const warnings = calculateQualityWarnings(data);

  // Determine if it is an empty state
  const isProfileEmpty = !profile.countryName && !profile.missionName;
  const isPestelsEmpty = Object.values(pestels).every(p => p.finding === '');
  const isStakeholdersEmpty = stakeholders.length === 0;
  const isCustomCellsEmpty = Object.keys(customCells).length === 0;

  const isEmptyState = isProfileEmpty && isPestelsEmpty && isStakeholdersEmpty && isCustomCellsEmpty;

  if (isEmptyState) {
    return (
      <div className="flex flex-col gap-6 w-full py-8">
        <Card className="max-w-3xl mx-auto border-blue-100 bg-white shadow-sm p-6 text-center">
          <CardBody className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Shield size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                Unofficial UNPOL CBD Planning Workspace
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-lg mx-auto">
                Welcome to the UNPOL Capacity-Building & Development planning workspace. Your assessment data is currently empty.
              </p>
              <p className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl mt-4 max-w-md mx-auto italic">
                &ldquo;Start by creating a Mission Profile, then complete PESTEL-S and Stakeholder Mapping to populate the dashboard.&rdquo;
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
              <Button
                variant="primary"
                onClick={() => onNavigateToStep(2)}
                className="font-bold flex items-center justify-center gap-1.5"
              >
                Configure Mission Profile
                <ArrowRight size={14} />
              </Button>
              <Button
                variant="outline"
                onClick={onOpenExplorer}
                className="font-semibold text-blue-600 border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 flex items-center justify-center gap-1.5"
              >
                <Globe size={14} className="text-blue-500" />
                Browse Mission Explorer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Would you like to load the UN Peacekeeping starter template to populate the workspace?')) {
                    // This will reset state, but AppShell handles the templates.
                    // We trigger navigation to step 2 where they can select it.
                    onNavigateToStep(2);
                  }
                }}
                className="font-semibold text-slate-700 hover:bg-slate-50"
              >
                Load Demo Template
              </Button>
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

  // --- STAKEHOLDER COORDINATE PLOTS ---
  const getCoordinates = (s: Stakeholder, index: number) => {
    let x = 50;
    let y = 50;
    if (s.position === 'Enabler') x = 80;
    else if (s.position === 'Persuadable') x = 65;
    else if (s.position === 'Neutral / unknown') x = 50;
    else if (s.position === 'Blocker') x = 35;
    else if (s.position === 'Spoiler risk') x = 20;

    if (s.influence === 'High') y = 75;
    else if (s.influence === 'Medium') y = 50;
    else if (s.influence === 'Low') y = 25;

    // Small deterministic jitter based on index
    const jitterX = ((index * 7) % 9) - 4; // -4% to +4%
    const jitterY = ((index * 13) % 9) - 4;

    return { x: Math.max(10, Math.min(90, x + jitterX)), y: Math.max(10, Math.min(90, y + jitterY)) };
  };

  const getMapBCoordinates = (s: Stakeholder, index: number) => {
    let x = 50;
    let y = 50;
    if (s.relevance === 'High') x = 75;
    else if (s.relevance === 'Medium') x = 50;
    else if (s.relevance === 'Low') x = 25;

    if (s.legitimacy === 'High') y = 75;
    else if (s.legitimacy === 'Medium') y = 50;
    else if (s.legitimacy === 'Low') y = 25;

    const jitterX = ((index * 9) % 9) - 4;
    const jitterY = ((index * 17) % 9) - 4;

    return { x: Math.max(10, Math.min(90, x + jitterX)), y: Math.max(10, Math.min(90, y + jitterY)) };
  };

  // Group stakeholders by Map A quadrants
  const mapAQuadrants = {
    allies: stakeholders.filter(s => (s.position === 'Enabler' || s.position === 'Persuadable') && s.influence === 'High'),
    resistance: stakeholders.filter(s => (s.position === 'Blocker' || s.position === 'Spoiler risk') && s.influence === 'High'),
    base: stakeholders.filter(s => (s.position === 'Enabler' || s.position === 'Persuadable' || s.position === 'Neutral / unknown') && s.influence !== 'High'),
    monitor: stakeholders.filter(s => (s.position === 'Blocker' || s.position === 'Spoiler risk' || s.position === 'Neutral / unknown') && s.influence !== 'High')
  };

  // Group stakeholders by Map B quadrants
  const mapBQuadrants = {
    partners: stakeholders.filter(s => s.legitimacy === 'High' && s.relevance === 'High'),
    relevant: stakeholders.filter(s => s.legitimacy !== 'High' && s.relevance === 'High'),
    voices: stakeholders.filter(s => s.legitimacy === 'High' && s.relevance !== 'High'),
    monitoring: stakeholders.filter(s => s.legitimacy !== 'High' && s.relevance !== 'High')
  };

  return (
    <div className="flex flex-col gap-6 w-full">
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <span className="text-xl font-extrabold text-slate-900 leading-tight">{kpi.val}</span>
                <span className="text-[10px] text-slate-500 font-semibold">{kpi.sub}</span>
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
                <p className="text-xs text-slate-400 italic">No findings configured in PESTEL-S step.</p>
              ) : (
                sortedPressures.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50/60 border border-slate-150 rounded-xl flex flex-col gap-1">
                    <div className="flex justify-between items-center w-full gap-2">
                      <span className="font-extrabold text-[11px] text-slate-800 uppercase tracking-tight">{p.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="rose">Pressure: {p.score}/25</Badge>
                        <Badge variant="slate">Confidence: {p.rating.confidence}/5</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1 line-clamp-2">{p.finding}</p>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
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
                <p className="text-xs text-slate-400 italic">No blockers or spoiler risks identified in the actors database.</p>
              ) : (
                stakeholderRisks.map(s => (
                  <div key={s.id} className="p-3 bg-slate-50/60 border border-slate-150 rounded-xl flex flex-col gap-1.5">
                    <div className="flex justify-between items-start w-full gap-2">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block leading-tight">{s.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">{s.category}</span>
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
                <p className="text-xs text-slate-400 italic">No customized matrix intersections defined.</p>
              ) : (
                scoredCells.map(({ key, cell, score }) => (
                  <div key={key} className="p-3 bg-slate-50/60 border border-slate-150 rounded-xl flex flex-col gap-1">
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
                  <span className="text-xs text-slate-400 italic">None configured</span>
                ) : (
                  <ul className="text-xs text-slate-650 flex flex-col gap-1 list-disc pl-4 leading-normal">
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
                  <span className="text-xs text-slate-400 italic">None configured</span>
                ) : (
                  <ul className="text-xs text-slate-650 flex flex-col gap-1 list-disc pl-4 leading-normal">
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
        </CardHeader>
        <CardBody className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map 1: Influence × Support */}
            <div className="flex flex-col gap-3">
              <div className="text-center">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Stakeholder Engagement Matrix</h5>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Influence (Y) &times; Support Posture (X)</span>
              </div>

              {/* Visual 2x2 grid for Desktop/Tablet */}
              <div className="hidden sm:block relative border-2 border-slate-300 w-full aspect-[4/3] rounded-xl bg-slate-50 overflow-hidden shadow-inner mt-2">
                {/* Central Axes */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 border-dashed" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-300 border-dashed" />

                {/* Quadrant Labels */}
                <span className="absolute top-3 left-3 text-[9px] font-black uppercase text-slate-400 max-w-[140px] leading-tight">
                  High-influence resistance
                </span>
                <span className="absolute top-3 right-3 text-[9px] font-black uppercase text-slate-400 max-w-[140px] leading-tight text-right">
                  High-influence allies
                </span>
                <span className="absolute bottom-3 left-3 text-[9px] font-black uppercase text-slate-400 max-w-[140px] leading-tight">
                  Monitor / low engagement
                </span>
                <span className="absolute bottom-3 right-3 text-[9px] font-black uppercase text-slate-400 max-w-[140px] leading-tight text-right">
                  Potential support base
                </span>

                {/* Plot Nodes */}
                {stakeholders.map((s, idx) => {
                  const { x, y } = getCoordinates(s, idx);
                  const isNegative = s.position === 'Blocker' || s.position === 'Spoiler risk';
                  const isPositive = s.position === 'Enabler' || s.position === 'Persuadable';
                  
                  return (
                    <div
                      key={s.id}
                      style={{ left: `${x}%`, bottom: `${y}%` }}
                      className={`
                        absolute -translate-x-1/2 translate-y-1/2 w-4.5 h-4.5 rounded-full flex items-center justify-center cursor-pointer transition-all border shadow-sm group hover:scale-125 hover:z-20
                        ${isNegative
                          ? 'bg-rose-500 border-rose-600 text-white'
                          : isPositive
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'bg-slate-400 border-slate-500 text-white'
                        }
                      `}
                    >
                      <span className="text-[8px] font-black">{idx + 1}</span>

                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg p-2.5 text-[10px] w-48 shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30 leading-normal flex flex-col gap-0.5 border border-slate-700">
                        <span className="font-extrabold block text-white border-b border-slate-700 pb-1 mb-1">{idx + 1}. {s.name}</span>
                        <span>Posture: <strong>{s.position}</strong></span>
                        <span>Influence: <strong>{s.influence}</strong></span>
                        <span>Relevance: <strong>{s.relevance}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile stacked quadrant cards */}
              <div className="block sm:hidden flex flex-col gap-2.5 mt-2">
                {[
                  { title: 'High-influence allies', list: mapAQuadrants.allies, color: 'border-emerald-200 bg-emerald-50/10' },
                  { title: 'High-influence resistance', list: mapAQuadrants.resistance, color: 'border-rose-200 bg-rose-50/10' },
                  { title: 'Potential support base', list: mapAQuadrants.base, color: 'border-blue-200 bg-blue-50/10' },
                  { title: 'Monitor / low immediate engagement', list: mapAQuadrants.monitor, color: 'border-slate-200 bg-slate-50/30' }
                ].map((quad, i) => (
                  <div key={i} className={`p-3 border rounded-xl flex flex-col gap-1.5 ${quad.color}`}>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200/40 pb-1">{quad.title}</span>
                    {quad.list.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No stakeholders assigned</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {quad.list.map(s => (
                          <Badge key={s.id} variant="slate" className="text-[10px]">{s.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Map 2: Legitimacy × Operational Relevance */}
            <div className="flex flex-col gap-3">
              <div className="text-center">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Operational Credibility Map</h5>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Legitimacy (Y) &times; Relevance (X)</span>
              </div>

              {/* Visual 2x2 grid for Desktop/Tablet */}
              <div className="hidden sm:block relative border-2 border-slate-300 w-full aspect-[4/3] rounded-xl bg-slate-50 overflow-hidden shadow-inner mt-2">
                {/* Central Axes */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 border-dashed" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-300 border-dashed" />

                {/* Quadrant Labels */}
                <span className="absolute top-3 left-3 text-[9px] font-black uppercase text-slate-400 max-w-[140px] leading-tight">
                  Legitimacy / accountability voices
                </span>
                <span className="absolute top-3 right-3 text-[9px] font-black uppercase text-slate-400 max-w-[140px] leading-tight text-right">
                  Core institutional partners
                </span>
                <span className="absolute bottom-3 left-3 text-[9px] font-black uppercase text-slate-400 max-w-[140px] leading-tight">
                  Lower-priority monitoring
                </span>
                <span className="absolute bottom-3 right-3 text-[9px] font-black uppercase text-slate-400 max-w-[140px] leading-tight text-right">
                  Operationally relevant actors
                </span>

                {/* Plot Nodes */}
                {stakeholders.map((s, idx) => {
                  const { x, y } = getMapBCoordinates(s, idx);
                  const isCore = s.legitimacy === 'High' && s.relevance === 'High';
                  const isVoice = s.legitimacy === 'High' && s.relevance !== 'High';
                  const isDeFacto = s.legitimacy !== 'High' && s.relevance === 'High';

                  return (
                    <div
                      key={s.id}
                      style={{ left: `${x}%`, bottom: `${y}%` }}
                      className={`
                        absolute -translate-x-1/2 translate-y-1/2 w-4.5 h-4.5 rounded-full flex items-center justify-center cursor-pointer transition-all border shadow-sm group hover:scale-125 hover:z-20
                        ${isCore
                          ? 'bg-blue-600 border-blue-700 text-white'
                          : isVoice
                            ? 'bg-purple-500 border-purple-650 text-white'
                            : isDeFacto
                              ? 'bg-amber-500 border-amber-650 text-white'
                              : 'bg-slate-400 border-slate-500 text-white'
                        }
                      `}
                    >
                      <span className="text-[8px] font-black">{idx + 1}</span>

                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg p-2.5 text-[10px] w-48 shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30 leading-normal flex flex-col gap-0.5 border border-slate-700">
                        <span className="font-extrabold block text-white border-b border-slate-700 pb-1 mb-1">{idx + 1}. {s.name}</span>
                        <span>Legitimacy: <strong>{s.legitimacy}</strong></span>
                        <span>Relevance: <strong>{s.relevance}</strong></span>
                        <span>Capacity: <strong>{s.capacity}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile stacked quadrant cards */}
              <div className="block sm:hidden flex flex-col gap-2.5 mt-2">
                {[
                  { title: 'Core institutional partners', list: mapBQuadrants.partners, color: 'border-blue-200 bg-blue-50/10' },
                  { title: 'Operationally relevant actors', list: mapBQuadrants.relevant, color: 'border-amber-200 bg-amber-50/10' },
                  { title: 'Legitimacy / accountability voices', list: mapBQuadrants.voices, color: 'border-purple-200 bg-purple-50/10' },
                  { title: 'Lower-priority monitoring', list: mapBQuadrants.monitoring, color: 'border-slate-200 bg-slate-50/30' }
                ].map((quad, i) => (
                  <div key={i} className={`p-3 border rounded-xl flex flex-col gap-1.5 ${quad.color}`}>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-200/40 pb-1">{quad.title}</span>
                    {quad.list.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No stakeholders assigned</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {quad.list.map(s => (
                          <Badge key={s.id} variant="slate" className="text-[10px]">{s.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Index Legend */}
          <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2 text-center">Stakeholder Roster Index</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-slate-700">
              {stakeholders.map((s, idx) => (
                <div key={s.id} className="flex gap-1.5 items-center leading-tight truncate">
                  <span className="w-4.5 h-4.5 rounded bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate font-semibold">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
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
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Go to Module:</span>
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
