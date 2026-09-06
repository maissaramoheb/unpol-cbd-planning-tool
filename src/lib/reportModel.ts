import type { CbdCell, EvidenceNote, PestelsItem, Stakeholder, StrategicOption, SwotFinding, UnpolProjectData } from '../types';
import { evaluateCbdCell, type CbdPriorityAssessment } from './scoring';
import { analyzeStakeholders } from './stakeholderAnalysis';
import { calculateQualityWarnings, type QualityWarning } from './warnings';
import { APP_VERSION_LABEL } from './version';

export const DOCUMENT_STATUS = 'UNOFFICIAL — DRAFT FOR REVIEW';
export const ADVISORY_NOTE = 'This planning-support prototype is unofficial and does not represent an official UN assessment or recommendation. It does not replace mandate review, host-state law, human-rights obligations, due diligence, verified evidence, command approval, consultation, or professional judgement.';

export interface ReportEvidence {
  id: string;
  noteId: string;
  title: string;
  type: string;
  confidence: number;
  date: string;
  comment: string;
  attachedTo: string;
}

export interface ReportPriority {
  key: string;
  number: string;
  title: string;
  row: string;
  column: string;
  cell: CbdCell;
  assessment: CbdPriorityAssessment;
  stakeholders: Stakeholder[];
  leadStakeholder: Stakeholder | null;
  supportingStakeholders: Stakeholder[];
  evidenceIds: string[];
  strategicOptions: StrategicOption[];
}

export interface PlanningBriefModel {
  data: UnpolProjectData;
  contextSource: string;
  version: string;
  status: string;
  evidence: ReportEvidence[];
  selectedPestels: PestelsItem[];
  keySwotFindings: SwotFinding[];
  strategicOptions: StrategicOption[];
  priorities: ReportPriority[];
  warnings: QualityWarning[];
  evidenceGaps: string[];
  stakeholderAnalysis: ReturnType<typeof analyzeStakeholders>;
  overallJudgement: string;
}

export function getContextSource(data: UnpolProjectData): string {
  const id = data.profile.templateId;
  if (id === 'blank') return 'Started blank';
  if (id === 'fictional-carana-demo') return 'CARANA fictional training demonstration';
  if (id?.startsWith('seed-')) return `Mission Explorer (${id.replace('seed-', '').toUpperCase()})`;
  if (id?.startsWith('fictional-')) return `Fictional training scenario (${id.replace('fictional-', '').toUpperCase()})`;
  return `Template (${id || 'unknown'})`;
}

function collectEvidence(data: UnpolProjectData): ReportEvidence[] {
  const items: Array<{ note: EvidenceNote; attachedTo: string }> = [];
  Object.values(data.pestels).forEach(item => item.evidenceNotes?.forEach(note => items.push({ note, attachedTo: `PESTEL-S: ${item.name}` })));
  data.stakeholders.forEach(item => item.evidenceNotes?.forEach(note => items.push({ note, attachedTo: `Stakeholder: ${item.name}` })));
  Object.entries(data.customCells).forEach(([key, item]) => item.evidenceNotes?.forEach(note => items.push({ note, attachedTo: `CBD priority: ${key}` })));
  return items.map(({ note, attachedTo }, index) => ({
    id: `E${String(index + 1).padStart(2, '0')}`,
    noteId: note.id,
    title: note.sourceTitle,
    type: note.sourceType,
    confidence: note.confidenceLevel,
    date: note.dateVerified,
    comment: note.comment,
    attachedTo
  }));
}

function findEvidenceIds(notes: EvidenceNote[] | undefined, evidence: ReportEvidence[]): string[] {
  if (!notes) return [];
  const noteIds = new Set(notes.map(note => note.id));
  return evidence.filter(item => noteIds.has(item.noteId)).map(item => item.id);
}

function buildEvidenceGaps(data: UnpolProjectData, priorities: ReportPriority[]): string[] {
  const gaps: string[] = [];
  Object.values(data.pestels).forEach(item => {
    if (item.rating.impact >= 4 && item.rating.confidence <= 2) gaps.push(`${item.name}: high impact with low confidence (${item.rating.confidence}/5).`);
    if (item.rating.impact >= 4 && !item.evidenceNotes?.length) gaps.push(`${item.name}: high-impact finding has no evidence reference.`);
  });
  priorities.forEach(priority => {
    if (priority.cell.confidence <= 2) gaps.push(`${priority.title}: priority evidence confidence is low (${priority.cell.confidence}/5).`);
    if (!priority.evidenceIds.length) gaps.push(`${priority.title}: no evidence reference is linked to this priority.`);
  });
  if (!data.profile.profileLastReviewed) gaps.push('Context profile has not been independently reviewed or verified.');
  return [...new Set(gaps)].slice(0, 6);
}

export function buildPlanningBriefModel(data: UnpolProjectData): PlanningBriefModel {
  const evidence = collectEvidence(data);
  const priorities = Object.entries(data.customCells)
    .map(([key, cell]) => {
      const [row, column] = key.split('|');
      return { key, row, column, cell, assessment: evaluateCbdCell(cell) };
    })
    .sort((left, right) => right.assessment.score - left.assessment.score)
    .slice(0, 4)
    .map((priority, index): ReportPriority => ({
      ...priority,
      number: String(index + 1).padStart(2, '0'),
      title: `${priority.row} × ${priority.column}`,
      stakeholders: priority.cell.stakeholders
        .map(id => data.stakeholders.find(stakeholder => stakeholder.id === id))
        .filter((stakeholder): stakeholder is Stakeholder => Boolean(stakeholder))
        .slice(0, 5),
      leadStakeholder: data.stakeholders.find(stakeholder => stakeholder.id === priority.cell.leadStakeholderId) || null,
      supportingStakeholders: (priority.cell.supportingStakeholderIds || [])
        .map(id => data.stakeholders.find(stakeholder => stakeholder.id === id))
        .filter((stakeholder): stakeholder is Stakeholder => Boolean(stakeholder)),
      evidenceIds: findEvidenceIds(priority.cell.evidenceNotes, evidence),
      strategicOptions: (priority.cell.strategicOptionIds || [])
        .map(id => data.analysisSynthesis.strategicOptions.find(option => option.id === id))
        .filter((option): option is StrategicOption => Boolean(option))
    }));

  const selectedPestels = Object.values(data.pestels)
    .filter(item => item.finding.trim())
    .sort((left, right) =>
      (right.rating.impact * right.rating.urgency) - (left.rating.impact * left.rating.urgency) ||
      right.rating.relevance - left.rating.relevance
    )
    .slice(0, 4);

  const recordedPriorityTitles = data.priorityBrief.topPriorities
    .filter(Boolean)
    .map(priority => priority.replace(/[.;:\s]+$/g, ''));
  const priorityTitles = recordedPriorityTitles.length
    ? recordedPriorityTitles
    : priorities.map(priority => priority.title);
  const overallJudgement = priorities.length && data.priorityBrief.sequencingRecommendation
    ? `The recorded planning judgement prioritizes ${priorityTitles.join('; ')}. Implementation should follow the workspace sequencing recommendation, with evidence, mandate authority, counterpart ownership, safeguards, and feasibility reviewed before expansion.`
    : 'The workspace does not yet contain enough completed priority and sequencing information for an overall planning judgement. Complete and verify the missing fields before decision use.';

  return {
    data,
    contextSource: getContextSource(data),
    version: APP_VERSION_LABEL,
    status: DOCUMENT_STATUS,
    evidence,
    selectedPestels,
    keySwotFindings: data.analysisSynthesis.swotFindings.filter(item => item.finding.trim()).slice(0, 8),
    strategicOptions: data.analysisSynthesis.strategicOptions.filter(item => item.option.trim()),
    priorities,
    warnings: calculateQualityWarnings(data),
    evidenceGaps: buildEvidenceGaps(data, priorities),
    stakeholderAnalysis: analyzeStakeholders(data.stakeholders),
    overallJudgement
  };
}

export function sanitizeReportFilename(context: string, date: string, extension: 'docx' | 'json'): string {
  const safeContext = context.normalize('NFKD').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60) || 'Planning-Context';
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
  return `UNPOL-CBD-Planning-Brief-${safeContext}-${safeDate}.${extension}`;
}
