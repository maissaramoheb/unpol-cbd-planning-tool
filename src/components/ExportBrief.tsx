'use client';

import React, { useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, Clipboard, FileDown, FileText, FileUp, Printer } from 'lucide-react';
import type { UnpolProjectData } from '../types';
import { generateMarkdownBrief, copyToClipboard } from '../lib/exportMarkdown';
import { exportProjectData, importProjectData } from '../lib/storage';
import { buildPlanningBriefModel, ADVISORY_NOTE, type ReportPriority } from '../lib/reportModel';
import { downloadPlanningBriefDocx } from '../lib/exportDocx';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ExportBriefProps {
  data: UnpolProjectData;
  onImportSuccess: (importedData: UnpolProjectData) => void;
  onPrev: () => void;
}

const SectionTitle = ({ number, children }: { number?: string; children: React.ReactNode }) => (
  <h2 className="report-section-title">
    {number ? <span>{number}</span> : null}{children}
  </h2>
);

const Empty = ({ children = 'Not recorded.' }: { children?: React.ReactNode }) => (
  <p className="report-empty">{children}</p>
);

const BulletList = ({ items, empty }: { items: string[]; empty?: string }) => items.length ? (
  <ul className="report-list">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
) : <Empty>{empty}</Empty>;

const ReportPage = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`report-page ${className}`}>{children}</section>
);

const PriorityCard = ({ priority }: { priority: ReportPriority }) => {
  const inputs = priority.assessment.inputs;
  return (
    <article className="priority-package">
      <header>
        <div><span>Priority {priority.number}</span><h3>{priority.title}</h3></div>
        <p>{priority.row} × {priority.column}</p>
      </header>
      <div className="priority-rationale"><strong>Capacity problem / gap</strong><p>{priority.cell.capacityProblem || 'Not yet defined'}</p></div>
      <div className="priority-rationale"><strong>Planning objective</strong><p>{priority.cell.planningObjective || 'Not yet defined'}</p></div>
      <div className="priority-rationale"><strong>Planning need / rationale</strong><p>{priority.cell.why || 'Not recorded.'}</p></div>
      <div className="priority-meta">
        <div><strong>Evidence basis</strong><p>{priority.evidenceIds.join(' · ') || 'No linked evidence recorded'}</p></div>
        <div><strong>Evidence confidence</strong><p>{inputs.confidenceLevel}/5</p></div>
      </div>
      <div className="intervention-grid">
        <div><strong>Individual</strong><p>{priority.cell.individual || 'Not recorded.'}</p></div>
        <div><strong>Organizational</strong><p>{priority.cell.organizational || 'Not recorded.'}</p></div>
        <div><strong>Enabling environment</strong><p>{priority.cell.environment || 'Not recorded.'}</p></div>
      </div>
      <div className="priority-meta">
        <div><strong>Key stakeholders</strong><p>{priority.stakeholders.map(item => item.name).join('; ') || 'No linked stakeholders recorded'}</p></div>
        <div><strong>Implementation conditions</strong><p>Feasibility {inputs.feasibility}/5 · Support {inputs.stakeholderSupport}/5 · Risk {inputs.risk}/5 · Indicative priority {priority.assessment.score.toFixed(1)}/5</p></div>
      </div>
      <div className="priority-meta">
        <div><strong>Responsibility</strong><p>Lead: {priority.leadStakeholder?.name || 'Not assigned'}<br />Support: {priority.supportingStakeholders.map(item => item.name).join('; ') || 'None assigned'}</p></div>
        <div><strong>Implementation phase</strong><p>{priority.cell.implementationPhase || 'Not assigned'}{priority.cell.milestoneTimeframe ? ` · ${priority.cell.milestoneTimeframe}` : ''}</p></div>
      </div>
      <div className="priority-footer">
        <div><strong>Indicators</strong><BulletList items={priority.cell.indicators || []} /></div>
        <div><strong>Risks</strong><p>{priority.cell.risks || 'Not recorded.'}</p></div>
        <div><strong>Recommended sequencing</strong><p>{priority.cell.sequencing || 'Not recorded.'}</p></div>
      </div>
    </article>
  );
};

export const ExportBrief: React.FC<ExportBriefProps> = ({ data, onImportSuccess, onPrev }) => {
  const [copied, setCopied] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const model = useMemo(() => buildPlanningBriefModel(data), [data]);
  const p = data.profile;

  const handleCopyMarkdown = async () => {
    const success = await copyToClipboard(generateMarkdownBrief(data));
    if (success) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleWord = async () => {
    try {
      setErrorMsg(null);
      setExportingWord(true);
      await downloadPlanningBriefDocx(model);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to generate the Word brief.');
    } finally {
      setExportingWord(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setErrorMsg(null);
      onImportSuccess(await importProjectData(file));
      alert('Project configuration successfully restored!');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to parse JSON project file.');
    } finally {
      event.target.value = '';
    }
  };

  const documentInfo = [
    ['Country / Context', p.countryName], ['Mission / Institution', p.missionName], ['Area of Operations', p.region],
    ['Planning Purpose', p.planningPurpose], ['Prepared By', p.analystName || 'Participant / Team'],
    ['Assessment Date', p.assessmentDate], ['Context Source', model.contextSource],
    ['Source Review / Verification', p.profileLastReviewed || 'Not independently verified'],
    ['Application Version', model.version], ['Document Status', model.status]
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="export-toolbar flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div><h3 className="text-lg font-bold text-slate-950">7. Export Planning Brief</h3><p className="mt-1 text-sm text-slate-500">Create an editable Word brief, professional print/PDF document, Markdown copy, or JSON workspace backup.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleWord} disabled={exportingWord}><FileText size={14} className="mr-1.5 text-blue-700" />{exportingWord ? 'Creating Word…' : 'Download Word'}</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer size={14} className="mr-1.5" />Print / PDF</Button>
          <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>{copied ? <Check size={14} className="mr-1.5 text-emerald-600" /> : <Clipboard size={14} className="mr-1.5" />}{copied ? 'Copied Markdown' : 'Copy Markdown'}</Button>
          <Button variant="outline" size="sm" onClick={() => exportProjectData(data)}><FileDown size={14} className="mr-1.5" />Save JSON</Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><FileUp size={14} className="mr-1.5" />Upload JSON</Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      <p className="print-note rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-950 print:hidden">For PDF, use the browser print dialog with A4 paper, default margins, background graphics enabled, and browser-generated headers/footers disabled. Browser URL/date headers are controlled by the browser, not this application.</p>
      {errorMsg ? <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 print:hidden"><AlertTriangle size={16} />{errorMsg}</div> : null}

      <Card className="report-shell mx-auto w-full max-w-[210mm] overflow-hidden border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none">
        <div className="professional-report">
          <ReportPage className="report-cover">
            <div className="report-kicker">Capacity-Building & Development Planning Support</div>
            <h1>UNPOL CBD<br />PLANNING BRIEF</h1>
            <div className="document-status">{model.status}</div>
            <div className="document-info">{documentInfo.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || 'Not recorded'}</strong></div>)}</div>
            <SectionTitle number="01">Executive Planning Summary</SectionTitle>
            <div className="executive-grid">
              <div><h3>Primary CBD Priorities</h3><BulletList items={data.priorityBrief.topPriorities.filter(Boolean).length ? data.priorityBrief.topPriorities.filter(Boolean) : model.priorities.map(item => item.title)} empty="No priorities recorded." /></div>
              <div><h3>Immediate Planning Recommendation</h3><p>{data.priorityBrief.sequencingRecommendation || 'No sequencing recommendation recorded.'}</p></div>
              <div><h3>Critical Constraints / Risks</h3><BulletList items={data.priorityBrief.risksAssumptions.slice(0, 4)} empty="No constraints recorded." /></div>
              <div><h3>Priority Evidence Gaps</h3><BulletList items={model.evidenceGaps.slice(0, 4)} empty="No priority gap derived from the recorded fields." /></div>
            </div>
            <div className="planning-judgement"><h3>Overall Planning Judgement</h3><p>{model.overallJudgement}</p></div>
          </ReportPage>

          <ReportPage><SectionTitle number="02">Context & Key Evidence</SectionTitle><div className="context-grid"><div><h3>Mandate environment</h3><p>{p.mandateEnvironment || 'Not recorded.'}</p></div><div><h3>Police institution</h3><p>{p.hostStatePolice || 'Not recorded.'}</p></div><div className="context-wide"><h3>Conflict context</h3><p>{p.conflictContext || 'Not recorded.'}</p></div></div><h3 className="report-subtitle">Decision-Relevant PESTEL-S Findings</h3><div className="pestels-report-grid">{model.selectedPestels.map(item => <article key={item.id}><header><strong>{item.name}</strong><span>I {item.rating.impact}/5 · U {item.rating.urgency}/5 · C {item.rating.confidence}/5</span></header><p>{item.finding}</p><small><b>Why:</b> {item.why}</small><small><b>Evidence:</b> {item.evidenceNotes?.map(note => model.evidence.find(evidence => evidence.noteId === note.id)?.id).filter(Boolean).join(' · ') || 'No linked reference'}</small></article>)}</div></ReportPage>

          <ReportPage><SectionTitle number="03">Stakeholder Landscape</SectionTitle><div className="stakeholder-report-grid"><div><h3>Critical institutional actors</h3><BulletList items={model.stakeholderAnalysis.insights.leadershipLevel.slice(0, 6).map(item => `${item.name} — ${item.role}`)} /></div><div><h3>High-influence allies</h3><BulletList items={model.stakeholderAnalysis.engagementQuadrants.find(item => item.id === 'high-influence-allies')?.stakeholders.map(item => item.name) || []} /></div><div><h3>Resistance / sensitive actors</h3><BulletList items={model.stakeholderAnalysis.engagementQuadrants.find(item => item.id === 'high-influence-resistance')?.stakeholders.map(item => `${item.name} — ${item.risk}`) || []} empty="None recorded in this category." /></div><div><h3>Legitimacy / accountability voices</h3><BulletList items={model.stakeholderAnalysis.insights.legitimacyConsultation.slice(0, 6).map(item => item.name)} /></div></div><h3 className="report-subtitle">Key Engagement Implications</h3><BulletList items={model.stakeholderAnalysis.insights.technicalWorkingGroups.slice(0, 6).map(item => `${item.name}: ${item.engagement}`)} /><p className="method-note">Stakeholder ratings are analytical judgements and require current evidence, mandate review, and counterpart consultation.</p></ReportPage>

          <ReportPage><SectionTitle number="04">CBD Priorities</SectionTitle>{model.priorities.slice(0, 2).map(priority => <PriorityCard key={priority.key} priority={priority} />)}{!model.priorities.length ? <Empty>No customized CBD priorities recorded.</Empty> : null}</ReportPage>
          <ReportPage><SectionTitle number="05">CBD Priorities — Continued</SectionTitle>{model.priorities.slice(2, 4).map(priority => <PriorityCard key={priority.key} priority={priority} />)}{model.priorities.length <= 2 ? <Empty>No additional priorities recorded.</Empty> : null}<p className="method-note"><b>Prototype planning heuristic — not UN doctrine.</b> Scores support discussion and do not replace evidence, mandate review, consultation, or professional judgement.</p></ReportPage>

          <ReportPage><SectionTitle number="06">Sequencing & Implementation Pathway</SectionTitle><div className="sequence-path"><div><span>NOW</span><h3>Immediate / enabling actions</h3><BulletList items={data.priorityBrief.quickWins} /></div><div><span>NEXT</span><h3>Follow-on / demanding reforms</h3><BulletList items={data.priorityBrief.sensitiveReforms} /></div><div><span>LATER</span><h3>Longer-term / structural changes</h3><BulletList items={data.priorityBrief.longerTermReforms} /></div></div><div className="planning-judgement"><h3>Recorded Sequencing Recommendation</h3><p>{data.priorityBrief.sequencingRecommendation || 'No sequencing recommendation recorded.'}</p></div></ReportPage>

          <ReportPage><SectionTitle number="07">Monitoring, Evidence Gaps & Planning Controls</SectionTitle><div className="controls-grid"><div><h3>Monitoring indicators</h3><BulletList items={model.priorities.flatMap(item => item.cell.indicators.map(indicator => `${item.number}: ${indicator}`)).slice(0, 12)} /></div><div><h3>Critical evidence gaps</h3><BulletList items={model.evidenceGaps} empty="No critical gap derived from recorded fields." /></div><div><h3>Assumptions requiring validation</h3><BulletList items={data.priorityBrief.risksAssumptions} /></div><div><h3>Quality-control flags</h3><BulletList items={model.warnings.slice(0, 6).map(item => item.message)} empty="No active quality-control warnings." /></div></div><div className="advisory-note"><strong>Limitations / Advisory Note</strong><p>{ADVISORY_NOTE}</p></div></ReportPage>

          <ReportPage className="report-annex"><SectionTitle>Annex A · Full PESTEL-S Analysis</SectionTitle>{Object.values(data.pestels).map(item => <article key={item.id}><h3>{item.name}</h3><p>{item.finding || 'No finding recorded.'}</p><small><b>Why:</b> {item.why || 'Not recorded.'}</small><small><b>Sequencing:</b> {item.sequencing || 'Not recorded.'}</small></article>)}</ReportPage>
          <ReportPage className="report-annex"><SectionTitle>Annex B · Stakeholder Register</SectionTitle><div className="report-table-wrap"><table><thead><tr><th>Actor</th><th>Category / Role</th><th>Influence</th><th>Position</th><th>Risk / Engagement</th></tr></thead><tbody>{data.stakeholders.map(item => <tr key={item.id}><td>{item.name}</td><td>{item.category}<br /><small>{item.role}</small></td><td>{item.influence}</td><td>{item.position}</td><td>{item.risk}<br /><small><b>Engage:</b> {item.engagement}</small></td></tr>)}</tbody></table></div></ReportPage>
          <ReportPage className="report-annex"><SectionTitle>Annex C · Evidence & Source Register</SectionTitle>{model.evidence.length ? <div className="evidence-register">{model.evidence.map(item => <article key={item.id}><header><strong>{item.id} · {item.title}</strong><span>{item.type}</span></header><p>{item.comment || 'No note recorded.'}</p><small>Confidence {item.confidence}/5 · Reviewed {item.date || 'not recorded'} · Linked to {item.attachedTo}</small></article>)}</div> : <Empty>No evidence sources recorded.</Empty>}</ReportPage>
          <ReportPage className="report-annex"><SectionTitle>Annex D · Full Quality-Control Register</SectionTitle><BulletList items={model.warnings.map(item => item.message)} empty="No active quality-control warnings." /><div className="advisory-note"><strong>Advisory Note</strong><p>{ADVISORY_NOTE}</p></div></ReportPage>
        </div>
      </Card>

      <div className="flex justify-between print:hidden"><Button variant="outline" onClick={onPrev}>Back: Priority & Sequencing</Button></div>
    </div>
  );
};
