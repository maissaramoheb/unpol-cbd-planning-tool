import React, { useRef, useState } from 'react';
import { UnpolProjectData } from '../types';
import { generateMarkdownBrief, copyToClipboard } from '../lib/exportMarkdown';
import { exportProjectData, importProjectData } from '../lib/storage';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { calculateQualityWarnings } from '../lib/warnings';
import { FileDown, FileUp, Clipboard, Printer, Check, AlertTriangle, ShieldAlert, AlertCircle } from 'lucide-react';
import { evaluateCbdCell } from '../lib/scoring';

interface ExportBriefProps {
  data: UnpolProjectData;
  onImportSuccess: (importedData: UnpolProjectData) => void;
  onPrev: () => void;
}

export const ExportBrief: React.FC<ExportBriefProps> = ({
  data,
  onImportSuccess,
  onPrev
}) => {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const warnings = calculateQualityWarnings(data);
  const prioritizedCells = Object.entries(data.customCells)
    .map(([key, cell]) => {
      const assessment = evaluateCbdCell(cell);
      return { key, cell, assessment };
    })
    .sort((a, b) => b.assessment.score - a.assessment.score);

  // Gather all Evidence Notes
  const allEvidenceNotes: { title: string; type: string; confidence: number; date: string; comment: string; item: string }[] = [];
  
  Object.values(data.pestels).forEach(p => {
    p.evidenceNotes?.forEach(note => {
      allEvidenceNotes.push({
        title: note.sourceTitle,
        type: note.sourceType,
        confidence: note.confidenceLevel,
        date: note.dateVerified,
        comment: note.comment,
        item: `PESTEL-S: ${p.name}`
      });
    });
  });

  data.stakeholders.forEach(s => {
    s.evidenceNotes?.forEach(note => {
      allEvidenceNotes.push({
        title: note.sourceTitle,
        type: note.sourceType,
        confidence: note.confidenceLevel,
        date: note.dateVerified,
        comment: note.comment,
        item: `Stakeholder: ${s.name}`
      });
    });
  });

  Object.keys(data.customCells).forEach(key => {
    const cell = data.customCells[key];
    cell.evidenceNotes?.forEach(note => {
      allEvidenceNotes.push({
        title: note.sourceTitle,
        type: note.sourceType,
        confidence: note.confidenceLevel,
        date: note.dateVerified,
        comment: note.comment,
        item: `CBD Cell: ${key}`
      });
    });
  });

  // Stakeholder Quadrants
  const mapAQuadrants = {
    "High-influence allies": data.stakeholders.filter(s => (s.position === 'Enabler' || s.position === 'Persuadable') && s.influence === 'High'),
    "High-influence resistance / sensitive": data.stakeholders.filter(s => (s.position === 'Blocker' || s.position === 'Spoiler risk') && s.influence === 'High'),
    "Potential support base": data.stakeholders.filter(s => (s.position === 'Enabler' || s.position === 'Persuadable' || s.position === 'Neutral / unknown') && s.influence !== 'High'),
    "Monitor / low immediate engagement": data.stakeholders.filter(s => (s.position === 'Blocker' || s.position === 'Spoiler risk' || s.position === 'Neutral / unknown') && s.influence !== 'High')
  };

  const mapBQuadrants = {
    "Core institutional partners": data.stakeholders.filter(s => s.legitimacy === 'High' && s.relevance === 'High'),
    "Operationally relevant actors": data.stakeholders.filter(s => s.legitimacy !== 'High' && s.relevance === 'High'),
    "Legitimacy / accountability voices": data.stakeholders.filter(s => s.legitimacy === 'High' && s.relevance !== 'High'),
    "Lower-priority monitoring": data.stakeholders.filter(s => s.legitimacy !== 'High' && s.relevance !== 'High')
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdownBrief(data);
    const success = await copyToClipboard(md);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    exportProjectData(data);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg(null);
      const parsed = await importProjectData(file);
      onImportSuccess(parsed);
      alert('Project configuration successfully restored!');
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || 'Failed to parse JSON project file.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Introduction & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">6. Export Planning Brief</h3>
          <p className="text-sm text-slate-500 mt-1">
            Export the completed planning brief to Markdown or print layout, or save/restore the full project JSON.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleCopyMarkdown} className="font-semibold text-slate-700">
            {copied ? (
              <>
                <Check size={14} className="mr-1.5 text-emerald-600 animate-scale" />
                Copied Markdown
              </>
            ) : (
              <>
                <Clipboard size={14} className="mr-1.5" />
                Copy Markdown
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint} className="font-semibold text-slate-700">
            <Printer size={14} className="mr-1.5" />
            Print Brief
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownloadJSON} className="font-semibold text-slate-700">
            <FileDown size={14} className="mr-1.5 text-blue-600" />
            Save JSON
          </Button>

          <Button variant="outline" size="sm" onClick={handleUploadClick} className="font-semibold text-slate-700">
            <FileUp size={14} className="mr-1.5 text-indigo-600" />
            Upload JSON
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Structured Planning Brief Preview */}
      <Card className="print:border-0 print:shadow-none bg-white p-6 md:p-8 max-w-4xl mx-auto shadow-sm border border-slate-200">
        <div className="print-area flex flex-col gap-6 font-sans text-slate-800">
          {/* Document Header */}
          <div className="border-b-4 border-slate-900 pb-6 flex flex-col gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 tracking-tight">
                Unofficial UNPOL CBD Planning Brief
              </h2>
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase block mt-1">
                Contextual Development & Advisory Framework
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-slate-50 print:border-slate-200">
              <div>
                <span className="font-extrabold text-[9px] text-slate-400 uppercase tracking-wider block">Country</span>
                <span className="font-bold text-slate-800">{data.profile.countryName || 'N/A'}</span>
              </div>
              <div>
                <span className="font-extrabold text-[9px] text-slate-400 uppercase tracking-wider block">Mission / Institution</span>
                <span className="font-bold text-slate-800">{data.profile.missionName || 'N/A'}</span>
              </div>
              <div>
                <span className="font-extrabold text-[9px] text-slate-400 uppercase tracking-wider block">Area of Operations</span>
                <span className="font-bold text-slate-800">{data.profile.region || 'N/A'}</span>
              </div>
              <div>
                <span className="font-extrabold text-[9px] text-slate-400 uppercase tracking-wider block">Prepared By</span>
                <span className="font-bold text-slate-800">{data.profile.analystName || 'UNPOL Advisory Team'}</span>
              </div>
              <div>
                <span className="font-extrabold text-[9px] text-slate-400 uppercase tracking-wider block">Assessment Date</span>
                <span className="font-bold text-slate-800">{data.profile.assessmentDate || 'N/A'}</span>
              </div>
              <div>
                <span className="font-extrabold text-[9px] text-slate-400 uppercase tracking-wider block">Context Source</span>
                <span className="font-bold text-slate-800">
                  {data.profile.templateId === 'blank'
                    ? 'Started Blank'
                    : data.profile.templateId?.startsWith('seed-')
                      ? `Mission Explorer (${data.profile.templateId.replace('seed-', '').toUpperCase()})`
                      : data.profile.templateId?.startsWith('fictional-')
                        ? `Fictional Scenario (${data.profile.templateId.replace('fictional-', '').toUpperCase()})`
                        : `Template (${data.profile.templateId || 'Unknown'})`}
                </span>
              </div>
              <div>
                <span className="font-extrabold text-[9px] text-slate-400 uppercase tracking-wider block">Version</span>
                <span className="font-bold text-slate-850 text-slate-900">v0.3.0 — Visual Workspace & Mission Explorer Upgrade</span>
              </div>
            </div>
          </div>

          {/* Section 1: Country Profile */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
              1. Country / Mission Profile Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs leading-relaxed">
              {[
                { label: 'Host-State Police Institution', val: data.profile.hostStatePolice },
                { label: 'Planning Objective', val: data.profile.planningPurpose },
                { label: 'Mandate Environment', val: data.profile.mandateEnvironment },
                { label: 'Conflict Context', val: data.profile.conflictContext }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-slate-400 uppercase text-[9px] tracking-tight">{item.label}</span>
                  <span className="text-slate-800 font-semibold">{item.val || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Executive Summary */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-2">
              2. Executive Summary
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              This capacity-building and development (CBD) brief provides a structured alignment between the host-state environmental pressures, critical stakeholders, and targeted police development priority areas. It is designed to guide UNPOL advisors in sequencing training, administrative reforms, and legal interventions.
            </p>
          </div>

          {/* Section 3: PESTEL-S Findings */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
              3. Key PESTEL-S Situational Findings
            </h3>
            <div className="flex flex-col gap-4 text-xs">
              {Object.values(data.pestels).map((p) => (
                <div key={p.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-lg flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                    <span className="font-extrabold text-slate-900 uppercase tracking-tight text-[10px]">
                      {p.name}
                    </span>
                    <Badge variant={p.rating.impact >= 4 ? 'rose' : 'slate'}>
                      Impact: {p.rating.impact}/5 | Urgency: {p.rating.urgency}/5
                    </Badge>
                  </div>
                  <p className="text-slate-700"><span className="font-bold text-slate-500 mr-1">Diagnosis:</span>{p.finding}</p>
                  <p className="text-slate-600 italic"><span className="font-semibold text-slate-500 not-italic mr-1">Why it matters:</span>{p.why}</p>
                  <p className="text-slate-500"><span className="font-bold text-slate-400 mr-1">Sequencing:</span>{p.sequencing}</p>
                </div>
              ))}
            </div>
          </div>          {/* Section 4: Stakeholder Quadrant Summary */}
          <div className="page-break-inside-avoid">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
              4. Stakeholder Map Quadrant Summary
            </h3>
            
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Influence &times; Support Posture</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
              {Object.entries(mapAQuadrants).map(([quadName, list]) => (
                <div key={quadName} className="border border-slate-150 rounded-lg overflow-hidden bg-slate-50/20">
                  <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-150 font-bold uppercase text-[9px] text-slate-600 tracking-wider leading-snug">
                    {quadName}
                  </div>
                  <div className="p-2 flex flex-col gap-1 bg-white">
                    {list.length === 0 ? (
                      <span className="text-slate-450 italic text-[10px] px-1">No stakeholders mapped</span>
                    ) : (
                      list.map(s => (
                        <div key={s.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-1.5 rounded text-[11px]">
                          <span className="font-semibold text-slate-800">{s.name}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Inf: {s.influence}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Legitimacy &times; Operational Relevance</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(mapBQuadrants).map(([quadName, list]) => (
                <div key={quadName} className="border border-slate-150 rounded-lg overflow-hidden bg-slate-50/20">
                  <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-150 font-bold uppercase text-[9px] text-slate-650 tracking-wider leading-snug">
                    {quadName}
                  </div>
                  <div className="p-2 flex flex-col gap-1 bg-white">
                    {list.length === 0 ? (
                      <span className="text-slate-450 italic text-[10px] px-1">No stakeholders mapped</span>
                    ) : (
                      list.map(s => (
                        <div key={s.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-1.5 rounded text-[11px]">
                          <span className="font-semibold text-slate-800">{s.name}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Rel: {s.relevance}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Matrix Priorities */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
              5. Priority CBD Matrix Intersections
            </h3>
            <div className="flex flex-col gap-4 text-xs">
              {Object.keys(data.customCells).length === 0 ? (
                <p className="text-slate-400 italic">No specific intersections configured with customized actions in Step 5.</p>
              ) : (
                prioritizedCells.map(({ key, cell, assessment }) => {
                  const [row, col] = key.split('|');
                  return (
                    <div key={key} className="p-4 border border-slate-200 rounded-xl flex flex-col gap-2.5 bg-white page-break-inside-avoid">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-black text-slate-900 text-[10px] uppercase">
                          {row} &times; {col}
                        </span>
                        <div className="flex gap-1">
                          <Badge variant="blue">Computed Priority: {assessment.score.toFixed(1)}/5</Badge>
                          <Badge variant="slate">{assessment.classification}</Badge>
                          <Badge variant="slate">Confidence: {cell.confidence}/5</Badge>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed"><span className="font-bold text-slate-500 mr-1">Intersection Rationale:</span>{cell.why}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] leading-relaxed">
                        <div><span className="font-extrabold text-slate-500 block uppercase text-[9px] mb-1">Individual Action</span>{cell.individual}</div>
                        <div><span className="font-extrabold text-slate-500 block uppercase text-[9px] mb-1">Organizational Action</span>{cell.organizational}</div>
                        <div><span className="font-extrabold text-slate-500 block uppercase text-[9px] mb-1">Enabling Env Action</span>{cell.environment}</div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-400 font-extrabold uppercase tracking-wider pt-1 border-t border-slate-100/60">
                        <span>Feasibility: {assessment.inputs.feasibility}/5</span>
                        <span>Risk rating: {assessment.inputs.risk}/5</span>
                        <span>Stakeholder support: {assessment.inputs.stakeholderSupport}/5</span>
                      </div>

                      <div className="text-[11px] text-slate-600 flex flex-col gap-1 border-t border-slate-100 pt-2">
                        <p><span className="font-bold text-slate-500 mr-1">Indicators:</span>{cell.indicators?.join('; ') || 'None'}</p>
                        <p><span className="font-bold text-slate-500 mr-1">Sequencing:</span>{cell.sequencing}</p>
                        <p><span className="font-bold text-rose-600 mr-1">Risks:</span>{cell.risks}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 6: Sequencing & Groups */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
              6. Strategic Sequencing Groups
            </h3>
            <div className="flex flex-col gap-3 text-xs leading-relaxed">
              {[
                { label: 'Top 3 CBD Priorities', list: data.priorityBrief.topPriorities },
                { label: 'Quick Wins (High Feasibility, Low Risk)', list: data.priorityBrief.quickWins },
                { label: 'Sensitive Reforms (Requires Political Cover)', list: data.priorityBrief.sensitiveReforms },
                { label: 'Longer-Term Reforms', list: data.priorityBrief.longerTermReforms },
                { label: 'Risks & Planning Assumptions', list: data.priorityBrief.risksAssumptions }
              ].map(({ label, list }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="font-bold text-slate-800">{label}:</span>
                  <ul className="list-disc pl-5 text-slate-600 space-y-0.5">
                    {list?.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              ))}

              <div className="flex flex-col gap-1 mt-2 p-3 bg-blue-50/30 border border-blue-100 rounded-lg">
                <span className="font-bold text-blue-950">Recommended Sequencing Pathway:</span>
                <p className="text-blue-900 italic font-semibold">{data.priorityBrief.sequencingRecommendation}</p>
              </div>
            </div>
          </div>

          {/* Section 7: Strategic Quality Warnings */}
          {warnings.length > 0 && (
            <div className="page-break-inside-avoid">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
                7. Planning Quality-Control Cautions
              </h3>
              <div className="flex flex-col gap-2 text-xs">
                {warnings.map((warn, idx) => (
                  <div key={idx} className="p-2.5 border border-slate-200 bg-slate-50 text-slate-700 rounded-lg flex items-start gap-2 leading-relaxed">
                    <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <span>{warn.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 8: Evidence & Source Verification Index */}
          {allEvidenceNotes.length > 0 && (
            <div className="page-break-inside-avoid">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
                8. Evidence & Source Verification Index
              </h3>
              <div className="flex flex-col gap-2.5 text-xs">
                {allEvidenceNotes.map((note, idx) => (
                  <div key={idx} className="p-3 border border-slate-150 bg-slate-50/20 rounded-xl flex flex-col gap-1.5 page-break-inside-avoid">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-slate-900">{idx + 1}. {note.title}</span>
                      <Badge variant="blue" className="text-[9px] uppercase tracking-wider">{note.type}</Badge>
                    </div>
                    {note.comment && <p className="text-slate-600 bg-white border border-slate-100 p-2 rounded-lg italic leading-relaxed">&ldquo;{note.comment}&rdquo;</p>}
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                      Attached to: {note.item} | Confidence: {note.confidence}/5 | Verified: {note.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 9: Planning Assumptions & Limitations */}
          <div className="page-break-inside-avoid">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5 mb-3">
              9. Planning Assumptions & Limitations
            </h3>
            <div className="text-xs text-slate-650 flex flex-col gap-2 leading-relaxed">
              <p>• **Counterpart Ownership**: The successful execution of capacity-building reforms assumes host-state leadership maintains a baseline commitment to professionalization and structural institutional changes.</p>
              <p>• **Security Environment**: This planning sequence assumes that minimum security stability is maintained. Drastic escalation of conflict may require suspending capacity building in favor of emergency operations.</p>
              <p>• **Information Freshness**: The validity of this plan depends on the verifying dates logged in the Evidence Index. Users must review and update source logs as host-state conditions evolve.</p>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="mt-8 pt-4 border-t-2 border-slate-300 text-[10px] text-slate-400 italic leading-relaxed page-break-inside-avoid">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold mb-1 uppercase tracking-wider">
              <ShieldAlert size={12} className="text-amber-500" />
              <span>Advisory Disclaimer</span>
            </div>
            This tool is an educational and planning-support prototype. It is not official United Nations doctrine and does not replace mission mandate, official guidance, host-state law, human rights due diligence, command approval, or verified country analysis. Users should verify all context-specific findings through official and current sources before operational or policy use.
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center gap-3">
        <Button variant="outline" onClick={onPrev}>
          Back: Priority & Sequencing
        </Button>
      </div>
    </div>
  );
};
